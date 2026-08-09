<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Memo;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Memo>
 */
class MemoFactory extends Factory
{
    protected $model = Memo::class;

    public function definition(): array
    {
        return [
            'memo_number' => 'MEMO-'.date('Y').'-'.str_pad((string) fake()->unique()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT),
            'memo_date' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'subject' => fake()->sentence(6),
            'body' => fake()->paragraphs(3, true),
            'to_name' => fake()->name(),
            'to_designation' => fake()->randomElement(['Director', 'Deputy Director', 'Head of Department', 'Accountant']),
            'from_name' => fake()->name(),
            'from_designation' => fake()->randomElement(['Director', 'Deputy Director', 'Head of Department', 'Accountant']),
            'department_id' => Department::factory(),
            'voucher_id' => null,
            'created_by' => User::factory(),
            'status' => fake()->randomElement(['draft', 'finalized', 'printed']),
        ];
    }
}
