<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\PaymentVoucher;
use App\Models\User;

class Notifier
{
    public static function toUser(?string $userId, string $type, string $title, ?string $body = null, ?string $link = null): void
    {
        if (! $userId) {
            return;
        }

        AppNotification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'link' => $link,
        ]);
    }

    /**
     * Notify everyone who can act on approvals.
     */
    public static function toApprovers(string $type, string $title, ?string $body = null, ?string $link = null): void
    {
        User::query()
            ->whereIn('role', [User::ROLE_ADMIN, User::ROLE_APPROVER])
            ->where('is_active', true)
            ->pluck('id')
            ->each(fn ($id) => self::toUser($id, $type, $title, $body, $link));
    }

    /**
     * Notify only the approvers whose delegated ceiling covers this voucher.
     *
     * Routing by value keeps a GHS 300,000 payment out of a junior officer's
     * queue, and keeps routine spending off the executive's.
     */
    public static function toApproversFor(PaymentVoucher $voucher, string $type, string $title, ?string $body = null, ?string $link = null): void
    {
        app(ApprovalRouter::class)
            ->approversFor($voucher)
            ->each(fn (User $user) => self::toUser($user->id, $type, $title, $body, $link));
    }
}
