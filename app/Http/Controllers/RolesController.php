<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RolesController extends Controller
{
    /**
     * Roles are fixed in code and enforced by policies; this page documents
     * what each role may do and who currently holds it.
     */
    private const ABILITIES = [
        User::ROLE_ADMIN => [
            'Full access to every area',
            'Manage staff, departments and the audit log',
            'May approve a voucher they prepared, which is logged',
        ],
        User::ROLE_APPROVER => [
            'Approve or return submitted vouchers',
            'Only up to their own approval limit',
            'Cannot approve a voucher they prepared',
        ],
        User::ROLE_FINANCE_OFFICER => [
            'Prepare and edit draft vouchers',
            'Attach supporting documents',
            'Mark approved vouchers as paid',
        ],
        User::ROLE_VIEWER => [
            'Read vouchers, memos and the ledger',
            'Cannot create or change anything',
        ],
    ];

    public function index(Request $request): Response
    {
        $members = User::query()
            ->with('department:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'department_id', 'is_active', 'approval_limit']);

        $roles = collect(User::roles())
            ->map(function (string $label, string $key) use ($members) {
                $holders = $members->where('role', $key);

                return [
                    'key' => $key,
                    'label' => $label,
                    'abilities' => self::ABILITIES[$key] ?? [],
                    // Named holders rather than a bare count, so the page
                    // answers "who is an approver?" without a second table.
                    'holders' => $holders->map(fn (User $user) => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'department' => $user->department?->name,
                        'is_active' => (bool) $user->is_active,
                        'limit' => $user->approval_limit !== null
                            ? 'GHS '.number_format((float) $user->approval_limit, 2)
                            : null,
                    ])->values(),
                ];
            })
            ->values();

        return Inertia::render('roles-permissions/index', [
            'roles' => $roles,
            'canManageStaff' => $request->user()->can('update', User::class),
        ]);
    }
}
