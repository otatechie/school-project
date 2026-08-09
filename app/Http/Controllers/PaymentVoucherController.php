<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentVoucher\ReviewVoucherRequest;
use App\Http\Requests\PaymentVoucher\StorePaymentVoucherRequest;
use App\Http\Requests\PaymentVoucher\UpdatePaymentVoucherRequest;
use App\Models\Department;
use App\Models\Document;
use App\Models\PaymentVoucher;
use App\Models\User;
use App\Services\ApprovalRouter;
use App\Services\AuditLogger;
use App\Services\LedgerPoster;
use App\Services\Notifier;
use App\Services\VoucherChecks;
use App\Services\VoucherIntelligence;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentVoucherController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PaymentVoucher::class);

        $vouchers = PaymentVoucher::query()
            ->with(['department', 'creator'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');
                $query->where(function ($q) use ($search) {
                    $q->where('voucher_number', 'like', "%{$search}%")
                        ->orWhere('payee_name', 'like', "%{$search}%")
                        ->orWhereHas('department', function ($dq) use ($search) {
                            $dq->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $stats = [
            'total' => PaymentVoucher::count(),
            'pending' => PaymentVoucher::where('status', 'pending')->count(),
            'approved' => PaymentVoucher::where('status', 'approved')->count(),
            'rejected' => PaymentVoucher::where('status', 'rejected')->count(),
            'paid' => PaymentVoucher::where('status', 'paid')->count(),
            'draft' => PaymentVoucher::where('status', 'draft')->count(),
        ];

        return Inertia::render('payment-vouchers/index', [
            'vouchers' => $vouchers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', PaymentVoucher::class);

        return Inertia::render('payment-vouchers/create', [
            'departments' => Department::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function store(StorePaymentVoucherRequest $request): RedirectResponse
    {
        $this->authorize('create', PaymentVoucher::class);

        $voucher = PaymentVoucher::create([
            ...$request->validated(),
            'voucher_number' => $this->generateVoucherNumber(),
            'status' => 'draft',
            'created_by' => $request->user()->id,
        ]);

        AuditLogger::record('voucher.created', "Created voucher {$voucher->voucher_number}.", $voucher);

        return redirect()
            ->route('payment-vouchers.index')
            ->with('success', "Payment voucher {$voucher->voucher_number} created successfully.");
    }

    public function edit(Request $request, PaymentVoucher $voucher)
    {
        $this->authorize('update', $voucher);

        $voucher->load(['department', 'creator', 'documents.uploader:id,name']);

        return Inertia::render('payment-vouchers/edit', [
            'voucher' => $voucher,
            'departments' => Department::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'attachments' => $voucher->documents->map(fn ($document) => [
                'id' => $document->id,
                'name' => $document->name,
                'size' => $document->size,
                'created_at' => $document->created_at,
                'uploader' => $document->uploader?->only(['id', 'name']),
                'can_delete' => $request->user()->can('delete', $document),
            ]),
            'canUpload' => $request->user()->can('create', Document::class),
        ]);
    }

    public function update(UpdatePaymentVoucherRequest $request, PaymentVoucher $voucher): RedirectResponse
    {
        $this->authorize('update', $voucher);

        $voucher->update($request->validated());

        AuditLogger::record('voucher.updated', "Updated voucher {$voucher->voucher_number}.", $voucher);

        return redirect()
            ->route('payment-vouchers.index')
            ->with('success', "Payment voucher {$voucher->voucher_number} updated successfully.");
    }

    public function destroy(PaymentVoucher $voucher): RedirectResponse
    {
        $this->authorize('delete', $voucher);

        $number = $voucher->voucher_number;

        $voucher->delete();

        AuditLogger::record('voucher.deleted', "Deleted draft voucher {$number}.", $voucher);

        return redirect()
            ->route('payment-vouchers.index')
            ->with('success', "Draft voucher {$number} was deleted.");
    }

    public function submit(PaymentVoucher $voucher): RedirectResponse
    {
        $this->authorize('submit', $voucher);

        $voucher->update([
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        $band = app(ApprovalRouter::class)->bandFor($voucher);

        AuditLogger::record(
            'voucher.submitted',
            "Submitted voucher {$voucher->voucher_number} for approval at level {$band['level']} ({$band['label']}).",
            $voucher,
        );

        // Only approvers whose ceiling covers this amount are told about it.
        Notifier::toApproversFor(
            $voucher,
            'voucher.pending',
            "Voucher {$voucher->voucher_number} awaits approval",
            "{$voucher->payee_name} — GHS ".number_format((float) $voucher->amount, 2),
            route('payment-vouchers.pending'),
        );

        return redirect()
            ->route('payment-vouchers.index')
            ->with('success', "Payment voucher {$voucher->voucher_number} submitted for level {$band['level']} ({$band['label']}) approval.");
    }

    public function review(ReviewVoucherRequest $request, PaymentVoucher $voucher): RedirectResponse
    {
        $this->authorize('review', $voucher);

        $action = $request->input('action');

        if ($action === 'approve') {
            $voucher->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);
        } else {
            $voucher->update([
                'status' => 'rejected',
                'rejected_by' => $request->user()->id,
                'rejected_at' => now(),
                'rejection_reason' => $request->input('rejection_reason'),
            ]);
        }

        $past = $action === 'approve' ? 'approved' : 'rejected';

        AuditLogger::record("voucher.{$past}", "Voucher {$voucher->voucher_number} was {$past}.", $voucher);

        Notifier::toUser(
            $voucher->created_by,
            "voucher.{$past}",
            "Voucher {$voucher->voucher_number} was {$past}",
            $action === 'reject' ? $request->input('rejection_reason') : null,
            route('payment-vouchers.index'),
        );

        return redirect()
            ->route('payment-vouchers.index')
            ->with('success', "Payment voucher {$voucher->voucher_number} {$past}.");
    }

    public function markPaid(PaymentVoucher $voucher): RedirectResponse
    {
        $this->authorize('markPaid', $voucher);

        $voucher->update([
            'status' => 'paid',
            'paid_by' => request()->user()->id,
            'paid_at' => now(),
        ]);

        app(LedgerPoster::class)->post($voucher->refresh());

        AuditLogger::record('voucher.paid', "Marked voucher {$voucher->voucher_number} as paid.", $voucher);

        Notifier::toUser(
            $voucher->created_by,
            'voucher.paid',
            "Voucher {$voucher->voucher_number} has been paid",
            'GHS '.number_format((float) $voucher->amount, 2)." to {$voucher->payee_name}",
            route('payment-vouchers.index'),
        );

        return redirect()
            ->route('payment-vouchers.index')
            ->with('success', "Payment voucher {$voucher->voucher_number} marked as paid.");
    }

    public function pending(Request $request, VoucherChecks $checks, ApprovalRouter $router): Response
    {
        $vouchers = PaymentVoucher::query()
            ->with(['department', 'creator'])
            ->where('status', 'pending')
            ->latest()
            ->paginate(10);

        $user = $request->user();

        // Rule-based findings are computed for the whole page: they are cheap,
        // they never fail, and an approver should see them without asking.
        $findings = $vouchers->getCollection()
            ->mapWithKeys(fn (PaymentVoucher $v) => [$v->id => $checks->run($v)])
            ->all();

        // Say plainly which vouchers this approver may release, and why.
        $routing = $vouchers->getCollection()
            ->mapWithKeys(fn (PaymentVoucher $v) => [$v->id => [
                'band' => $router->describe($v),
                'level' => $router->bandFor($v)['level'],
                'canApprove' => $user->can('review', $v),
                'isOwn' => $v->created_by === $user->id,
            ]])
            ->all();

        return Inertia::render('payment-vouchers/pending', [
            'vouchers' => $vouchers,
            'checks' => $findings,
            'routing' => $routing,
            'aiEnabled' => app(VoucherIntelligence::class)->isEnabled(),
        ]);
    }

    public function rejected(): Response
    {
        $vouchers = PaymentVoucher::query()
            ->with(['department', 'creator', 'rejector'])
            ->where('status', 'rejected')
            ->latest()
            ->paginate(10);

        return Inertia::render('payment-vouchers/rejected', [
            'vouchers' => $vouchers,
        ]);
    }

    private function generateVoucherNumber(): string
    {
        $year = date('Y');
        $last = PaymentVoucher::query()
            ->whereYear('created_at', $year)
            ->latest('id')
            ->first();

        $sequence = $last ? (int) substr($last->voucher_number, -3) + 1 : 1;

        return 'PV-'.$year.'-'.str_pad((string) $sequence, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Rule-based checks against unsaved form values, so a preparer sees a
     * duplicate or an out-of-range amount before submitting rather than after.
     *
     * Deterministic and local — no external service is involved.
     */
    public function check(Request $request, VoucherChecks $checks): JsonResponse
    {
        // Preparers use this while filling in the form. It reads only the
        // aggregate history a preparer already sees, so anyone who may raise
        // a voucher may call it; viewers may not.
        abort_unless(
            $request->user()->hasRole(User::ROLE_ADMIN, User::ROLE_FINANCE_OFFICER),
            403,
        );

        $draft = new PaymentVoucher($request->only([
            'payee_name',
            'amount',
            'description',
            'budget_line',
            'department_id',
        ]));

        // An existing voucher must not match itself when editing.
        if ($id = $request->string('voucher_id')->toString()) {
            $draft->exists = true;
            $draft->{$draft->getKeyName()} = $id;
        }

        return response()->json([
            'findings' => $draft->payee_name || $draft->amount ? $checks->run($draft) : [],
            'suggestedBudgetLine' => $checks->suggestBudgetLine($draft->description),
        ]);
    }

    /**
     * AI-assisted review of a pending voucher. The result is advisory only —
     * the approval decision and its audit record remain entirely human.
     */
    public function aiReview(PaymentVoucher $voucher, VoucherIntelligence $ai): JsonResponse
    {
        $this->authorize('review', $voucher);

        $review = $ai->reviewVoucher($voucher);

        if (! $review) {
            return response()->json([
                'available' => false,
                'message' => $ai->isEnabled()
                    ? 'The review service is temporarily unavailable. Approve or reject using your own judgement.'
                    : 'AI review is not configured on this deployment.',
            ]);
        }

        AuditLogger::record(
            'voucher.ai_reviewed',
            "Ran an AI review on voucher {$voucher->voucher_number} (risk: {$review['risk']}).",
            $voucher,
        );

        return response()->json(['available' => true, 'review' => $review]);
    }
}
