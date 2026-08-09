<?php

namespace App\Policies;

use App\Models\PaymentVoucher;
use App\Models\User;
use App\Services\ApprovalRouter;

class PaymentVoucherPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(User::ROLE_ADMIN, User::ROLE_FINANCE_OFFICER);
    }

    /**
     * Only unsubmitted or returned vouchers may be edited, and only by the
     * roles that prepare them. An approved or paid voucher is a financial
     * record and must not change.
     */
    public function update(User $user, PaymentVoucher $voucher): bool
    {
        if (! in_array($voucher->status, ['draft', 'rejected'], true)) {
            return false;
        }

        return $user->hasRole(User::ROLE_ADMIN, User::ROLE_FINANCE_OFFICER);
    }

    public function delete(User $user, PaymentVoucher $voucher): bool
    {
        return $voucher->status === 'draft'
            && $user->hasRole(User::ROLE_ADMIN, User::ROLE_FINANCE_OFFICER);
    }

    public function submit(User $user, PaymentVoucher $voucher): bool
    {
        return $voucher->status === 'draft'
            && $user->hasRole(User::ROLE_ADMIN, User::ROLE_FINANCE_OFFICER);
    }

    /**
     * Separation of duties: the person who prepared a voucher may not approve
     * it, and no approver may release more than their delegated ceiling.
     */
    public function review(User $user, PaymentVoucher $voucher): bool
    {
        if ($voucher->status !== 'pending') {
            return false;
        }

        if ($voucher->created_by === $user->id && ! $user->isAdmin()) {
            return false;
        }

        if (! $user->hasRole(User::ROLE_ADMIN, User::ROLE_APPROVER)) {
            return false;
        }

        return app(ApprovalRouter::class)->canApprove($user, $voucher);
    }

    public function markPaid(User $user, PaymentVoucher $voucher): bool
    {
        return $voucher->status === 'approved'
            && $user->hasRole(User::ROLE_ADMIN, User::ROLE_FINANCE_OFFICER);
    }
}
