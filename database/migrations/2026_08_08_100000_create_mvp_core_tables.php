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
        | ROLE ON USERS
        |--------------------------------------------------------------------------
        */
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('viewer')->index()->after('position');
        });

        /*
        |--------------------------------------------------------------------------
        | CHART OF ACCOUNTS
        |--------------------------------------------------------------------------
        */
        Schema::create('accounts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type')->index(); // asset, liability, equity, revenue, expense
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | LEDGER ENTRIES (double-entry; one row per side)
        |--------------------------------------------------------------------------
        */
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('reference')->index();
            $table->date('entry_date')->index();

            $table->string('account_id');
            $table->foreign('account_id')->references('id')->on('accounts')->restrictOnDelete();

            $table->text('description');
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);

            // Origin document (a paid voucher), when the entry was posted automatically.
            $table->string('payment_voucher_id')->nullable();
            $table->foreign('payment_voucher_id')->references('id')->on('payment_vouchers')->nullOnDelete();

            $table->string('created_by')->nullable();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | DOCUMENTS (attachments for vouchers and memos)
        |--------------------------------------------------------------------------
        */
        Schema::create('documents', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('path');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->default(0);

            $table->string('documentable_type');
            $table->string('documentable_id');
            $table->index(['documentable_type', 'documentable_id']);

            $table->string('uploaded_by')->nullable();
            $table->foreign('uploaded_by')->references('id')->on('users')->nullOnDelete();

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | SYSTEM LOGS (audit trail)
        |--------------------------------------------------------------------------
        */
        Schema::create('system_logs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('action')->index();
            $table->text('description');

            $table->string('subject_type')->nullable();
            $table->string('subject_id')->nullable();
            $table->index(['subject_type', 'subject_id']);

            $table->string('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();

            $table->string('ip_address')->nullable();
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | NOTIFICATIONS (in-app)
        |--------------------------------------------------------------------------
        */
        Schema::create('app_notifications', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            $table->string('type')->index();
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('link')->nullable();
            $table->timestamp('read_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
        Schema::dropIfExists('system_logs');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('ledger_entries');
        Schema::dropIfExists('accounts');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
