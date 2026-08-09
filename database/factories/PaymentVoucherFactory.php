<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\PaymentVoucher;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PaymentVoucher>
 */
class PaymentVoucherFactory extends Factory
{
    protected $model = PaymentVoucher::class;

    public function definition(): array
    {
        $status = fake()->randomElement(['draft', 'pending', 'approved', 'rejected', 'paid']);

        return [
            'voucher_number' => 'PV-'.date('Y').'-'.str_pad((string) fake()->unique()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT),
            'voucher_date' => fake()->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
            'payee_name' => fake()->company(),
            'payee_account_number' => fake()->numerify('##############'),
            'payee_bank' => fake()->randomElement(['GCB Bank', 'Ecobank', 'Stanbic Bank', 'CalBank', 'Absa Bank']),
            'payee_phone' => fake()->numerify('+233 ### ### ###'),
            'description' => fake()->sentence(8),
            'amount' => fake()->randomFloat(2, 1000, 250000),
            'payment_method' => fake()->randomElement(['cheque', 'bank_transfer', 'cash']),
            'cheque_number' => null,
            'payment_reference' => fake()->optional()->numerify('REF-#######'),
            'budget_line' => fake()->randomElement(['Office Supplies', 'Staff Training', 'Equipment Purchase', 'Utilities', 'Travel & Transport', 'Consultancy Services']),
            'budget_code' => fake()->numerify('####-##-##'),
            'department_id' => Department::factory(),
            'status' => $status,
            'created_by' => User::factory(),
            'approved_by' => null,
            'rejected_by' => null,
            'paid_by' => null,
            'submitted_at' => null,
            'approved_at' => null,
            'rejected_at' => null,
            'paid_at' => null,
            'rejection_reason' => null,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'submitted_at' => null,
            'approved_at' => null,
            'rejected_at' => null,
            'paid_at' => null,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'submitted_at' => now(),
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'submitted_at' => now()->subDays(2),
            'approved_at' => now()->subDay(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'submitted_at' => now()->subDays(3),
            'rejected_at' => now()->subDays(2),
            'rejection_reason' => fake()->sentence(),
        ]);
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'submitted_at' => now()->subDays(5),
            'approved_at' => now()->subDays(4),
            'paid_at' => now()->subDays(3),
        ]);
    }
}
