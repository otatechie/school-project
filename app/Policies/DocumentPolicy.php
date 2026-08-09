<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

/**
 * Supporting documents are the evidence behind a payment: the invoice, the
 * receipt, the contract. They may be attached while a voucher is still being
 * prepared, and must not be removable once the payment has gone through.
 */
class DocumentPolicy
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

    /**
     * Evidence for a paid voucher is part of the financial record and stays.
     */
    public function delete(User $user, Document $document): bool
    {
        $voucher = $document->documentable;

        if ($voucher && in_array($voucher->status ?? '', ['paid', 'approved'], true)) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        return $document->uploaded_by === $user->id
            && $user->hasRole(User::ROLE_FINANCE_OFFICER);
    }
}
