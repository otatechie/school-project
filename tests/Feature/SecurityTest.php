<?php

use App\Models\AppNotification;
use App\Models\Department;
use App\Models\Memo;
use App\Models\PaymentVoucher;
use App\Models\User;

/**
 * Authorization boundaries.
 *
 * Every test here describes a way one user could reach another user's data or
 * exceed their own authority. They are written from the attacker's side: if a
 * test starts passing accidentally, a control has been removed.
 */
beforeEach(function () {
    $this->department = Department::factory()->create();

    $this->admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
        'department_id' => $this->department->id,
    ]);

    $this->officer = User::factory()->create([
        'role' => User::ROLE_FINANCE_OFFICER,
        'department_id' => $this->department->id,
    ]);

    $this->viewer = User::factory()->create([
        'role' => User::ROLE_VIEWER,
        'department_id' => $this->department->id,
    ]);

    $this->approver = User::factory()->create([
        'role' => User::ROLE_APPROVER,
        'department_id' => $this->department->id,
        'approval_limit' => 50000,
    ]);
});

describe('user administration', function () {
    it('stops a viewer from creating a user', function () {
        $this->actingAs($this->viewer)
            ->post(route('users.store'), [
                'name' => 'Intruder',
                'email' => 'intruder@example.com',
                'department_id' => $this->department->id,
                'role' => User::ROLE_ADMIN,
            ])
            ->assertForbidden();

        expect(User::where('email', 'intruder@example.com')->exists())->toBeFalse();
    });

    it('stops a finance officer from promoting themselves to administrator', function () {
        $this->actingAs($this->officer)
            ->put(route('users.update', $this->officer->id), [
                'name' => $this->officer->name,
                'email' => $this->officer->email,
                'department_id' => $this->department->id,
                'role' => User::ROLE_ADMIN,
            ])
            ->assertForbidden();

        expect($this->officer->fresh()->role)->toBe(User::ROLE_FINANCE_OFFICER);
    });

    it('stops a non-admin from listing users', function () {
        $this->actingAs($this->officer)
            ->get(route('users.index'))
            ->assertForbidden();
    });

    it('allows an administrator to manage users', function () {
        $this->actingAs($this->admin)
            ->get(route('users.index'))
            ->assertOk();
    });

    it('stops an administrator from removing their own admin role', function () {
        $this->actingAs($this->admin)
            ->put(route('users.update', $this->admin->id), [
                'name' => $this->admin->name,
                'email' => $this->admin->email,
                'department_id' => $this->department->id,
                'role' => User::ROLE_VIEWER,
            ])
            ->assertSessionHasErrors('role');

        expect($this->admin->fresh()->role)->toBe(User::ROLE_ADMIN);
    });
});

describe('department administration', function () {
    it('stops a viewer from creating a department', function () {
        $this->actingAs($this->viewer)
            ->post(route('departments.store'), [
                'name' => 'Ghost Department',
                'code' => 'GHO',
            ])
            ->assertForbidden();
    });

    it('stops a viewer from deleting a department', function () {
        $target = Department::factory()->create();

        $this->actingAs($this->viewer)
            ->delete(route('departments.destroy', $target))
            ->assertForbidden();

        expect(Department::find($target->id))->not->toBeNull();
    });
});

