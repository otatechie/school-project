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
        Schema::table('users', function (Blueprint $table) {
            $table->string('staff_id')->nullable()->after('id');
            $table->string('department_id')->nullable()->after('staff_id');
            $table->string('position')->nullable()->after('department_id');
            $table->string('phone')->nullable()->after('email');
            $table->timestamp('last_login_at')->nullable()->after('email_verified_at');
            $table->string('last_login_ip')->nullable()->after('last_login_at');
            $table->integer('approval_level')->nullable()->after('last_login_ip');
            $table->decimal('approval_limit', 15, 2)->nullable()->after('approval_level');
            $table->boolean('is_active')->default(true)->after('approval_limit');
            $table->timestamp('password_changed_at')->nullable()->after('is_active');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'staff_id',
                'department_id',
                'position',
                'phone',
                'last_login_at',
                'last_login_ip',
                'approval_level',
                'approval_limit',
                'is_active',
                'password_changed_at',
                'deleted_at',
            ]);
        });
    }
};
