<?php

namespace App\Policies;

use App\Models\Memo;
use App\Models\User;

/**
 * Memos record a completed payment for the file. They are prepared by the
 * same staff who prepare vouchers, and become immutable once finalized.
 */
class MemoPolicy
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
        return $user->hasRole(User::ROLE_ADMIN, User::ROLE_FINANCE_OFFICER);
    }

    public function finalize(User $user, Memo $memo): bool
    {
        return $memo->status === 'draft'
            && $user->hasRole(User::ROLE_ADMIN, User::ROLE_FINANCE_OFFICER);
    }

    public function markPrinted(User $user, Memo $memo): bool
    {
        return $memo->status === 'finalized'
            && $user->hasRole(User::ROLE_ADMIN, User::ROLE_FINANCE_OFFICER);
    }
}