describe('payment vouchers', function () {
    it('stops a viewer from creating a voucher', function () {
        $this->actingAs($this->viewer)
            ->post(route('payment-vouchers.store'), [
                'voucher_date' => now()->toDateString(),
                'payee_name' => 'Ghost Payee',
                'amount' => 1000,
                'description' => 'Test',
                'payment_method' => 'cash',
                'budget_line' => 'Office Supplies',
                'department_id' => $this->department->id,
            ])
            ->assertForbidden();
    });

    it('stops a viewer from deleting a draft voucher', function () {
        $voucher = PaymentVoucher::factory()->create([
            'status' => 'draft',
            'created_by' => $this->officer->id,
            'department_id' => $this->department->id,
        ]);

        $this->actingAs($this->viewer)
            ->delete(route('payment-vouchers.destroy', $voucher))
            ->assertForbidden();

        expect(PaymentVoucher::find($voucher->id))->not->toBeNull();
    });

    it('stops anyone from deleting a paid voucher', function () {
        $voucher = PaymentVoucher::factory()->create([
            'status' => 'paid',
            'created_by' => $this->officer->id,
            'department_id' => $this->department->id,
            'paid_at' => now(),
        ]);

        $this->actingAs($this->admin)
            ->delete(route('payment-vouchers.destroy', $voucher))
            ->assertForbidden();

        expect(PaymentVoucher::find($voucher->id))->not->toBeNull();
    });

    it('stops an approver from releasing more than their limit', function () {
        $voucher = PaymentVoucher::factory()->create([
            'status' => 'pending',
            'created_by' => $this->officer->id,
            'department_id' => $this->department->id,
            'amount' => 200000,
            'submitted_at' => now(),
        ]);

        $this->actingAs($this->approver)
            ->post(route('payment-vouchers.review', $voucher), ['action' => 'approve'])
            ->assertForbidden();

        expect($voucher->fresh()->status)->toBe('pending');
    });

    it('allows an approver to release an amount within their limit', function () {
        $voucher = PaymentVoucher::factory()->create([
            'status' => 'pending',
            'created_by' => $this->officer->id,
            'department_id' => $this->department->id,
            'amount' => 20000,
            'submitted_at' => now(),
        ]);

        $this->actingAs($this->approver)
            ->post(route('payment-vouchers.review', $voucher), ['action' => 'approve'])
            ->assertRedirect();

        expect($voucher->fresh()->status)->toBe('approved');
    });

    it('stops a preparer from approving their own voucher', function () {
        $voucher = PaymentVoucher::factory()->create([
            'status' => 'pending',
            'created_by' => $this->approver->id,
            'department_id' => $this->department->id,
            'amount' => 1000,
            'submitted_at' => now(),
        ]);

        $this->actingAs($this->approver)
            ->post(route('payment-vouchers.review', $voucher), ['action' => 'approve'])
            ->assertForbidden();

        expect($voucher->fresh()->status)->toBe('pending');
    });

    it('stops a viewer from marking an approved voucher paid', function () {
        $voucher = PaymentVoucher::factory()->create([
            'status' => 'approved',
            'created_by' => $this->officer->id,
            'department_id' => $this->department->id,
            'approved_at' => now(),
        ]);

        $this->actingAs($this->viewer)
            ->post(route('payment-vouchers.mark-paid', $voucher))
            ->assertForbidden();

        expect($voucher->fresh()->status)->toBe('approved');
    });

    it('stops a viewer from running an AI review', function () {
        $voucher = PaymentVoucher::factory()->create([
            'status' => 'pending',
            'created_by' => $this->officer->id,
            'department_id' => $this->department->id,
            'submitted_at' => now(),
        ]);

        $this->actingAs($this->viewer)
            ->post(route('payment-vouchers.ai-review', $voucher))
            ->assertForbidden();
    });

    it('stops a viewer from running the form checks endpoint', function () {
        $this->actingAs($this->viewer)
            ->post(route('payment-vouchers.check'), ['payee_name' => 'Probe'])
            ->assertForbidden();
    });

    it('ignores a forged status field on create', function () {
        $this->actingAs($this->officer)
            ->post(route('payment-vouchers.store'), [
                'voucher_date' => now()->toDateString(),
                'payee_name' => 'Self Approver',
                'amount' => 1000,
                'description' => 'Attempt to skip approval',
                'payment_method' => 'cash',
                'budget_line' => 'Office Supplies',
                'department_id' => $this->department->id,
                'status' => 'paid',
                'approved_by' => $this->officer->id,
            ])
            ->assertRedirect();

        $voucher = PaymentVoucher::where('payee_name', 'Self Approver')->first();

        expect($voucher->status)->toBe('draft')
            ->and($voucher->approved_by)->toBeNull();
    });
});

