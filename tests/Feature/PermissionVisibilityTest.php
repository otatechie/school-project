<?php

use App\Models\Department;
use App\Models\User;

/**
 * The interface must never offer an action the server will refuse.
 *
 * Every button is gated on a permission shared from the same policies the
 * controllers authorize against. These tests assert the two agree: if a role
 * is shown a shortcut, the corresponding route must accept them.
 */
beforeEach(function () {
    $this->department = Department::factory()->create();

    $this->make = fn (string $role, array $extra = []) => User::factory()->create([
        'role' => $role,
        'department_id' => $this->department->id,
        'is_active' => true,
        ...$extra,
    ]);
});

/**
 * @return array<string, bool>
 */
function permissionsFor($test, User $user): array
{
    $props = $test->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->viewData('page')['props'];

    return $props['auth']['can'];
}

it('gives an administrator every shortcut', function () {
    $can = permissionsFor($this, ($this->make)(User::ROLE_ADMIN));

    expect($can)->toMatchArray([
        'createVoucher' => true,
        'createMemo' => true,
        'reviewVouchers' => true,
        'manageDepartments' => true,
        'manageStaff' => true,
        'viewAuditLog' => true,
    ]);
});

it('offers a finance officer preparation but not approval or administration', function () {
    $can = permissionsFor($this, ($this->make)(User::ROLE_FINANCE_OFFICER));

    expect($can)->toMatchArray([
        'createVoucher' => true,
        'createMemo' => true,
        'reviewVouchers' => false,
        'manageDepartments' => false,
        'manageStaff' => false,
        'viewAuditLog' => false,
    ]);
});

it('offers an approver review but not preparation', function () {
    $can = permissionsFor($this, ($this->make)(User::ROLE_APPROVER, ['approval_limit' => 50000]));

    expect($can)->toMatchArray([
        'createVoucher' => false,
        'createMemo' => false,
        'reviewVouchers' => true,
        'manageDepartments' => false,
        'manageStaff' => false,
        'viewAuditLog' => false,
    ]);
});

it('offers a viewer nothing at all', function () {
    $can = permissionsFor($this, ($this->make)(User::ROLE_VIEWER));

    expect(array_filter($can))->toBeEmpty();
});

/**
 * The important half: a shortcut that is offered must actually work, and one
 * that is hidden must actually be refused. A mismatch either sends someone to
 * a 403 or hides something they were entitled to.
 */
it('keeps every advertised permission consistent with the route it points at', function (string $role) {
    $user = ($this->make)($role, ['approval_limit' => 50000]);
    $can = permissionsFor($this, $user);

    $routes = [
        'createVoucher' => route('payment-vouchers.create'),
        'createMemo' => route('memos.create'),
        'manageStaff' => route('users.index'),
        'viewAuditLog' => route('system-logs.index'),
    ];

    foreach ($routes as $permission => $url) {
        $status = $this->actingAs($user)->get($url)->getStatusCode();

        $can[$permission]
            ? expect($status)->toBe(200, "{$role} is offered {$permission} but {$url} returned {$status}")
            : expect($status)->toBe(403, "{$role} is not offered {$permission} but {$url} returned {$status}");
    }
})->with([
    User::ROLE_ADMIN,
    User::ROLE_APPROVER,
    User::ROLE_FINANCE_OFFICER,
    User::ROLE_VIEWER,
]);
