<?php

namespace App\Services;

use App\Models\SystemLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    public static function record(string $action, string $description, ?Model $subject = null): void
    {
        SystemLog::create([
            'action' => $action,
            'description' => $description,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'user_id' => Auth::id(),
            'ip_address' => Request::ip(),
        ]);
    }
}