describe('memos', function () {
    it('stops a viewer from creating a memo', function () {
        $voucher = PaymentVoucher::factory()->create([
            'status' => 'paid',
            'created_by' => $this->officer->id,
            'department_id' => $this->department->id,
            'paid_at' => now(),
        ]);

        $this->actingAs($this->viewer)
            ->post(route('memos.store'), [
                'memo_date' => now()->toDateString(),
                'subject' => 'Ghost memo',
                'body' => 'Body',
                'to_name' => 'Someone',
                'from_name' => 'Someone else',
                'department_id' => $this->department->id,
                'voucher_id' => $voucher->id,
            ])
            ->assertForbidden();
    });

    it('stops a viewer from finalizing a memo', function () {
        $memo = Memo::factory()->create([
            'status' => 'draft',
            'created_by' => $this->officer->id,
            'department_id' => $this->department->id,
        ]);

        $this->actingAs($this->viewer)
            ->post(route('memos.finalize', $memo))
            ->assertForbidden();

        expect($memo->fresh()->status)->toBe('draft');
    });
});

describe('notifications', function () {
    it('stops a user reading another user notification', function () {
        $notification = AppNotification::create([
            'user_id' => $this->admin->id,
            'type' => 'voucher.pending',
            'title' => 'Private to the admin',
        ]);

        $this->actingAs($this->officer)
            ->post(route('notifications.read', $notification))
            ->assertForbidden();

        expect($notification->fresh()->read_at)->toBeNull();
    });

    it('only lists the signed-in user notifications', function () {
        AppNotification::create([
            'user_id' => $this->admin->id,
            'type' => 'voucher.pending',
            'title' => 'Admin only notification',
        ]);

        $this->actingAs($this->officer)
            ->get(route('notifications.index'))
            ->assertOk()
            ->assertDontSee('Admin only notification');
    });
});

describe('audit log', function () {
    it('stops a non-admin from reading the system audit log', function () {
        $this->actingAs($this->officer)
            ->get(route('system-logs.index'))
            ->assertForbidden();
    });

    it('allows an administrator to read the system audit log', function () {
        $this->actingAs($this->admin)
            ->get(route('system-logs.index'))
            ->assertOk();
    });
});

describe('guests', function () {
    it('redirects guests away from every protected page', function (string $route) {
        $this->get($route)->assertRedirect(route('login'));
    })->with([
        fn () => route('dashboard'),
        fn () => route('payment-vouchers.index'),
        fn () => route('payment-vouchers.pending'),
        fn () => route('users.index'),
        fn () => route('system-logs.index'),
        fn () => route('ledgers.index'),
        fn () => route('memos.index'),
        fn () => route('documents.index'),
        fn () => route('notifications.index'),
    ]);

    it('stops a guest from posting to a state-changing endpoint', function () {
        $voucher = PaymentVoucher::factory()->create([
            'status' => 'pending',
            'created_by' => $this->officer->id,
            'department_id' => $this->department->id,
        ]);

        $this->post(route('payment-vouchers.review', $voucher), ['action' => 'approve'])
            ->assertRedirect(route('login'));

        expect($voucher->fresh()->status)->toBe('pending');
    });
});

describe('inactive accounts', function () {
    it('signs out a user who has been deactivated mid-session', function () {
        $this->officer->update(['is_active' => false]);

        $this->actingAs($this->officer)
            ->get(route('payment-vouchers.index'))
            ->assertRedirect(route('login'));

        $this->assertGuest();
    });
});

describe('ledger', function () {
    it('does not expose a way to write ledger entries directly', function () {
        expect(collect(app('router')->getRoutes())->contains(
            fn ($route) => str_starts_with($route->uri(), 'ledgers')
                && ! in_array('GET', $route->methods(), true),
        ))->toBeFalse();
    });

    it('keeps the chart of accounts readable but offers no write route', function () {
        $this->actingAs($this->viewer)
            ->get(route('ledgers.chart-of-accounts'))
            ->assertOk();
    });
});
