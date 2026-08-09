<?php

namespace App\Http\Controllers;

use App\Models\SystemLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemLogController extends Controller
{
    public function index(Request $request): Response
    {
        // The audit trail shows who did what across the whole office and is
        // the record an auditor relies on. Only administrators may read it.
        abort_unless($request->user()->isAdmin(), 403);

        $logs = SystemLog::query()
            ->with('user:id,name')
            ->when($request->filled('action'), fn ($q) => $q->where('action', $request->string('action')))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');
                $query->where(fn ($q) => $q
                    ->where('description', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('system-logs/index', [
            'logs' => $logs,
            'actions' => SystemLog::query()->distinct()->orderBy('action')->pluck('action'),
            'filters' => $request->only(['search', 'action']),
        ]);
    }
}
