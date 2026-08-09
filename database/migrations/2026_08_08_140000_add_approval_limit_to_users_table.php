<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Gives each approver a ceiling, so a voucher is routed to someone with the
 * authority to release that amount rather than to whoever opens the queue first.
 *
 * Null means no ceiling, which is how administrators are represented.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('approval_limit', 15, 2)->nullable()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('approval_limit');
        });
    }
};
