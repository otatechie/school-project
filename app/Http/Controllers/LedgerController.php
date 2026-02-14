<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LedgerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('ledgers/index');
    }

    public function transactions(): Response
    {
        return Inertia::render('ledgers/transactions');
    }

    public function chartOfAccounts(): Response
    {
        return Inertia::render('ledgers/chart-of-accounts');
    }
}
