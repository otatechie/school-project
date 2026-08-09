<?php

namespace App\Models;

use App\Support\Dates;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LedgerEntry extends Model
{
    /** @use HasFactory<\Database\Factories\LedgerEntryFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'reference',
        'entry_date',
        'account_id',
        'description',
        'debit',
        'credit',
        'payment_voucher_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'entry_date' => 'date',
            'debit' => 'decimal:2',
            'credit' => 'decimal:2',
        ];
    }

    /** @var list<string> */
    protected $appends = ['entry_date_label'];

    protected function entryDateLabel(): Attribute
    {
        return Attribute::get(fn () => Dates::short($this->entry_date));
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(PaymentVoucher::class, 'payment_voucher_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
