<?php

use App\Models\Department;
use App\Models\PaymentVoucher;
use App\Models\User;
use App\Services\VoucherChecks;

beforeEach(function () {
    $this->checks = app(VoucherChecks::class);
    $this->department = Department::factory()->create();
    $this->user = User::factory()->create();
});

/**
 * Create paid vouchers with the given amounts for the test department.
 *
 * @param  list<float>  $amounts
 */
function paidHistory(array $amounts, Department $department, User $user): void
{
    foreach ($amounts as $amount) {
        PaymentVoucher::factory()->create([
            'department_id' => $department->id,
            'created_by' => $user->id,
            'status' => 'paid',
            'paid_at' => now()->subDays(10),
            'amount' => $amount,
        ]);
    }
}

describe('duplicate detection', function () {
    it('flags the same payee and amount inside the 30-day window', function () {
        PaymentVoucher::factory()->create([
            'department_id' => $this->department->id,
            'created_by' => $this->user->id,
            'voucher_number' => 'PV-2026-001',
            'payee_name' => 'Adom Stationers Ltd',
            'amount' => 4500.00,
            'status' => 'paid',
            'created_at' => now()->subDays(5),
        ]);

        $voucher = PaymentVoucher::factory()->make([
            'department_id' => $this->department->id,
            'payee_name' => 'Adom Stationers Ltd',
            'amount' => 4500.00,
        ]);

        $finding = $this->checks->duplicate($voucher);

        expect($finding)->not->toBeNull()
            ->and($finding['type'])->toBe('duplicate')
            ->and($finding['severity'])->toBe('high')
            ->and($finding['message'])->toContain('PV-2026-001');
    });

    it('ignores an identical payment outside the window', function () {
        PaymentVoucher::factory()->create([
            'department_id' => $this->department->id,
            'created_by' => $this->user->id,
            'payee_name' => 'Adom Stationers Ltd',
            'amount' => 4500.00,
            'status' => 'paid',
            'created_at' => now()->subDays(45),
        ]);

        $voucher = PaymentVoucher::factory()->make([
            'payee_name' => 'Adom Stationers Ltd',
            'amount' => 4500.00,
        ]);

        expect($this->checks->duplicate($voucher))->toBeNull();
    });

    it('ignores a rejected voucher, which was never paid', function () {
        PaymentVoucher::factory()->create([
            'department_id' => $this->department->id,
            'created_by' => $this->user->id,
            'payee_name' => 'Adom Stationers Ltd',
            'amount' => 4500.00,
            'status' => 'rejected',
            'created_at' => now()->subDays(2),
        ]);

        $voucher = PaymentVoucher::factory()->make([
            'payee_name' => 'Adom Stationers Ltd',
            'amount' => 4500.00,
        ]);

        expect($this->checks->duplicate($voucher))->toBeNull();
    });

    it('does not claim a pending voucher was paid', function () {
        PaymentVoucher::factory()->create([
            'department_id' => $this->department->id,
            'created_by' => $this->user->id,
            'voucher_number' => 'PV-2026-050',
            'payee_name' => 'Adom Stationers Ltd',
            'amount' => 4500.00,
            'status' => 'pending',
            'paid_at' => null,
            'created_at' => now()->subDays(3),
        ]);

        $voucher = PaymentVoucher::factory()->make([
            'payee_name' => 'Adom Stationers Ltd',
            'amount' => 4500.00,
        ]);

        $finding = $this->checks->duplicate($voucher);

        // Telling an approver money already went out, when it has not, would
        // send them looking for a payment that does not exist.
        expect($finding['message'])->toContain('was raised on')
            ->and($finding['message'])->not->toContain('paid');
    });

    it('says a paid voucher was paid, and on its payment date', function () {
        PaymentVoucher::factory()->create([
            'department_id' => $this->department->id,
            'created_by' => $this->user->id,
            'voucher_number' => 'PV-2026-051',
            'payee_name' => 'Adom Stationers Ltd',
            'amount' => 4500.00,
            'status' => 'paid',
            'created_at' => now()->subDays(10),
            'paid_at' => now()->subDays(4),
        ]);

        $voucher = PaymentVoucher::factory()->make([
            'payee_name' => 'Adom Stationers Ltd',
            'amount' => 4500.00,
        ]);

        $finding = $this->checks->duplicate($voucher);

        expect($finding['message'])
            ->toContain('was paid on '.now()->subDays(4)->format('j M Y'));
    });

    it('does not flag a voucher against itself', function () {
        $voucher = PaymentVoucher::factory()->create([
            'department_id' => $this->department->id,
            'created_by' => $this->user->id,
            'payee_name' => 'Adom Stationers Ltd',
            'amount' => 4500.00,
            'status' => 'paid',
        ]);

        expect($this->checks->duplicate($voucher))->toBeNull();
    });
});

