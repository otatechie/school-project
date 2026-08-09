<?php

namespace App\Http\Controllers;

use App\Http\Requests\Memo\StoreMemoRequest;
use App\Models\Department;
use App\Models\Memo;
use App\Models\PaymentVoucher;
use App\Services\AuditLogger;
use App\Services\VoucherIntelligence;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemoController extends Controller
{
    public function index(Request $request): Response
    {
        $memos = Memo::query()
            ->with(['department', 'creator'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');
                $query->where(fn ($q) => $q
                    ->where('memo_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('to_name', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $stats = [
            'total' => Memo::count(),
            'draft' => Memo::where('status', 'draft')->count(),
            'finalized' => Memo::where('status', 'finalized')->count(),
            'printed' => Memo::where('status', 'printed')->count(),
        ];

        return Inertia::render('memos/index', [
            'memos' => $memos,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Memo::class);

        return Inertia::render('memos/create', [
            'aiEnabled' => app(VoucherIntelligence::class)->isEnabled(),
            'departments' => Department::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'vouchers' => PaymentVoucher::query()->where('status', 'paid')->latest()->get(['id', 'voucher_number', 'payee_name']),
        ]);
    }

    public function store(StoreMemoRequest $request): RedirectResponse
    {
        $this->authorize('create', Memo::class);

        $memo = Memo::create([
            ...$request->validated(),
            'memo_number' => $this->generateMemoNumber(),
            'status' => 'draft',
            'created_by' => $request->user()->id,
        ]);

        AuditLogger::record('memo.created', "Created memo {$memo->memo_number}.", $memo);

        return redirect()
            ->route('memos.index')
            ->with('success', "Memo {$memo->memo_number} created successfully.");
    }

    private function generateMemoNumber(): string
    {
        $year = date('Y');
        $last = Memo::query()
            ->whereYear('created_at', $year)
            ->latest('id')
            ->first();

        $sequence = $last ? (int) substr($last->memo_number, -3) + 1 : 1;

        return 'MEMO-'.$year.'-'.str_pad((string) $sequence, 3, '0', STR_PAD_LEFT);
    }

    public function finalize(Memo $memo): RedirectResponse
    {
        $this->authorize('finalize', $memo);

        $memo->update(['status' => 'finalized']);

        AuditLogger::record('memo.finalized', "Finalized memo {$memo->memo_number}.", $memo);

        return back()->with('success', "Memo {$memo->memo_number} finalized.");
    }

    public function markPrinted(Memo $memo): RedirectResponse
    {
        $this->authorize('markPrinted', $memo);

        $memo->update(['status' => 'printed']);

        AuditLogger::record('memo.printed', "Marked memo {$memo->memo_number} as printed.", $memo);

        return back()->with('success', "Memo {$memo->memo_number} marked as printed.");
    }

    /**
     * Draft a memo body from a paid voucher. The draft lands in the form for
     * the officer to edit — it is never saved or sent on its own.
     */
    public function aiDraft(PaymentVoucher $voucher, VoucherIntelligence $ai): JsonResponse
    {
        $this->authorize('create', Memo::class);

        abort_if($voucher->status !== 'paid', 422, 'Memos are raised against paid vouchers.');

        $draft = $ai->draftMemo($voucher);

        if (! $draft) {
            return response()->json([
                'available' => false,
                'message' => $ai->isEnabled()
                    ? 'The drafting service is temporarily unavailable. Please write the memo manually.'
                    : 'AI drafting is not configured on this deployment.',
            ]);
        }

        AuditLogger::record(
            'memo.ai_drafted',
            "Generated an AI memo draft from voucher {$voucher->voucher_number}.",
            $voucher,
        );

        return response()->json(['available' => true, 'draft' => $draft]);
    }
}
