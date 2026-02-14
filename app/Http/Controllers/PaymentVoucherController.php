<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentVoucherController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('payment-vouchers/index');
    }

    public function create(): Response
    {
        return Inertia::render('payment-vouchers/create');
    }

    public function edit(string $id): Response
    {
        return Inertia::render('payment-vouchers/edit', [
            'id' => $id,
        ]);
    }

    public function pending(): Response
    {
        return Inertia::render('payment-vouchers/pending');
    }

    public function rejected(): Response
    {
        return Inertia::render('payment-vouchers/rejected');
    }
}
