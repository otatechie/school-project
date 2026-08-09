<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\AppNotification;
use App\Models\Department;
use App\Models\Memo;
use App\Models\PaymentVoucher;
use App\Models\SystemLog;
use App\Models\User;
use App\Services\LedgerPoster;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * A working demonstration of one term's expenditure at a district education
 * office: real Ghanaian suppliers and schools, plausible amounts, and vouchers
 * spread across every stage of the approval workflow.
 *
 * The data is arranged so a demonstration can show, without any setup:
 *   - a queue of vouchers waiting for approval, one of which is a duplicate
 *     and one of which is far larger than the department's norm
 *   - a voucher returned for correction, with the reason attached
 *   - paid vouchers already posted to a balanced ledger
 *   - a memo raised against a paid voucher
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $departments = $this->departments();
        $staff = $this->staff($departments);

        $this->chartOfAccounts();
        $this->vouchers($departments, $staff);
        $this->memos($departments, $staff);
        $this->postToLedger();
        $this->auditTrail($staff);
        $this->notifications($staff);
    }

    /**
     * @return array<string, Department>
     */
    private function departments(): array
    {
        return [
            'finance' => Department::create(['name' => 'Finance and Administration', 'code' => 'FIN']),
            'schools' => Department::create(['name' => 'Schools and Instruction', 'code' => 'SCH']),
            'estates' => Department::create(['name' => 'Estates and Maintenance', 'code' => 'EST']),
            'exams' => Department::create(['name' => 'Examinations and Records', 'code' => 'EXM']),
            'welfare' => Department::create(['name' => 'Staff Welfare', 'code' => 'WEL']),
        ];
    }

    /**
     * @param  array<string, Department>  $departments
     * @return array<string, User>
     */
    private function staff(array $departments): array
    {
        // Deliberately not User::factory(): factories call fake(), which lives
        // in require-dev and is absent from the production image, so seeding on
        // deploy would fail with "undefined function fake()". Every field the
        // factory would generate is overridden here anyway.
        $make = function (array $attributes): User {
            $user = new User([
                'password' => Hash::make(config('demo.password')),
                'is_active' => true,
                ...$attributes,
            ]);

            // Not fillable, and deliberately so: nothing in the application may
            // mark an account verified through mass assignment.
            $user->email_verified_at = now();
            $user->save();

            return $user;
        };

        $superadmin = config('demo.superadmin');

        return [
            // The account an assessor signs in as. Kept separate from the
            // Municipal Director so the demonstration has an administrator
            // that is not also a participant in the workflow being shown.
            'superadmin' => $make([
                ...$superadmin,
                'department_id' => $departments['finance']->id,
                'role' => User::ROLE_ADMIN,
            ]),
            'director' => $make([
                'name' => 'Kwabena Osei-Bonsu',
                'email' => 'director@govpay.test',
                'staff_id' => 'AMEO-0001',
                'department_id' => $departments['finance']->id,
                'position' => 'Municipal Director of Education',
                'role' => User::ROLE_ADMIN,
            ]),
            'accountant' => $make([
                'name' => 'Ama Serwaa Boakye',
                'email' => 'accountant@govpay.test',
                'staff_id' => 'AMEO-0002',
                'department_id' => $departments['finance']->id,
                'position' => 'District Accountant',
                'role' => User::ROLE_FINANCE_OFFICER,
            ]),
            'officer' => $make([
                'name' => 'Kofi Mensah Agyapong',
                'email' => 'officer@govpay.test',
                'staff_id' => 'AMEO-0003',
                'department_id' => $departments['finance']->id,
                'position' => 'Accounts Officer',
                'role' => User::ROLE_FINANCE_OFFICER,
            ]),
            'approver' => $make([
                'name' => 'Yaw Boateng Frimpong',
                'email' => 'approver@govpay.test',
                'staff_id' => 'AMEO-0004',
                'department_id' => $departments['finance']->id,
                'position' => 'Assistant Director, Finance',
                'role' => User::ROLE_APPROVER,
                'approval_limit' => 50000,
            ]),
            'senior' => $make([
                'name' => 'Efua Danquah-Mireku',
                'email' => 'senior@govpay.test',
                'staff_id' => 'AMEO-0005',
                'department_id' => $departments['finance']->id,
                'position' => 'Deputy Director',
                'role' => User::ROLE_APPROVER,
                'approval_limit' => 250000,
            ]),
            'viewer' => $make([
                'name' => 'Adwoa Nyarko Sarpong',
                'email' => 'auditor@govpay.test',
                'staff_id' => 'AMEO-0006',
                'department_id' => $departments['exams']->id,
                'position' => 'Internal Auditor',
                'role' => User::ROLE_VIEWER,
            ]),
        ];
    }

    private function chartOfAccounts(): void
    {
        foreach ([
            ['1100', 'Cash', 'asset'],
            ['1200', 'Bank', 'asset'],
            ['1300', 'Accounts Receivable', 'asset'],
            ['2100', 'Accounts Payable', 'liability'],
            ['2200', 'Accrued Expenses', 'liability'],
            ['3100', 'Accumulated Fund', 'equity'],
            ['4100', 'Government Subvention', 'revenue'],
            ['4200', 'Internally Generated Funds', 'revenue'],
            ['5100', 'Office Supplies', 'expense'],
            ['5200', 'Salaries and Wages', 'expense'],
            ['5300', 'Travel and Transport', 'expense'],
            ['5400', 'Utilities', 'expense'],
            ['5500', 'Repairs and Maintenance', 'expense'],
            ['5900', 'General Expenses', 'expense'],
        ] as [$code, $name, $type]) {
            Account::create(['code' => $code, 'name' => $name, 'type' => $type]);
        }
    }

    /**
     * @param  array<string, Department>  $departments
     * @param  array<string, User>  $staff
     */
    private function vouchers(array $departments, array $staff): void
    {
        $sequence = 1;

        $create = function (array $attributes) use (&$sequence) {
            return PaymentVoucher::create([
                'voucher_number' => 'PV-'.date('Y').'-'.str_pad((string) $sequence++, 3, '0', STR_PAD_LEFT),
                'payee_bank' => 'GCB Bank',
                'payee_account_number' => (string) random_int(1000000000000, 9999999999999),
                'budget_code' => '2601-'.random_int(10, 99).'-'.random_int(10, 99),
                ...$attributes,
            ]);
        };

        // ── Paid: eight months of routine expenditure, spread so the monthly
        //    chart has a shape and the department chart has a clear leader.
        $paid = [
            ['Adom Stationers Limited', 4850.00, 'Office Supplies', 'Supply of exercise books, chalk and printer toner for the district office', 'cheque', 8],
            ['Ghana Water Company Limited', 1240.00, 'Utilities', 'Water bill for the district education office, first quarter', 'bank_transfer', 7],
            ['Electricity Company of Ghana', 3180.00, 'Utilities', 'Electricity bill for the district education office and stores', 'bank_transfer', 7],
            ['Nyame Nnae Ventures', 12500.00, 'Repairs and Maintenance', 'Repair of leaking roof at Adentan Community Basic School block B', 'cheque', 6],
            ['Total Ghana Limited', 2960.00, 'Travel and Transport', 'Fuel for the district monitoring vehicle, school supervision visits', 'cash', 6],
            ['Sunrise Printing Press', 6740.00, 'Office Supplies', 'Printing of BECE mock examination papers and answer booklets', 'cheque', 5],
            ['Frimpong Electricals', 8900.00, 'Repairs and Maintenance', 'Rewiring of the science laboratory at Adentan SHS', 'cheque', 4],
            ['Total Ghana Limited', 3120.00, 'Travel and Transport', 'Fuel for circuit supervisors during second term monitoring', 'cash', 4],
            ['Adom Stationers Limited', 5290.00, 'Office Supplies', 'Supply of A4 paper, files and stationery for the examinations unit', 'cheque', 3],
            ['Mensah Catering Services', 7450.00, 'General Expenses', 'Refreshment for the district head teachers term review meeting', 'cheque', 3],
            ['Ghana Water Company Limited', 1310.00, 'Utilities', 'Water bill for the district education office, second quarter', 'bank_transfer', 2],
            ['Kwame Furniture Works', 18600.00, 'Repairs and Maintenance', 'Supply and repair of 60 dual desks for Adentan Community Basic School', 'bank_transfer', 2],
            ['Oseikrom Plumbing Works', 9750.00, 'Repairs and Maintenance', 'Replacement of water tanks and pipework at Adentan Presby Basic School', 'cheque', 5],
            ['Danquah Roofing Services', 14200.00, 'Repairs and Maintenance', 'Replacement of roofing sheets at Adentan Methodist Primary School', 'cheque', 3],
            ['Akosombo Paints Limited', 6300.00, 'Repairs and Maintenance', 'Painting of classroom blocks at Adentan Community Basic School', 'cash', 1],
        ];

        foreach ($paid as [$payee, $amount, $line, $description, $method, $monthsAgo]) {
            $created = now()->subMonths($monthsAgo)->subDays(random_int(1, 20));

            $create([
                'voucher_date' => $created->toDateString(),
                'payee_name' => $payee,
                'description' => $description,
                'amount' => $amount,
                'payment_method' => $method,
                'cheque_number' => $method === 'cheque' ? (string) random_int(100000, 999999) : null,
                'budget_line' => $line,
                'department_id' => $this->departmentFor($line, $departments)->id,
                'status' => 'paid',
                'created_by' => $staff['officer']->id,
                'submitted_at' => $created->copy()->addDay(),
                'approved_by' => $staff['approver']->id,
                'approved_at' => $created->copy()->addDays(2),
                'paid_by' => $staff['accountant']->id,
                'paid_at' => $created->copy()->addDays(4),
                'created_at' => $created,
                'updated_at' => $created->copy()->addDays(4),
            ]);
        }

        // ── Pending: the approval queue a demonstration opens on.
        $create([
            'voucher_date' => now()->subDays(6)->toDateString(),
            'payee_name' => 'Adom Stationers Limited',
            'description' => 'Supply of exercise books and chalk for the third term',
            'amount' => 5290.00,
            'payment_method' => 'cheque',
            'cheque_number' => '204471',
            'budget_line' => 'Office Supplies',
            'department_id' => $departments['finance']->id,
            'status' => 'pending',
            'created_by' => $staff['officer']->id,
            'submitted_at' => now()->subDays(5),
            'created_at' => now()->subDays(6),
        ]);

        // Same payee and amount as the voucher above, inside the 30-day
        // window — the duplicate check flags this one.
        $create([
            'voucher_date' => now()->subDays(2)->toDateString(),
            'payee_name' => 'Adom Stationers Limited',
            'description' => 'Supply of exercise books and chalk for third term',
            'amount' => 5290.00,
            'payment_method' => 'cheque',
            'cheque_number' => '204488',
            'budget_line' => 'Office Supplies',
            'department_id' => $departments['finance']->id,
            'status' => 'pending',
            'created_by' => $staff['officer']->id,
            'submitted_at' => now()->subDays(2),
            'created_at' => now()->subDays(2),
        ]);

        // Far above the estates department's usual range — the outlier check
        // flags this, and it also exceeds the junior approver's ceiling.
        $create([
            'voucher_date' => now()->subDays(4)->toDateString(),
            'payee_name' => 'Sankofa Construction Limited',
            'description' => 'Construction of a three-unit classroom block at Adentan Community Basic School',
            'amount' => 186000.00,
            'payment_method' => 'bank_transfer',
            'budget_line' => 'Repairs and Maintenance',
            'department_id' => $departments['estates']->id,
            'status' => 'pending',
            'created_by' => $staff['accountant']->id,
            'submitted_at' => now()->subDays(4),
            'created_at' => now()->subDays(4),
        ]);

        // The budget line contradicts the description — the third check fires.
        $create([
            'voucher_date' => now()->subDays(3)->toDateString(),
            'payee_name' => 'Total Ghana Limited',
            'description' => 'Fuel and transport allowance for circuit supervisors',
            'amount' => 4200.00,
            'payment_method' => 'cash',
            'budget_line' => 'Office Supplies',
            'department_id' => $departments['schools']->id,
            'status' => 'pending',
            'created_by' => $staff['officer']->id,
            'submitted_at' => now()->subDays(3),
            'created_at' => now()->subDays(3),
        ]);

        // ── Approved, waiting on the accountant to release payment.
        $create([
            'voucher_date' => now()->subDays(8)->toDateString(),
            'payee_name' => 'Ghana Education Service Welfare Fund',
            'description' => 'Third term staff welfare contribution for the district office',
            'amount' => 9600.00,
            'payment_method' => 'bank_transfer',
            'budget_line' => 'Salaries and Wages',
            'department_id' => $departments['welfare']->id,
            'status' => 'approved',
            'created_by' => $staff['accountant']->id,
            'submitted_at' => now()->subDays(7),
            'approved_by' => $staff['approver']->id,
            'approved_at' => now()->subDays(5),
            'created_at' => now()->subDays(8),
        ]);

        // ── Returned for correction, with a reason the preparer can act on.
        $create([
            'voucher_date' => now()->subDays(11)->toDateString(),
            'payee_name' => 'Bright Star Enterprise',
            'description' => 'Supply of sports equipment for the district athletics competition',
            'amount' => 14300.00,
            'payment_method' => 'cheque',
            'cheque_number' => '204455',
            'budget_line' => 'General Expenses',
            'department_id' => $departments['schools']->id,
            'status' => 'rejected',
            'created_by' => $staff['officer']->id,
            'submitted_at' => now()->subDays(10),
            'rejected_by' => $staff['approver']->id,
            'rejected_at' => now()->subDays(9),
            'rejection_reason' => 'The supplier invoice was not attached and the quantities do not match the requisition. Please attach the invoice and resubmit.',
            'created_at' => now()->subDays(11),
        ]);

        // ── Drafts still being prepared.
        $create([
            'voucher_date' => now()->subDay()->toDateString(),
            'payee_name' => 'Ecobank Ghana Limited',
            'description' => 'Bank charges on the district education office operating account',
            'amount' => 420.00,
            'payment_method' => 'bank_transfer',
            'budget_line' => 'General Expenses',
            'department_id' => $departments['finance']->id,
            'status' => 'draft',
            'created_by' => $staff['officer']->id,
            'created_at' => now()->subDay(),
        ]);

        $create([
            'voucher_date' => now()->toDateString(),
            'payee_name' => 'Adentan Municipal Assembly',
            'description' => 'Property rate on the district education office premises',
            'amount' => 2750.00,
            'payment_method' => 'cheque',
            'cheque_number' => '204502',
            'budget_line' => 'General Expenses',
            'department_id' => $departments['finance']->id,
            'status' => 'draft',
            'created_by' => $staff['accountant']->id,
            'created_at' => now(),
        ]);
    }

    /**
     * @param  array<string, Department>  $departments
     */
    private function departmentFor(string $budgetLine, array $departments): Department
    {
        return match ($budgetLine) {
            'Repairs and Maintenance' => $departments['estates'],
            'Travel and Transport' => $departments['schools'],
            'Salaries and Wages' => $departments['welfare'],
            default => $departments['finance'],
        };
    }

    /**
     * @param  array<string, Department>  $departments
     * @param  array<string, User>  $staff
     */
    private function memos(array $departments, array $staff): void
    {
        $paid = PaymentVoucher::where('status', 'paid')->orderBy('paid_at')->get();

        $entries = [
            ['Payment for classroom furniture at Adentan Community Basic School', 'printed'],
            ['Settlement of second quarter utility bills', 'printed'],
            ['Payment for third term examination materials', 'finalized'],
            ['Repair works at Adentan Senior High School laboratory', 'finalized'],
            ['Fuel and transport for circuit supervision', 'draft'],
        ];

        foreach ($entries as $index => [$subject, $status]) {
            $voucher = $paid->get($index);

            if (! $voucher) {
                continue;
            }

            Memo::create([
                'memo_number' => 'MEMO-'.date('Y').'-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                'memo_date' => $voucher->paid_at->toDateString(),
                'subject' => $subject,
                'body' => sprintf(
                    "This is to record that payment of GHS %s was made to %s on %s in respect of %s.\n\nThe payment was charged to the %s budget line and approved under voucher %s.\n\nThe supporting documents are on file in the accounts office.",
                    number_format((float) $voucher->amount, 2),
                    $voucher->payee_name,
                    $voucher->paid_at->format('j F Y'),
                    lcfirst($voucher->description),
                    $voucher->budget_line,
                    $voucher->voucher_number,
                ),
                'to_name' => 'The Municipal Director of Education',
                'from_name' => $staff['accountant']->name,
                'department_id' => $voucher->department_id,
                'voucher_id' => $voucher->id,
                'status' => $status,
                'created_by' => $staff['accountant']->id,
                'created_at' => $voucher->paid_at,
            ]);
        }
    }

    private function postToLedger(): void
    {
        $poster = app(LedgerPoster::class);

        PaymentVoucher::where('status', 'paid')
            ->orderBy('paid_at')
            ->get()
            ->each(fn (PaymentVoucher $voucher) => $poster->post($voucher));
    }

    /**
     * @param  array<string, User>  $staff
     */
    private function auditTrail(array $staff): void
    {
        $log = fn (array $attributes) => SystemLog::create([
            'ip_address' => '196.61.34.'.random_int(2, 250),
            ...$attributes,
        ]);

        foreach (PaymentVoucher::orderBy('created_at')->get() as $voucher) {
            $log([
                'action' => 'voucher.created',
                'description' => "Created voucher {$voucher->voucher_number}.",
                'subject_type' => PaymentVoucher::class,
                'subject_id' => $voucher->id,
                'user_id' => $voucher->created_by,
                'created_at' => $voucher->created_at,
                'updated_at' => $voucher->created_at,
            ]);

            if ($voucher->submitted_at) {
                $log([
                    'action' => 'voucher.submitted',
                    'description' => "Submitted voucher {$voucher->voucher_number} for approval.",
                    'subject_type' => PaymentVoucher::class,
                    'subject_id' => $voucher->id,
                    'user_id' => $voucher->created_by,
                    'created_at' => $voucher->submitted_at,
                    'updated_at' => $voucher->submitted_at,
                ]);
            }

            if ($voucher->approved_at) {
                $log([
                    'action' => 'voucher.approved',
                    'description' => "Voucher {$voucher->voucher_number} was approved.",
                    'subject_type' => PaymentVoucher::class,
                    'subject_id' => $voucher->id,
                    'user_id' => $voucher->approved_by,
                    'created_at' => $voucher->approved_at,
                    'updated_at' => $voucher->approved_at,
                ]);
            }

            if ($voucher->rejected_at) {
                $log([
                    'action' => 'voucher.rejected',
                    'description' => "Voucher {$voucher->voucher_number} was rejected.",
                    'subject_type' => PaymentVoucher::class,
                    'subject_id' => $voucher->id,
                    'user_id' => $voucher->rejected_by,
                    'created_at' => $voucher->rejected_at,
                    'updated_at' => $voucher->rejected_at,
                ]);
            }

            if ($voucher->paid_at) {
                $log([
                    'action' => 'voucher.paid',
                    'description' => "Marked voucher {$voucher->voucher_number} as paid.",
                    'subject_type' => PaymentVoucher::class,
                    'subject_id' => $voucher->id,
                    'user_id' => $voucher->paid_by,
                    'created_at' => $voucher->paid_at,
                    'updated_at' => $voucher->paid_at,
                ]);
            }
        }

        $log([
            'action' => 'auth.login',
            'description' => 'Signed in to the system.',
            'user_id' => $staff['director']->id,
            'created_at' => now()->subHours(2),
            'updated_at' => now()->subHours(2),
        ]);
    }

    /**
     * @param  array<string, User>  $staff
     */
    private function notifications(array $staff): void
    {
        $router = app(\App\Services\ApprovalRouter::class);

        PaymentVoucher::where('status', 'pending')->get()->each(
            function (PaymentVoucher $voucher) use ($router) {
                $router->approversFor($voucher)->each(fn (User $approver) => AppNotification::create([
                    'user_id' => $approver->id,
                    'type' => 'voucher.pending',
                    'title' => "Voucher {$voucher->voucher_number} awaits approval",
                    'body' => $voucher->payee_name.', GHS '.number_format((float) $voucher->amount, 2),
                    'link' => '/payment-vouchers/pending',
                    'created_at' => $voucher->submitted_at,
                ]));
            }
        );

        AppNotification::create([
            'user_id' => $staff['officer']->id,
            'type' => 'voucher.rejected',
            'title' => 'A voucher you prepared was returned',
            'body' => 'The supplier invoice was not attached. Please correct and resubmit.',
            'link' => '/payment-vouchers/rejected',
            'created_at' => now()->subDays(9),
        ]);

        AppNotification::create([
            'user_id' => $staff['officer']->id,
            'type' => 'voucher.paid',
            'title' => 'A voucher you prepared has been paid',
            'body' => 'Payment has been released and posted to the ledger.',
            'link' => '/payment-vouchers',
            'read_at' => now()->subHours(3),
            'created_at' => now()->subDays(2),
        ]);
    }
}
