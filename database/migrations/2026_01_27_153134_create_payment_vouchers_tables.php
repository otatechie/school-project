<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | PAYMENT VOUCHERS TABLE
        |--------------------------------------------------------------------------
        */

        Schema::create('payment_vouchers', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('voucher_number')->unique();
            $table->date('voucher_date');

            // Payee Info
            $table->string('payee_name');
            $table->string('payee_account_number')->nullable();
            $table->string('payee_bank')->nullable();
            $table->string('payee_phone')->nullable();

            // Payment Details
            $table->text('description');
            $table->decimal('amount', 15, 2);
            $table->string('payment_method')->default('cheque')->index();
            $table->string('cheque_number')->nullable();
            $table->string('payment_reference')->nullable();

            // Budget & Department
            $table->string('budget_line');
            $table->string('budget_code')->nullable();
            $table->string('department_id');
            $table->foreign('department_id')->references('id')->on('departments')->restrictOnDelete();

            // Status
            $table->string('status')->default('draft')->index();

            // User Tracking
            $table->string('created_by');
            $table->foreign('created_by')->references('id')->on('users')->restrictOnDelete();
            $table->string('approved_by')->nullable();
            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
            $table->string('rejected_by')->nullable();
            $table->foreign('rejected_by')->references('id')->on('users')->nullOnDelete();
            $table->string('paid_by')->nullable();
            $table->foreign('paid_by')->references('id')->on('users')->nullOnDelete();

            // Workflow Times
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('paid_at')->nullable();

            // Notes
            $table->text('rejection_reason')->nullable();
            $table->text('internal_notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('voucher_date');
        });

        /*
        |--------------------------------------------------------------------------
        | VOUCHER DOCUMENTS TABLE
        |--------------------------------------------------------------------------
        */

        Schema::create('voucher_documents', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('voucher_id');
            $table->foreign('voucher_id')->references('id')->on('payment_vouchers')->cascadeOnDelete();

            $table->string('document_type');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type');
            $table->integer('file_size');
            $table->string('file_hash')->nullable();

            $table->string('uploaded_by');
            $table->foreign('uploaded_by')->references('id')->on('users')->restrictOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('voucher_id');
        });

        /*
        |--------------------------------------------------------------------------
        | VOUCHER APPROVALS TABLE
        |--------------------------------------------------------------------------
        */

        Schema::create('voucher_approvals', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('voucher_id');
            $table->foreign('voucher_id')->references('id')->on('payment_vouchers')->cascadeOnDelete();

            $table->string('approver_id');
            $table->foreign('approver_id')->references('id')->on('users')->restrictOnDelete();

            $table->integer('approval_level')->default(1);
            $table->string('status')->default('pending');
            $table->text('comments')->nullable();
            $table->timestamp('actioned_at')->nullable();

            $table->timestamps();

            $table->unique(['voucher_id', 'approval_level']);
            $table->index(['approver_id', 'status']);
            $table->index('actioned_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voucher_approvals');
        Schema::dropIfExists('voucher_documents');
        Schema::dropIfExists('payment_vouchers');
    }
};
