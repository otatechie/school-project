<?php

use App\Models\Account;
use App\Models\Department;
use App\Models\PaymentVoucher;
use App\Models\User;

beforeEach(function () {
    Account::create(['code' => '5100', 'name' => 'Office Supplies', 'type' => 'expense']);
    $this->department = Department::factory()->create();
    $this->user = User::factory()->create([
        'role' => User::ROLE_ADMIN,
        'department_id' => $this->department->id,
    ]);
});

it('loads every main page for a signed-in user', function (string $route) {
    $this->actingAs($this->user)
        ->get(route($route))
        ->assertOk();
})->with([
    'dashboard',
    'payment-vouchers.index',
    'payment-vouchers.create',
    'payment-vouchers.pending',
    'payment-vouchers.rejected',
    'memos.index',
    'memos.create',
    'departments.index',
    'departments.create',
    'users.index',
    'users.create',
    'roles-permissions.index',
    'system-logs.index',
    'documents.index',
    'notifications.index',
    'ledgers.index',
    'ledgers.transactions',
    'ledgers.chart-of-accounts',
    'financial-reports.monthly',
    'financial-reports.department',
]);

it('loads the voucher edit page for a draft voucher', function () {
    $voucher = PaymentVoucher::factory()->create([
        'status' => 'draft',
        'department_id' => $this->department->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('payment-vouchers.edit', $voucher))
        ->assertOk();
});

it('loads the department and user edit pages', function () {
    $this->actingAs($this->user)
        ->get(route('departments.edit', $this->department))
        ->assertOk();

    $this->actingAs($this->user)
        ->get(route('users.edit', $this->user->id))
        ->assertOk();
});

it('redirects guests to login', function () {
    $this->get(route('payment-vouchers.index'))->assertRedirect(route('login'));
});
