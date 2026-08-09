<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            // The bell in the header needs the signed-in user's own unread
            // notifications on every page, so they are shared rather than
            // fetched per page.
            'notifications' => fn () => $request->user()
                ? [
                    'unread' => $request->user()->notifications()->whereNull('read_at')->count(),
                    'items' => $request->user()->notifications()
                        ->latest()
                        ->limit(6)
                        ->get(['id', 'type', 'title', 'body', 'link', 'read_at', 'created_at']),
                ]
                : ['unread' => 0, 'items' => []],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
