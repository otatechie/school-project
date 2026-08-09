<?php

use App\Models\Department;
use App\Models\PaymentVoucher;
use App\Models\User;

beforeEach(function () {
    $this->department = Department::factory()->create();
});

function userWithRole(string $role): User
{
    return User::factory()->create(['role' => $role, 'is_active' => true]);
}

it('forbids editing a paid voucher', function () {
    $officer = userWithRole(User::ROLE_FINANCE_OFFICER);
    $voucher = PaymentVoucher::factory()->create(['status' => 'paid']);

    expect($officer->can('update', $voucher))->toBeFalse();
});

it('forbids editing an approved voucher', function () {
    $officer = userWithRole(User::ROLE_FINANCE_OFFICER);
    $voucher = PaymentVoucher::factory()->create(['status' => 'approved']);

    expect($officer->can('update', $voucher))->toBeFalse();
});

it('allows editing a draft voucher', function () {
    $officer = userWithRole(User::ROLE_FINANCE_OFFICER);
    $voucher = PaymentVoucher::factory()->create(['status' => 'draft']);

    expect($officer->can('update', $voucher))->toBeTrue();
});

it('forbids a viewer from creating vouchers', function () {
    expect(userWithRole(User::ROLE_VIEWER)->can('create', PaymentVoucher::class))->toBeFalse();
});

it('forbids the preparer from approving their own voucher', function () {
    $officer = userWithRole(User::ROLE_APPROVER);
    $voucher = PaymentVoucher::factory()->create([
        'status' => 'pending',
        'created_by' => $officer->id,
    ]);

    expect($officer->can('review', $voucher))->toBeFalse();
});

it('allows an approver to review someone elses voucher', function () {
    $approver = userWithRole(User::ROLE_APPROVER);
    $other = userWithRole(User::ROLE_FINANCE_OFFICER);
    $voucher = PaymentVoucher::factory()->create([
        'status' => 'pending',
        'created_by' => $other->id,
    ]);

    expect($approver->can('review', $voucher))->toBeTrue();
});

it('blocks the edit route for a paid voucher', function () {
    $officer = userWithRole(User::ROLE_FINANCE_OFFICER);
    $voucher = PaymentVoucher::factory()->create(['status' => 'paid']);

    $this->actingAs($officer)
        ->get(route('payment-vouchers.edit', $voucher))
        ->assertForbidden();
});

it('blocks the update route for a paid voucher', function () {
    $officer = userWithRole(User::ROLE_FINANCE_OFFICER);
    $voucher = PaymentVoucher::factory()->create([
        'status' => 'paid',
        'amount' => 500,
    ]);

    $this->actingAs($officer)
        ->put(route('payment-vouchers.update', $voucher), [
            'voucher_date' => '2026-08-01',
            'payee_name' => 'Tampered',
            'description' => 'x',
            'amount' => 999999,
            'payment_method' => 'cash',
            'budget_line' => 'x',
            'department_id' => $this->department->id,
        ])
        ->assertForbidden();

    expect((float) $voucher->fresh()->amount)->toBe(500.00);
});
