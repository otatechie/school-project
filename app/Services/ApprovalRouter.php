<?php

namespace App\Services;

use App\Models\PaymentVoucher;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Decides which approvers may release a given voucher.
 *
 * Ghanaian public-sector expenditure control delegates authority by value: a
 * junior officer may clear routine spending, while larger sums must reach a
 * more senior signatory. This encodes that as an approval band derived from
 * the amount, matched against each approver's ceiling.
 */
class ApprovalRouter
{
    /**
     * Approval bands, from lowest to highest. `limit` is the inclusive upper
     * bound of the band; null on the last band means unlimited.
     *
     * @var list<array{level: int, label: string, limit: float|null}>
     */
    private const BANDS = [
        ['level' => 1, 'label' => 'Routine', 'limit' => 5000.0],
        ['level' => 2, 'label' => 'Standard', 'limit' => 50000.0],
        ['level' => 3, 'label' => 'Senior', 'limit' => 250000.0],
        ['level' => 4, 'label' => 'Executive', 'limit' => null],
    ];

    /**
     * The band a voucher's amount falls into.
     *
     * @return array{level: int, label: string, limit: float|null}
     */
    public function bandFor(PaymentVoucher $voucher): array
    {
        $amount = (float) $voucher->amount;

        foreach (self::BANDS as $band) {
            if ($band['limit'] === null || $amount <= $band['limit']) {
                return $band;
            }
        }

        return self::BANDS[array_key_last(self::BANDS)];
    }

    /**
     * Whether a user's own ceiling covers this voucher.
     *
     * Administrators have no ceiling by design — someone must be able to
     * release an urgent payment when the usual signatory is unavailable, and
     * the audit log records that they did.
     */
    public function canApprove(User $user, PaymentVoucher $voucher): bool
    {
        if ($user->isAdmin() || $user->approval_limit === null) {
            return true;
        }

        return (float) $voucher->amount <= (float) $user->approval_limit;
    }

    /**
     * Approvers whose ceiling covers this voucher, for notification routing.
     *
     * @return Collection<int, User>
     */
    public function approversFor(PaymentVoucher $voucher): Collection
    {
        return User::query()
            ->where('is_active', true)
            ->whereIn('role', [User::ROLE_ADMIN, User::ROLE_APPROVER])
            ->where(function ($query) use ($voucher) {
                $query->whereNull('approval_limit')
                    ->orWhere('approval_limit', '>=', (float) $voucher->amount);
            })
            // The preparer cannot approve their own voucher, so there is no
            // point telling them about it.
            ->whereNot('id', $voucher->created_by)
            ->get();
    }

    /**
     * A one-line explanation of where a voucher sits, for the approver's screen.
     */
    /**
     * The band a voucher sits in, named rather than spelled out.
     *
     * The band's own ceiling is a standing rule an approver already knows, so
     * repeating it on every row adds length without informing the decision.
     */
    public function describe(PaymentVoucher $voucher): string
    {
        $band = $this->bandFor($voucher);

        return sprintf('Level %d %s', $band['level'], $band['label']);
    }
}
