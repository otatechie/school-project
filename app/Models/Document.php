<?php

namespace App\Models;

use App\Support\Dates;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Document extends Model
{
    /** @use HasFactory<\Database\Factories\DocumentFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'path',
        'mime_type',
        'size',
        'documentable_type',
        'documentable_id',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    /** @var list<string> */
    protected $appends = ['created_at_label'];

    protected function createdAtLabel(): Attribute
    {
        return Attribute::get(fn () => Dates::short($this->created_at));
    }

    public function documentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
