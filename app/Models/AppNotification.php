<?php

namespace App\Models;

use App\Support\Dates;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppNotification extends Model
{
    /** @use HasFactory<\Database\Factories\AppNotificationFactory> */
    use HasFactory, HasUlids;

    protected $table = 'app_notifications';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'link',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    /** @var list<string> */
    protected $appends = ['created_at_label'];

    protected function createdAtLabel(): Attribute
    {
        return Attribute::get(fn () => Dates::short($this->created_at));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
