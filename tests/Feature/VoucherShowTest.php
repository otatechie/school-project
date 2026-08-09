<?php

use App\Http\Middleware\EnsureUserIsActive;
use App\Models\Account;
use App\Models\Department;
use App\Models\LedgerEntry;
use App\Models\PaymentVoucher;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->department = Department::factory()->create();
    $this->officer = User::factory()->create(['role' => User::ROLE_FINANCE_OFFICER]);
    $this->viewer = User::factory()->create(['role' => User::ROLE_VIEWER]);
});

it('shows a paid voucher with its people, documents and ledger entries', function () {
    $account = Account::create(['code' => '5100', 'name' => 'Office Supplies', 'type' => 'expense']);

    $voucher = PaymentVoucher::factory()->create([
        'status' => 'paid',
        'department_id' => $this->department->id,
        'created_by' => $this->officer->id,
        'paid_by' => $this->officer->id,
        'paid_at' => now(),
    ]);

    LedgerEntry::create([
        'reference' => $voucher->voucher_number,
        'entry_date' => now(),
        'account_id' => $account->id,
        'description' => 'Stationery',
        'debit' => '2500.00',
        'credit' => '0.00',
        'payment_voucher_id' => $voucher->id,
        'created_by' => $this->officer->id,
    ]);

    $this->actingAs($this->officer)
        ->get(route('payment-vouchers.show', $voucher))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('payment-vouchers/show')
            ->where('voucher.voucher_number', $voucher->voucher_number)
            ->where('voucher.status', 'paid')
            ->where('voucher.payer.name', $this->officer->name)
            ->where('voucher.paid_at_label', $voucher->paid_at_label)
            ->has('voucher.ledger_entries', 1)
            ->has('attachments', 0)
        );
});

it('lets a viewer read a voucher they may not edit', function () {
    $voucher = PaymentVoucher::factory()->create([
        'status' => 'approved',
        'department_id' => $this->department->id,
        'created_by' => $this->officer->id,
    ]);

    $this->actingAs($this->viewer)
        ->get(route('payment-vouchers.show', $voucher))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('canUpdate', false));
});

it('refuses a voucher to a deactivated account', function () {
    $voucher = PaymentVoucher::factory()->create([
        'status' => 'approved',
        'department_id' => $this->department->id,
    ]);

    $deactivated = User::factory()->create([
        'role' => User::ROLE_FINANCE_OFFICER,
        'is_active' => false,
    ]);

    // The active-user middleware would sign this account out before the policy
    // is ever consulted, so it is bypassed to prove the policy itself refuses.
    $this->withoutMiddleware(EnsureUserIsActive::class)
        ->actingAs($deactivated)
        ->get(route('payment-vouchers.show', $voucher))
        ->assertForbidden();
});

it('offers the edit button only on vouchers that may still change', function () {
    foreach (['draft' => true, 'rejected' => true, 'pending' => false, 'approved' => false, 'paid' => false] as $status => $expected) {
        $voucher = PaymentVoucher::factory()->create([
            'status' => $status,
            'department_id' => $this->department->id,
            'created_by' => $this->officer->id,
        ]);

        $this->actingAs($this->officer)
            ->get(route('payment-vouchers.show', $voucher))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('canUpdate', $expected));
    }
});
