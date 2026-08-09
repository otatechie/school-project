<?php

use App\Models\Account;
use App\Models\AppNotification;
use App\Models\Department;
use App\Models\LedgerEntry;
use App\Models\PaymentVoucher;
use App\Models\SystemLog;
use App\Models\User;

beforeEach(function () {
    foreach ([['1100', 'Cash', 'asset'], ['5100', 'Office Supplies', 'expense']] as [$c, $n, $t]) {
        Account::create(['code' => $c, 'name' => $n, 'type' => $t]);
    }

    $this->department = Department::factory()->create();
    $this->officer = User::factory()->create(['role' => User::ROLE_FINANCE_OFFICER]);
    $this->approver = User::factory()->create(['role' => User::ROLE_APPROVER]);
});

it('runs a voucher from draft to paid and posts it to the ledger', function () {
    // Prepare
    $this->actingAs($this->officer)
        ->post(route('payment-vouchers.store'), [
            'voucher_date' => now()->toDateString(),
            'payee_name' => 'Acme Supplies',
            'description' => 'Stationery for Q3',
            'amount' => '2500.00',
            'payment_method' => 'cheque',
            'cheque_number' => 'CHQ-100',
            'budget_line' => 'Office Supplies',
            'department_id' => $this->department->id,
        ])->assertRedirect();

    $voucher = PaymentVoucher::firstWhere('payee_name', 'Acme Supplies');
    expect($voucher->status)->toBe('draft');

    // Submit
    $this->actingAs($this->officer)
        ->post(route('payment-vouchers.submit', $voucher))
        ->assertRedirect();

    expect($voucher->fresh()->status)->toBe('pending')
        ->and($voucher->fresh()->submitted_at)->not->toBeNull();

    // The approver is notified
    expect(AppNotification::where('user_id', $this->approver->id)->count())->toBe(1);

    // Approve
    $this->actingAs($this->approver)
        ->post(route('payment-vouchers.review', $voucher), [
            'action' => 'approve',
            'comments' => 'Looks correct.',
        ])->assertRedirect();

    expect($voucher->fresh()->status)->toBe('approved');

    // Pay
    $this->actingAs($this->officer)
        ->post(route('payment-vouchers.mark-paid', $voucher))
        ->assertRedirect();

    $voucher->refresh();
    expect($voucher->status)->toBe('paid');

    // Ledger posted and balanced
    $entries = LedgerEntry::where('payment_voucher_id', $voucher->id)->get();
    expect($entries)->toHaveCount(2)
        ->and((float) $entries->sum('debit'))->toBe(2500.00)
        ->and((float) $entries->sum('credit'))->toBe(2500.00);

    // Audit trail recorded each step
    $actions = SystemLog::where('subject_id', $voucher->id)->pluck('action');
    expect($actions)->toContain('voucher.created', 'voucher.submitted', 'voucher.approved', 'voucher.paid');
});

it('records a rejection reason and notifies the preparer', function () {
    $voucher = PaymentVoucher::factory()->create([
        'status' => 'pending',
        'created_by' => $this->officer->id,
        'department_id' => $this->department->id,
    ]);

    $this->actingAs($this->approver)
        ->post(route('payment-vouchers.review', $voucher), [
            'action' => 'reject',
            'rejection_reason' => 'Missing invoice.',
        ])->assertRedirect();

    $voucher->refresh();

    expect($voucher->status)->toBe('rejected')
        ->and($voucher->rejection_reason)->toBe('Missing invoice.')
        ->and($voucher->rejected_by)->toBe($this->approver->id);

    expect(AppNotification::where('user_id', $this->officer->id)
        ->where('type', 'voucher.rejected')->exists())->toBeTrue();
});

it('requires a cheque number for cheque payments', function () {
    $this->actingAs($this->officer)
        ->post(route('payment-vouchers.store'), [
            'voucher_date' => now()->toDateString(),
            'payee_name' => 'No Cheque',
            'description' => 'x',
            'amount' => '10.00',
            'payment_method' => 'cheque',
            'cheque_number' => '',
            'budget_line' => 'Office Supplies',
            'department_id' => $this->department->id,
        ])->assertSessionHasErrors('cheque_number');
});
