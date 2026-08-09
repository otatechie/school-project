<?php

namespace App\Policies;

use App\Models\Department;
use App\Models\User;

/**
 * Departments are reference data every voucher points at, so only an
 * administrator may change the list.
 */
class DepartmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * A department with vouchers against it cannot be removed — deleting it
     * would orphan financial records that must stay traceable.
     */
    public function delete(User $user, Department $department): bool
    {
        return $user->isAdmin() && ! $department->paymentVouchers()->exists();
    }
}