describe('amount outlier detection', function () {
    it('flags an amount more than two standard deviations above the mean', function () {
        paidHistory([5000, 5200, 4800, 5100, 4900, 5000], $this->department, $this->user);

        $voucher = PaymentVoucher::factory()->make([
            'department_id' => $this->department->id,
            'amount' => 50000.00,
        ]);

        $finding = $this->checks->amountOutlier($voucher);

        expect($finding)->not->toBeNull()
            ->and($finding['type'])->toBe('outlier')
            ->and($finding['severity'])->toBe('high')
            ->and($finding['message'])->toContain('standard deviations');
    });

    it('does not flag an amount within the normal range', function () {
        paidHistory([5000, 5200, 4800, 5100, 4900, 5000], $this->department, $this->user);

        $voucher = PaymentVoucher::factory()->make([
            'department_id' => $this->department->id,
            'amount' => 5150.00,
        ]);

        expect($this->checks->amountOutlier($voucher))->toBeNull();
    });

    it('stays silent when there is too little history to be meaningful', function () {
        paidHistory([5000, 5200], $this->department, $this->user);

        $voucher = PaymentVoucher::factory()->make([
            'department_id' => $this->department->id,
            'amount' => 500000.00,
        ]);

        expect($this->checks->amountOutlier($voucher))->toBeNull();
    });

    it('never flags an amount below the department average', function () {
        paidHistory([5000, 5200, 4800, 5100, 4900, 90000], $this->department, $this->user);

        $voucher = PaymentVoucher::factory()->make([
            'department_id' => $this->department->id,
            'amount' => 100.00,
        ]);

        expect($this->checks->amountOutlier($voucher))->toBeNull();
    });

    it('stays silent when every prior voucher is the same amount', function () {
        paidHistory([5000, 5000, 5000, 5000, 5000], $this->department, $this->user);

        $voucher = PaymentVoucher::factory()->make([
            'department_id' => $this->department->id,
            'amount' => 9000.00,
        ]);

        // Zero deviation would divide by zero; the check must decline instead.
        expect($this->checks->amountOutlier($voucher))->toBeNull();
    });
});

describe('budget line suggestion', function () {
    it('suggests a line from keywords in the description', function () {
        expect($this->checks->suggestBudgetLine('Purchase of printer toner and A4 paper'))
            ->toBe('Office Supplies');

        expect($this->checks->suggestBudgetLine('Fuel for the district monitoring vehicle'))
            ->toBe('Travel and Transport');

        expect($this->checks->suggestBudgetLine('Payment of December salary arrears'))
            ->toBe('Salaries and Wages');
    });

    it('returns nothing when the description gives no signal', function () {
        expect($this->checks->suggestBudgetLine('Payment as agreed'))->toBeNull();
        expect($this->checks->suggestBudgetLine(''))->toBeNull();
        expect($this->checks->suggestBudgetLine(null))->toBeNull();
    });

    it('declines to guess when two lines tie', function () {
        // One keyword each for Travel and Transport, and for Repairs and
        // Maintenance — an even split, so no suggestion is safe.
        expect($this->checks->suggestBudgetLine('Vehicle servicing'))->toBeNull();
    });

    it('flags a budget line that contradicts the description', function () {
        $voucher = PaymentVoucher::factory()->make([
            'description' => 'Purchase of printer toner and A4 paper',
            'budget_line' => 'Salaries and Wages',
        ]);

        $finding = $this->checks->budgetLineMismatch($voucher);

        expect($finding)->not->toBeNull()
            ->and($finding['type'])->toBe('budget_line')
            ->and($finding['message'])->toContain('Office Supplies');
    });

    it('accepts a budget line that matches the description', function () {
        $voucher = PaymentVoucher::factory()->make([
            'description' => 'Purchase of printer toner and A4 paper',
            'budget_line' => 'Office Supplies',
        ]);

        expect($this->checks->budgetLineMismatch($voucher))->toBeNull();
    });
});

it('runs every check together and returns a flat list', function () {
    paidHistory([5000, 5200, 4800, 5100, 4900, 5000], $this->department, $this->user);

    PaymentVoucher::factory()->create([
        'department_id' => $this->department->id,
        'created_by' => $this->user->id,
        'voucher_number' => 'PV-2026-077',
        'payee_name' => 'Adom Stationers Ltd',
        'amount' => 60000.00,
        'status' => 'pending',
        'created_at' => now()->subDay(),
    ]);

    $voucher = PaymentVoucher::factory()->make([
        'department_id' => $this->department->id,
        'payee_name' => 'Adom Stationers Ltd',
        'amount' => 60000.00,
        'description' => 'Purchase of printer toner and A4 paper',
        'budget_line' => 'Salaries and Wages',
    ]);

    $findings = $this->checks->run($voucher);

    expect($findings)->toHaveCount(3)
        ->and(array_column($findings, 'type'))
        ->toEqualCanonicalizing(['duplicate', 'outlier', 'budget_line']);
});
