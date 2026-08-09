<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\PaymentVoucher;
use App\Services\AuditLogger;
use App\Support\Dates;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class FinancialReportController extends Controller
{
    /**
     * Expenditure by month for a given year, based on vouchers actually paid.
     */
    public function monthly(Request $request): Response
    {
        $year = (int) ($request->integer('year') ?: now()->year);

        return Inertia::render('financial-reports/monthly', $this->monthlyData($year));
    }

    /**
     * Expenditure by department, with status breakdown.
     */
    public function department(Request $request): Response
    {
        $year = (int) ($request->integer('year') ?: now()->year);

        return Inertia::render('financial-reports/department', $this->departmentData($year));
    }

    /**
     * A printable copy of either report, and the audit record that it was taken.
     *
     * Reports leave the system as evidence, so generating one is itself a
     * logged event — an auditor can see who exported what, and when.
     */
    public function print(Request $request, string $report): Response
    {
        abort_unless(in_array($report, ['monthly', 'department'], true), 404);

        $year = (int) ($request->integer('year') ?: now()->year);

        AuditLogger::record(
            'report.generated',
            "Generated the {$report} expenditure report for {$year}.",
        );

        $data = $report === 'monthly'
            ? $this->monthlyData($year)
            : $this->departmentData($year);

        return Inertia::render('financial-reports/print', [
            ...$data,
            'report' => $report,
            'generatedAt' => Dates::withTime(now()),
            'generatedBy' => $request->user()->name,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function monthlyData(int $year): array
    {
        $byMonth = PaymentVoucher::query()
            ->where('status', 'paid')
            ->whereYear('paid_at', $year)
            ->get(['paid_at', 'amount'])
            ->groupBy(fn (PaymentVoucher $v) => $v->paid_at->format('m'));

        $months = collect(range(1, 12))->map(function ($m) use ($byMonth) {
            $key = str_pad((string) $m, 2, '0', STR_PAD_LEFT);
            $group = $byMonth->get($key);

            return [
                'month' => $key,
                'label' => date('F', mktime(0, 0, 0, $m, 1)),
                'short' => date('M', mktime(0, 0, 0, $m, 1)),
                'total' => (float) ($group?->sum('amount') ?? 0),
                'vouchers' => (int) ($group?->count() ?? 0),
            ];
        });

        return [
            'year' => $year,
            'years' => $this->paidYears(),
            'months' => $months,
            'total' => $months->sum('total'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function departmentData(int $year): array
    {
        $departments = Department::query()
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(function (Department $dept) use ($year) {
                $paid = PaymentVoucher::where('department_id', $dept->id)
                    ->where('status', 'paid')
                    ->whereYear('paid_at', $year);

                $pending = PaymentVoucher::where('department_id', $dept->id)
                    ->where('status', 'pending');

                return [
                    'id' => $dept->id,
                    'name' => $dept->name,
                    'code' => $dept->code,
                    'paidTotal' => (float) (clone $paid)->sum('amount'),
                    'paidCount' => (clone $paid)->count(),
                    'pendingTotal' => (float) (clone $pending)->sum('amount'),
                    'pendingCount' => (clone $pending)->count(),
                ];
            })
            ->filter(fn ($d) => $d['paidCount'] > 0 || $d['pendingCount'] > 0)
            ->values();

        return [
            'year' => $year,
            'years' => $this->paidYears(),
            'departments' => $departments,
            'total' => $departments->sum('paidTotal'),
        ];
    }

    /**
     * Years that actually have paid vouchers, newest first.
     *
     * Derived in PHP rather than SQL because date-part extraction is not
     * portable between SQLite (development) and MySQL (production).
     *
     * @return Collection<int, int>
     */
    private function paidYears(): Collection
    {
        return PaymentVoucher::query()
            ->whereNotNull('paid_at')
            ->pluck('paid_at')
            ->map(fn ($date) => (int) $date->format('Y'))
            ->unique()
            ->sortDesc()
            ->values();
    }
}
