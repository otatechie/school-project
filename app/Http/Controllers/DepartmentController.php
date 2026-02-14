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
    /**
     * Display a listing of the departments.
     */
    public function index(Request $request): Response
    {
        $departments = Department::query()
            ->withCount('users')
            ->latest()
            ->paginate(15);

        return Inertia::render('departments/index', [
            'departments' => $departments,
        ]);
    }

    /**
     * Show the form for creating a new department.
     */
    public function create(): Response
    {
        return Inertia::render('departments/create');
    }

    /**
     * Store a newly created department in storage.
     */
    public function store(StoreDepartmentRequest $request): RedirectResponse
    {
        Department::create($request->validated());

        return redirect()
            ->route('departments.index')
            ->with('success', 'Department created successfully.');
    }

    /**
     * Show the form for editing the specified department.
     */
    public function edit(Department $department): Response
    {
        return Inertia::render('departments/edit', [
            'department' => $department,
        ]);
    }

    /**
     * Update the specified department in storage.
     */
    public function update(
        UpdateDepartmentRequest $request,
        Department $department
    ): RedirectResponse {
        $department->update($request->validated());

        return redirect()
            ->route('departments.index')
            ->with('success', 'Department updated successfully.');
    }

    /**
     * Remove the specified department from storage.
     */
    public function destroy(Department $department): RedirectResponse
    {
        $department->delete();

        return redirect()
            ->route('departments.index')
            ->with('success', 'Department deleted successfully.');
    }
}
