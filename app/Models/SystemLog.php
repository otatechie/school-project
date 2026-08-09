<?php

namespace App\Models;

use App\Support\Dates;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SystemLog extends Model
{
    /** @var list<string> */
    protected $appends = ['created_at_label'];

    protected function createdAtLabel(): Attribute
    {
        return Attribute::get(fn () => Dates::withTime($this->created_at));
    }

    /** @use HasFactory<\Database\Factories\SystemLogFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'action',
        'description',
        'subject_type',
        'subject_id',
        'user_id',
        'ip_address',
    ];

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
