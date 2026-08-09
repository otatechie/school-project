<?php

use App\Models\Account;
use App\Models\Department;
use App\Models\LedgerEntry;
use App\Models\PaymentVoucher;
use App\Models\User;
use App\Services\LedgerPoster;

beforeEach(function () {
    foreach ([
        ['1100', 'Cash', 'asset'],
        ['1200', 'Bank', 'asset'],
        ['5100', 'Office Supplies', 'expense'],
        ['5900', 'General Expenses', 'expense'],
    ] as [$code, $name, $type]) {
        Account::create(['code' => $code, 'name' => $name, 'type' => $type]);
    }

    $this->department = Department::factory()->create();
    $this->user = User::factory()->create(['department_id' => $this->department->id]);
});

function makePaidVoucher(array $attributes = []): PaymentVoucher
{
    return PaymentVoucher::factory()->create(array_merge([
        'status' => 'paid',
        'paid_at' => now(),
        'amount' => 1000.00,
        'budget_line' => 'Office Supplies',
        'payment_method' => 'cheque',
    ], $attributes));
}

it('posts a balanced double entry when a voucher is paid', function () {
    $voucher = makePaidVoucher();

    app(LedgerPoster::class)->post($voucher);

    $entries = LedgerEntry::where('payment_voucher_id', $voucher->id)->get();

    expect($entries)->toHaveCount(2)
        ->and((float) $entries->sum('debit'))->toBe(1000.00)
        ->and((float) $entries->sum('credit'))->toBe(1000.00);
});

it('debits the expense account mapped from the budget line', function () {
    $voucher = makePaidVoucher(['budget_line' => 'Office Supplies']);

    app(LedgerPoster::class)->post($voucher);

    $debit = LedgerEntry::where('payment_voucher_id', $voucher->id)
        ->where('debit', '>', 0)->first();

    expect($debit->account->code)->toBe('5100');
});

it('falls back to general expenses for an unrecognised budget line', function () {
    $voucher = makePaidVoucher(['budget_line' => 'Something Unusual']);

    app(LedgerPoster::class)->post($voucher);

    $debit = LedgerEntry::where('payment_voucher_id', $voucher->id)
        ->where('debit', '>', 0)->first();

    expect($debit->account->code)->toBe('5900');
});

it('credits bank for transfers and cash for cheques', function () {
    $transfer = makePaidVoucher(['payment_method' => 'bank_transfer']);
    app(LedgerPoster::class)->post($transfer);

    $credit = LedgerEntry::where('payment_voucher_id', $transfer->id)
        ->where('credit', '>', 0)->first();

    expect($credit->account->code)->toBe('1200');
});

it('does not post a voucher twice', function () {
    $voucher = makePaidVoucher();

    app(LedgerPoster::class)->post($voucher);
    app(LedgerPoster::class)->post($voucher);

    expect(LedgerEntry::where('payment_voucher_id', $voucher->id)->count())->toBe(2);
});

it('does not post a voucher that is not paid', function () {
    $voucher = PaymentVoucher::factory()->create(['status' => 'approved']);

    app(LedgerPoster::class)->post($voucher);

    expect(LedgerEntry::where('payment_voucher_id', $voucher->id)->count())->toBe(0);
});
