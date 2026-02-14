<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentVoucher extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'voucher_number',
        'voucher_date',
        'payee_name',
        'payee_account_number',
        'payee_bank',
        'payee_phone',
        'description',
        'amount',
        'payment_method',
        'cheque_number',
        'payment_reference',
        'budget_line',
        'budget_code',
        'department_id',
        'status',
        'created_by',
        'approved_by',
        'rejected_by',
        'paid_by',
        'submitted_at',
        'approved_at',
        'rejected_at',
        'paid_at',
        'rejection_reason',
        'internal_notes',
    ];

    protected function casts(): array
    {
        return [
            'voucher_date' => 'date',
            'amount' => 'decimal:2',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'paid_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(VoucherDocument::class, 'voucher_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(VoucherApproval::class, 'voucher_id');
    }

    public function memo(): HasOne
    {
        return $this->hasOne(Memo::class, 'voucher_id');
    }
}
