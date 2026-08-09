<?php

namespace App\Policies;

use App\Models\User;

/**
 * Staff administration is an administrator-only function.
 *
 * Creating accounts and changing roles is how authority is granted in this
 * system, so it is the one area where a mistake compromises everything else.
 */
class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, User $target): bool
    {
        // Removing your own account would lock you out mid-session, and the
        // office must never be left without an administrator.
        return $user->isAdmin() && $user->id !== $target->id;
    }
}
