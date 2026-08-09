<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasUlids, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'staff_id',
        'department_id',
        'position',
        'role',
        'approval_limit',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
            'approval_limit' => 'decimal:2',
            'deleted_at' => 'datetime',
        ];
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function createdVouchers()
    {
        return $this->hasMany(PaymentVoucher::class, 'created_by');
    }

    public function approvedVouchers()
    {
        return $this->hasMany(PaymentVoucher::class, 'approved_by');
    }

    public function rejectedVouchers()
    {
        return $this->hasMany(PaymentVoucher::class, 'rejected_by');
    }

    public function paidVouchers()
    {
        return $this->hasMany(PaymentVoucher::class, 'paid_by');
    }

    public function memos()
    {
        return $this->hasMany(Memo::class, 'created_by');
    }

    public const ROLE_ADMIN = 'admin';

    public const ROLE_APPROVER = 'approver';

    public const ROLE_FINANCE_OFFICER = 'finance_officer';

    public const ROLE_VIEWER = 'viewer';

    /**
     * @return array<string, string>
     */
    public static function roles(): array
    {
        return [
            self::ROLE_ADMIN => 'Administrator',
            self::ROLE_APPROVER => 'Approver',
            self::ROLE_FINANCE_OFFICER => 'Finance Officer',
            self::ROLE_VIEWER => 'Viewer',
        ];
    }

    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function notifications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AppNotification::class);
    }
}
