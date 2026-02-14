<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VoucherApproval extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'voucher_id',
        'approver_id',
        'approval_level',
        'status',
        'comments',
        'actioned_at',
    ];

    protected function casts(): array
    {
        return [
            'approval_level' => 'integer',
            'actioned_at' => 'datetime',
        ];
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(PaymentVoucher::class, 'voucher_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
