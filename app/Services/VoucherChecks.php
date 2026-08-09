<?php

namespace App\Services;

use App\Models\PaymentVoucher;
use Illuminate\Support\Collection;

/**
 * Deterministic validation checks that run against a voucher and the
 * department's own payment history.
 *
 * These are rules, not machine learning: every finding can be traced to a
 * specific comparison and explained to an auditor in one sentence. They are
 * deliberately separate from {@see VoucherIntelligence}, which uses the Claude
 * API for the judgement calls a rule cannot make. Rules run first because they
 * are free, instant, and always available.
 */
class VoucherChecks
{
    /** A repeat payment within this many days is worth a second look. */
    private const DUPLICATE_WINDOW_DAYS = 30;

    /** How far above the department's mean an amount must sit to be flagged. */
    private const OUTLIER_SIGMA = 2.0;

    /** Below this many prior vouchers, a standard deviation means nothing. */
    private const MIN_HISTORY_FOR_OUTLIER = 5;

    /**
     * Budget line keywords, mirroring the ledger's expense account mapping.
     *
     * @var array<string, list<string>>
     */
    private const BUDGET_LINE_KEYWORDS = [
        'Office Supplies' => ['stationery', 'paper', 'toner', 'printer', 'supplies', 'pens'],
        'Salaries and Wages' => ['salary', 'salaries', 'wage', 'payroll', 'allowance', 'stipend'],
        'Travel and Transport' => ['travel', 'transport', 'fuel', 'mileage', 'trip', 'vehicle'],
        'Utilities' => ['electricity', 'water', 'internet', 'utility', 'utilities', 'telephone'],
        'Repairs and Maintenance' => ['repair', 'maintenance', 'servicing', 'fix', 'refurbish'],
    ];

    /**
     * Run every check against a voucher.
     *
     * @return list<array{type: string, severity: string, message: string}>
     */
    public function run(PaymentVoucher $voucher): array
    {
        return array_values(array_filter([
            $this->duplicate($voucher),
            $this->amountOutlier($voucher),
            $this->budgetLineMismatch($voucher),
        ]));
    }

    /**
     * A payment to the same payee for the same amount inside the window is
     * the classic double-payment error.
     *
     * @return array{type: string, severity: string, message: string}|null
     */
    public function duplicate(PaymentVoucher $voucher): ?array
    {
        $match = PaymentVoucher::query()
            ->where('payee_name', $voucher->payee_name)
            ->where('amount', $voucher->amount)
            ->whereNot('status', 'rejected')
            ->when($voucher->exists, fn ($q) => $q->whereKeyNot($voucher->getKey()))
            ->where('created_at', '>=', now()->subDays(self::DUPLICATE_WINDOW_DAYS))
            ->latest('created_at')
            ->first(['voucher_number', 'status', 'created_at', 'paid_at']);

        if (! $match) {
            return null;
        }

        // Say what the other voucher actually is. Calling a pending voucher
        // "paid" would tell an approver money has already gone out when it
        // has not.
        [$state, $date] = $match->status === 'paid'
            ? ['was paid on', $match->paid_at ?? $match->created_at]
            : ['was raised on', $match->created_at];

        return [
            'type' => 'duplicate',
            'severity' => 'high',
            'message' => sprintf(
                'Same payee and amount as %s, which %s %s.',
                $match->voucher_number,
                $state,
                $date->format('j M Y'),
            ),
        ];
    }

    /**
     * Compare the amount against the department's own paid history.
     *
     * Uses the sample standard deviation. With fewer than a handful of prior
     * vouchers the spread is meaningless, so no finding is returned rather
     * than a confident-sounding one built on two data points.
     *
     * @return array{type: string, severity: string, message: string}|null
     */
    public function amountOutlier(PaymentVoucher $voucher): ?array
    {
        if (! $voucher->department_id) {
            return null;
        }

        $amounts = $this->departmentHistory($voucher);

        if ($amounts->count() < self::MIN_HISTORY_FOR_OUTLIER) {
            return null;
        }

        $mean = $amounts->average();
        $variance = $amounts
            ->map(fn (float $a) => ($a - $mean) ** 2)
            ->sum() / ($amounts->count() - 1);
        $deviation = sqrt($variance);

        if ($deviation <= 0.0) {
            return null;
        }

        $amount = (float) $voucher->amount;
        $sigmas = ($amount - $mean) / $deviation;

        if ($sigmas < self::OUTLIER_SIGMA) {
            return null;
        }

        return [
            'type' => 'outlier',
            'severity' => $sigmas >= 3 ? 'high' : 'medium',
            'message' => sprintf(
                'Unusually large: GHS %s is %.1f standard deviations above this department\'s average paid voucher of GHS %s (%d prior vouchers).',
                number_format($amount, 2),
                $sigmas,
                number_format($mean, 2),
                $amounts->count(),
            ),
        ];
    }

    /**
     * Flag a budget line that contradicts what the description says the money
     * was spent on.
     *
     * @return array{type: string, severity: string, message: string}|null
     */
    public function budgetLineMismatch(PaymentVoucher $voucher): ?array
    {
        $suggested = $this->suggestBudgetLine($voucher->description);

        if (! $suggested) {
            return null;
        }

        $current = strtolower(trim((string) $voucher->budget_line));

        if ($current === '' || str_contains(strtolower($suggested), $current) || str_contains($current, strtolower($suggested))) {
            return null;
        }

        return [
            'type' => 'budget_line',
            'severity' => 'medium',
            'message' => sprintf(
                'The description suggests "%s" but the budget line is "%s". Confirm the correct line before approving.',
                $suggested,
                $voucher->budget_line,
            ),
        ];
    }

    /**
     * Suggest a budget line from a free-text description.
     *
     * Returns the line with the most keyword hits, or null when the
     * description gives no clear signal — a wrong suggestion is worse than none.
     */
    public function suggestBudgetLine(?string $description): ?string
    {
        $text = strtolower(trim((string) $description));

        if ($text === '') {
            return null;
        }

        $scores = [];

        foreach (self::BUDGET_LINE_KEYWORDS as $line => $keywords) {
            $hits = 0;

            foreach ($keywords as $keyword) {
                if (str_contains($text, $keyword)) {
                    $hits++;
                }
            }

            if ($hits > 0) {
                $scores[$line] = $hits;
            }
        }

        if ($scores === []) {
            return null;
        }

        arsort($scores);

        // An outright tie is ambiguous; say nothing rather than guess.
        $ranked = array_values($scores);
        if (count($ranked) > 1 && $ranked[0] === $ranked[1]) {
            return null;
        }

        return array_key_first($scores);
    }

    /**
     * Paid amounts for the voucher's department, excluding the voucher itself.
     *
     * @return Collection<int, float>
     */
    private function departmentHistory(PaymentVoucher $voucher): Collection
    {
        return PaymentVoucher::query()
            ->where('department_id', $voucher->department_id)
            ->where('status', 'paid')
            ->when($voucher->exists, fn ($q) => $q->whereKeyNot($voucher->getKey()))
            ->pluck('amount')
            ->map(fn ($a) => (float) $a);
    }
}
