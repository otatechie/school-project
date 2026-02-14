<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class FinancialReportController extends Controller
{
    public function monthly(): Response
    {
        return Inertia::render('financial-reports/monthly');
    }

    public function department(): Response
    {
        return Inertia::render('financial-reports/department');
    }
}
