<?php

namespace App\Services;

use App\Models\Account;
use App\Models\LedgerEntry;
use App\Models\PaymentVoucher;
use Illuminate\Support\Facades\DB;

/**
 * Posts paid vouchers to the general ledger as balanced double entries:
 *   Dr  expense account (mapped from the voucher's budget line)
 *   Cr  cash or bank    (per the voucher's payment method)
 */
class LedgerPoster
{
    /**
     * Budget lines are free text, so map the common ones onto expense accounts
     * and fall back to a general expense account for anything unrecognised.
     */
    private const BUDGET_LINE_ACCOUNTS = [
        'office supplies' => '5100',
        'stationery' => '5100',
        'salaries' => '5200',
        'payroll' => '5200',
        'travel' => '5300',
        'transport' => '5300',
        'utilities' => '5400',
        'maintenance' => '5500',
    ];

    private const FALLBACK_EXPENSE = '5900';

    public function post(PaymentVoucher $voucher): void
    {
        if ($voucher->status !== 'paid') {
            return;
        }

        // A voucher posts once; re-running must not duplicate entries.
        if (LedgerEntry::where('payment_voucher_id', $voucher->id)->exists()) {
            return;
        }

        $expense = $this->expenseAccountFor($voucher->budget_line);
        $settlement = $this->settlementAccountFor($voucher->payment_method);

        if (! $expense || ! $settlement) {
            return;
        }

        $shared = [
            'reference' => $voucher->voucher_number,
            'entry_date' => $voucher->paid_at?->toDateString() ?? now()->toDateString(),
            'description' => $voucher->description,
            'payment_voucher_id' => $voucher->id,
            'created_by' => $voucher->paid_by ?? $voucher->created_by,
        ];

        DB::transaction(function () use ($shared, $expense, $settlement, $voucher) {
            LedgerEntry::create($shared + [
                'account_id' => $expense->id,
                'debit' => $voucher->amount,
                'credit' => 0,
            ]);

            LedgerEntry::create($shared + [
                'account_id' => $settlement->id,
                'debit' => 0,
                'credit' => $voucher->amount,
            ]);
        });
    }

    private function expenseAccountFor(?string $budgetLine): ?Account
    {
        $needle = strtolower(trim((string) $budgetLine));

        foreach (self::BUDGET_LINE_ACCOUNTS as $keyword => $code) {
            if ($needle !== '' && str_contains($needle, $keyword)) {
                return Account::where('code', $code)->first();
            }
        }

        return Account::where('code', self::FALLBACK_EXPENSE)->first();
    }

    private function settlementAccountFor(?string $paymentMethod): ?Account
    {
        $code = $paymentMethod === 'bank_transfer' ? '1200' : '1100';

        return Account::where('code', $code)->first();
    }
}
