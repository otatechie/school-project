<?php

namespace App\Http\Middleware;

use App\Models\Department;
use App\Models\Memo;
use App\Models\PaymentVoucher;
use App\Models\User;
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
                // Derived from the same policies the controllers authorize
                // against, so a button can never offer an action the server
                // will refuse.
                'can' => $request->user() ? [
                    'createVoucher' => $request->user()->can('create', PaymentVoucher::class),
                    'createMemo' => $request->user()->can('create', Memo::class),
                    'reviewVouchers' => $request->user()->hasRole(User::ROLE_ADMIN, User::ROLE_APPROVER),
                    'manageDepartments' => $request->user()->can('create', Department::class),
                    'manageStaff' => $request->user()->can('viewAny', User::class),
                    'viewAuditLog' => $request->user()->isAdmin(),
                ] : null,
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
