<?php

use App\Http\Controllers\DepartmentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('departments', DepartmentController::class);

    Route::get('payment-vouchers', [\App\Http\Controllers\PaymentVoucherController::class, 'index'])->name('payment-vouchers.index');
    Route::get('payment-vouchers/create', [\App\Http\Controllers\PaymentVoucherController::class, 'create'])->name('payment-vouchers.create');
    Route::get('payment-vouchers/{id}/edit', [\App\Http\Controllers\PaymentVoucherController::class, 'edit'])->name('payment-vouchers.edit');
    Route::get('payment-vouchers/pending', [\App\Http\Controllers\PaymentVoucherController::class, 'pending'])->name('payment-vouchers.pending');
    Route::get('payment-vouchers/rejected', [\App\Http\Controllers\PaymentVoucherController::class, 'rejected'])->name('payment-vouchers.rejected');

    Route::get('users', [\App\Http\Controllers\UserController::class, 'index'])->name('users.index');
    Route::get('users/create', [\App\Http\Controllers\UserController::class, 'create'])->name('users.create');
    Route::get('users/{id}/edit', [\App\Http\Controllers\UserController::class, 'edit'])->name('users.edit');

    Route::get('system-logs', [\App\Http\Controllers\SystemLogController::class, 'index'])->name('system-logs.index');

    Route::get('roles-permissions', [\App\Http\Controllers\RolesController::class, 'index'])->name('roles-permissions.index');
    Route::get('roles-permissions/{id}/edit', [\App\Http\Controllers\RolesController::class, 'edit'])->name('roles-permissions.edit');

    Route::get('gifmis', [\App\Http\Controllers\GIFMISController::class, 'index'])->name('gifmis.index');

    Route::get('documents', [\App\Http\Controllers\DocumentController::class, 'index'])->name('documents.index');

    Route::get('memos', [\App\Http\Controllers\MemoController::class, 'index'])->name('memos.index');
    Route::get('memos/create', [\App\Http\Controllers\MemoController::class, 'create'])->name('memos.create');

    Route::get('financial-reports/monthly', [\App\Http\Controllers\FinancialReportController::class, 'monthly'])->name('financial-reports.monthly');
    Route::get('financial-reports/department', [\App\Http\Controllers\FinancialReportController::class, 'department'])->name('financial-reports.department');

    Route::get('ledgers', [\App\Http\Controllers\LedgerController::class, 'index'])->name('ledgers.index');
    Route::get('ledgers/transactions', [\App\Http\Controllers\LedgerController::class, 'transactions'])->name('ledgers.transactions');
    Route::get('ledgers/chart-of-accounts', [\App\Http\Controllers\LedgerController::class, 'chartOfAccounts'])->name('ledgers.chart-of-accounts');

    Route::get('notifications', fn () => Inertia::render('notifications/index'))->name('notifications.index');
});

require __DIR__.'/settings.php';
