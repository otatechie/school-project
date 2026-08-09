<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->with('department:id,name')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('staff_id', 'like', "%{$search}%"));
            })
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->string('role')))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => User::roles(),
            'stats' => [
                'total' => User::count(),
                'active' => User::where('is_active', true)->count(),
                'inactive' => User::where('is_active', false)->count(),
            ],
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('users/create', [
            'departments' => Department::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'roles' => User::roles(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'staff_id' => ['nullable', 'string', 'max:50'],
            'position' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'department_id' => ['required', 'exists:departments,id'],
            'role' => ['required', Rule::in(array_keys(User::roles()))],
            'is_active' => ['boolean'],
        ]);

        $user = User::create($validated + [
            'password' => bcrypt('password'),
        ]);

        AuditLogger::record('user.created', "Created user {$user->name}.", $user);

        return redirect()->route('users.index')
            ->with('success', "{$user->name} was added.");
    }

    public function edit(string $id): Response
    {
        $this->authorize('update', User::class);

        $user = User::findOrFail($id);

        return Inertia::render('users/edit', [
            'user' => $user->only([
                'id', 'name', 'email', 'staff_id', 'position', 'phone',
                'department_id', 'role', 'is_active',
            ]),
            'departments' => Department::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'roles' => User::roles(),
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $this->authorize('update', User::class);

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'staff_id' => ['nullable', 'string', 'max:50'],
            'position' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'department_id' => ['required', 'exists:departments,id'],
            'role' => [
                'required',
                Rule::in(array_keys(User::roles())),
                // An administrator demoting themselves would lose access
                // immediately, potentially leaving the office with none.
                Rule::when(
                    $user->id === $request->user()->id && $user->isAdmin(),
                    [Rule::in([User::ROLE_ADMIN])],
                ),
            ],
            'approval_limit' => ['nullable', 'numeric', 'min:0', 'max:99999999999999'],
            'is_active' => ['boolean'],
        ], [
            'role.in' => 'You cannot remove your own administrator role.',
        ]);

        // Only approvers carry a ceiling; clear it for everyone else so a
        // stale limit cannot linger on a role that ignores it.
        if (! in_array($validated['role'], [User::ROLE_APPROVER, User::ROLE_ADMIN], true)) {
            $validated['approval_limit'] = null;
        }

        $user->update($validated);

        AuditLogger::record('user.updated', "Updated user {$user->name}.", $user);

        return redirect()->route('users.index')
            ->with('success', "{$user->name} was updated.");
    }
}
