<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Memo;
use App\Models\PaymentVoucher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $vouchers = PaymentVoucher::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $memos = Memo::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('dashboard', [
            'stats' => [
                'draftVouchers' => (int) $vouchers->get('draft', 0),
                'pendingApprovals' => (int) $vouchers->get('pending', 0),
                'approvedVouchers' => (int) $vouchers->get('approved', 0),
                'paidVouchers' => (int) $vouchers->get('paid', 0),
                'rejectedVouchers' => (int) $vouchers->get('rejected', 0),
                'draftMemos' => (int) $memos->get('draft', 0),
                'finalizedMemos' => (int) $memos->get('finalized', 0),
                'printedMemos' => (int) $memos->get('printed', 0),
            ],
            'charts' => [
                'monthly' => $this->monthlyExpenditure(),
                'departments' => $this->departmentExpenditure(),
            ],
        ]);
    }

    /**
     * Paid expenditure for the last twelve months, oldest first.
     *
     * Grouped in PHP rather than SQL so the query is portable across SQLite
     * and MySQL.
     *
     * @return list<array{label: string, total: float, vouchers: int}>
     */
    private function monthlyExpenditure(): array
    {
        $since = now()->startOfMonth()->subMonths(11);

        $paid = PaymentVoucher::query()
            ->where('status', 'paid')
            ->where('paid_at', '>=', $since)
            ->get(['paid_at', 'amount'])
            ->groupBy(fn (PaymentVoucher $v) => $v->paid_at->format('Y-m'));

        return collect(range(0, 11))
            ->map(function (int $offset) use ($since, $paid) {
                $month = $since->copy()->addMonths($offset);
                $group = $paid->get($month->format('Y-m'));

                return [
                    'label' => $month->format('M'),
                    'month' => $month->format('F Y'),
                    'total' => (float) ($group?->sum('amount') ?? 0),
                    'vouchers' => (int) ($group?->count() ?? 0),
                ];
            })
            ->all();
    }

    /**
     * Paid expenditure by department for the current year, largest first.
     *
     * @return list<array{name: string, code: string, total: float}>
     */
    private function departmentExpenditure(): array
    {
        $totals = PaymentVoucher::query()
            ->where('status', 'paid')
            ->whereYear('paid_at', now()->year)
            ->selectRaw('department_id, SUM(amount) as total, COUNT(*) as vouchers')
            ->groupBy('department_id')
            ->get()
            ->keyBy('department_id');

        return Department::query()
            ->whereIn('id', $totals->keys())
            ->get(['id', 'name', 'code'])
            ->map(fn (Department $d) => [
                'name' => $d->name,
                'code' => $d->code,
                'total' => (float) $totals[$d->id]->total,
                'vouchers' => (int) $totals[$d->id]->vouchers,
            ])
            ->sortByDesc('total')
            ->values()
            ->all();
    }
}
