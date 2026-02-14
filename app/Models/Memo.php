<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Memo extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'memo_number',
        'memo_date',
        'subject',
        'body',
        'to_name',
        'to_designation',
        'from_name',
        'from_designation',
        'department_id',
        'voucher_id',
        'created_by',
        'status',
        'printed_at',
    ];

    protected function casts(): array
    {
        return [
            'memo_date' => 'date',
            'printed_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(PaymentVoucher::class, 'voucher_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
