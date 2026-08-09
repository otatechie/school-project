<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('voucher_documents');
        Schema::dropIfExists('voucher_approvals');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'last_login_at',
                'last_login_ip',
                'approval_level',
                'approval_limit',
                'password_changed_at',
            ]);
        });

        Schema::table('payment_vouchers', function (Blueprint $table) {
            $table->dropColumn('internal_notes');
        });

        Schema::table('memos', function (Blueprint $table) {
            $table->dropColumn('printed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('memos', function (Blueprint $table) {
            $table->timestamp('printed_at')->nullable();
        });

        Schema::table('payment_vouchers', function (Blueprint $table) {
            $table->text('internal_notes')->nullable();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();
            $table->integer('approval_level')->nullable();
            $table->decimal('approval_limit', 15, 2)->nullable();
            $table->timestamp('password_changed_at')->nullable();
        });

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
    }
};
