<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LedgerController extends Controller
{
    public function index(): Response
    {
        $totals = LedgerEntry::query()
            ->selectRaw('COALESCE(SUM(debit), 0) as debit, COALESCE(SUM(credit), 0) as credit')
            ->first();

        return Inertia::render('ledgers/index', [
            'summary' => [
                'entries' => LedgerEntry::count(),
                'accounts' => Account::where('is_active', true)->count(),
                'totalDebit' => (float) ($totals->debit ?? 0),
                'totalCredit' => (float) ($totals->credit ?? 0),
            ],
        ]);
    }

    public function transactions(Request $request): Response
    {
        $entries = LedgerEntry::query()
            ->with('account')
            ->when($request->filled('account'), fn ($q) => $q->whereHas(
                'account',
                fn ($a) => $a->where('code', $request->string('account'))
            ))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');
                $query->where(function ($q) use ($search) {
                    $q->where('reference', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('account', fn ($a) => $a
                            ->where('code', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('entry_date')
            ->orderBy('reference')
            ->paginate(15)
            ->withQueryString();

        // Totals for the whole filtered set, not just the visible page.
        $totals = LedgerEntry::query()
            ->when($request->filled('account'), fn ($q) => $q->whereHas(
                'account',
                fn ($a) => $a->where('code', $request->string('account'))
            ))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');
                $query->where(function ($q) use ($search) {
                    $q->where('reference', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('account', fn ($a) => $a
                            ->where('code', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%"));
                });
            })
            ->selectRaw('COALESCE(SUM(debit), 0) as debit, COALESCE(SUM(credit), 0) as credit')
            ->first();

        return Inertia::render('ledgers/transactions', [
            'entries' => $entries,
            'accounts' => Account::orderBy('code')->get(['id', 'code', 'name']),
            'totals' => [
                'debit' => (float) ($totals->debit ?? 0),
                'credit' => (float) ($totals->credit ?? 0),
            ],
            'filters' => $request->only(['search', 'account']),
        ]);
    }

    public function chartOfAccounts(Request $request): Response
    {
        $accounts = Account::query()
            ->withSum('entries as debit_total', 'debit')
            ->withSum('entries as credit_total', 'credit')
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->string('type')))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');
                $query->where(fn ($q) => $q
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%"));
            })
            ->orderBy('code')
            ->get();

        return Inertia::render('ledgers/chart-of-accounts', [
            'accounts' => $accounts,
            'types' => Account::query()->distinct()->orderBy('type')->pluck('type'),
            'filters' => $request->only(['search', 'type']),
        ]);
    }
}
