<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VoucherDocument extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'voucher_id',
        'document_type',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'file_hash',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'deleted_at' => 'datetime',
        ];
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(PaymentVoucher::class, 'voucher_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
