<?php

namespace App\Http\Controllers;

use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Department::class);

        $departments = Department::query()
            ->withCount('users')
            ->withCount('paymentVouchers')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%"));
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('departments/index', [
            'departments' => $departments,
            'stats' => [
                'total' => Department::count(),
                'active' => Department::where('is_active', true)->count(),
            ],
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Department::class);

        return Inertia::render('departments/create');
    }

    public function store(StoreDepartmentRequest $request): RedirectResponse
    {
        $this->authorize('create', Department::class);

        Department::create($request->validated());

        return redirect()
            ->route('departments.index')
            ->with('success', 'Department created successfully.');
    }

    public function edit(Department $department): Response
    {
        $this->authorize('update', $department);

        return Inertia::render('departments/edit', [
            'department' => $department,
        ]);
    }

    public function update(
        UpdateDepartmentRequest $request,
        Department $department
    ): RedirectResponse {
        $this->authorize('update', $department);

        $department->update($request->validated());

        return redirect()
            ->route('departments.index')
            ->with('success', 'Department updated successfully.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        $this->authorize('delete', $department);

        $name = $department->name;

        $department->delete();

        return redirect()
            ->route('departments.index')
            ->with('success', "{$name} was removed.");
    }
}
