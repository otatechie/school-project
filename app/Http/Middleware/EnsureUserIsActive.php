<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Turns off a deactivated account immediately.
 *
 * Without this, `is_active` only affects who receives notifications: a user
 * deactivated while signed in would keep full access until their session
 * expired. When someone leaves the office, access must end at once.
 */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->is_active) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('login')
                ->withErrors([
                    'email' => 'This account has been deactivated. Contact an administrator.',
                ]);
        }

        return $next($request);
    }
}
