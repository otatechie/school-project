<?php

use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\MemoController;
use App\Http\Controllers\PaymentVoucherController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('login'))->name('home');

Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'active'])
    ->name('dashboard');

Route::middleware(['auth', 'verified', 'active'])->group(function () {
    Route::resource('departments', DepartmentController::class);

    Route::get('payment-vouchers', [PaymentVoucherController::class, 'index'])->name('payment-vouchers.index');
    Route::get('payment-vouchers/create', [PaymentVoucherController::class, 'create'])->name('payment-vouchers.create');
    Route::get('payment-vouchers/pending', [PaymentVoucherController::class, 'pending'])->name('payment-vouchers.pending');
    Route::get('payment-vouchers/rejected', [PaymentVoucherController::class, 'rejected'])->name('payment-vouchers.rejected');
    Route::get('payment-vouchers/{voucher}/edit', [PaymentVoucherController::class, 'edit'])->name('payment-vouchers.edit');
    // Registered after create/pending/rejected so the wildcard cannot swallow them.
    Route::get('payment-vouchers/{voucher}', [PaymentVoucherController::class, 'show'])->name('payment-vouchers.show');
    Route::post('payment-vouchers', [PaymentVoucherController::class, 'store'])->name('payment-vouchers.store');
    Route::put('payment-vouchers/{voucher}', [PaymentVoucherController::class, 'update'])->name('payment-vouchers.update');
    Route::delete('payment-vouchers/{voucher}', [PaymentVoucherController::class, 'destroy'])->name('payment-vouchers.destroy');
    Route::post('payment-vouchers/{voucher}/submit', [PaymentVoucherController::class, 'submit'])->name('payment-vouchers.submit');
    Route::post('payment-vouchers/{voucher}/review', [PaymentVoucherController::class, 'review'])->name('payment-vouchers.review');
    Route::post('payment-vouchers/{voucher}/mark-paid', [PaymentVoucherController::class, 'markPaid'])->name('payment-vouchers.mark-paid');
    // The AI endpoints call a metered external API, so they are throttled
    // per user to bound both cost and load.
    Route::post('payment-vouchers/{voucher}/ai-review', [PaymentVoucherController::class, 'aiReview'])
        ->middleware('throttle:20,1')
        ->name('payment-vouchers.ai-review');

    Route::post('payment-vouchers/check', [PaymentVoucherController::class, 'check'])
        ->middleware('throttle:120,1')
        ->name('payment-vouchers.check');

    Route::get('users', [\App\Http\Controllers\UserController::class, 'index'])->name('users.index');
    Route::get('users/create', [\App\Http\Controllers\UserController::class, 'create'])->name('users.create');
    Route::post('users', [\App\Http\Controllers\UserController::class, 'store'])->name('users.store');
    Route::get('users/{id}/edit', [\App\Http\Controllers\UserController::class, 'edit'])->name('users.edit');
    Route::put('users/{id}', [\App\Http\Controllers\UserController::class, 'update'])->name('users.update');

    Route::get('system-logs', [\App\Http\Controllers\SystemLogController::class, 'index'])->name('system-logs.index');
    Route::get('roles-permissions', [\App\Http\Controllers\RolesController::class, 'index'])->name('roles-permissions.index');
    Route::get('documents', [\App\Http\Controllers\DocumentController::class, 'index'])->name('documents.index');
    Route::post('documents/{voucher}', [\App\Http\Controllers\DocumentController::class, 'store'])->name('documents.store');
    Route::get('documents/{document}/download', [\App\Http\Controllers\DocumentController::class, 'download'])->name('documents.download');
    Route::delete('documents/{document}', [\App\Http\Controllers\DocumentController::class, 'destroy'])->name('documents.destroy');

    Route::get('memos', [MemoController::class, 'index'])->name('memos.index');
    Route::get('memos/create', [MemoController::class, 'create'])->name('memos.create');
    Route::post('memos', [MemoController::class, 'store'])->name('memos.store');
    Route::post('memos/{memo}/finalize', [MemoController::class, 'finalize'])->name('memos.finalize');
    Route::post('memos/{memo}/print', [MemoController::class, 'markPrinted'])->name('memos.print');
    Route::post('memos/ai-draft/{voucher}', [MemoController::class, 'aiDraft'])
        ->middleware('throttle:20,1')
        ->name('memos.ai-draft');

    Route::get('financial-reports/monthly', [\App\Http\Controllers\FinancialReportController::class, 'monthly'])->name('financial-reports.monthly');
    Route::get('financial-reports/department', [\App\Http\Controllers\FinancialReportController::class, 'department'])->name('financial-reports.department');
    Route::get('financial-reports/{report}/print', [\App\Http\Controllers\FinancialReportController::class, 'print'])->name('financial-reports.print');
    Route::get('ledgers', [\App\Http\Controllers\LedgerController::class, 'index'])->name('ledgers.index');
    Route::get('ledgers/transactions', [\App\Http\Controllers\LedgerController::class, 'transactions'])->name('ledgers.transactions');
    Route::get('ledgers/chart-of-accounts', [\App\Http\Controllers\LedgerController::class, 'chartOfAccounts'])->name('ledgers.chart-of-accounts');
    Route::get('notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{notification}/read', [\App\Http\Controllers\NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllRead'])->name('notifications.read-all');
});

require __DIR__.'/settings.php';
