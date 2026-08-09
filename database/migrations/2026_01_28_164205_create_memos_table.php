<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memos', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('memo_number')->unique();
            $table->date('memo_date');
            $table->string('subject');
            $table->text('body');
            $table->string('to_name');
            $table->string('to_designation')->nullable();
            $table->string('from_name');
            $table->string('from_designation')->nullable();
            $table->foreignUlid('department_id')
                ->constrained()
                ->restrictOnDelete();
            $table->foreignUlid('voucher_id')
                ->nullable()
                ->constrained('payment_vouchers')
                ->nullOnDelete();
            $table->foreignUlid('created_by')
                ->constrained('users')
                ->restrictOnDelete();
            $table->string('status')->default('draft');
            $table->timestamp('printed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('memo_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memos');
    }
};
