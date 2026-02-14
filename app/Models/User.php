<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

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
        'last_login_at',
        'last_login_ip',
        'approval_level',
        'approval_limit',
        'is_active',
        'password_changed_at',
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
            'last_login_at' => 'datetime',
            'password_changed_at' => 'datetime',
            'approval_limit' => 'decimal:2',
            'is_active' => 'boolean',
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

    public function uploadedDocuments()
    {
        return $this->hasMany(VoucherDocument::class, 'uploaded_by');
    }

    public function voucherApprovals()
    {
        return $this->hasMany(VoucherApproval::class, 'approver_id');
    }

    public function memos()
    {
        return $this->hasMany(Memo::class, 'created_by');
    }
}
