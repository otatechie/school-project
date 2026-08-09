<?php

use App\Models\User;

/**
 * Access to public expenditure records is granted by an administrator, never
 * claimed by whoever finds the sign-in page.
 */
it('does not expose a public sign-up route', function () {
    expect(collect(app('router')->getRoutes())->contains(
        fn ($route) => str_contains($route->uri(), 'register'),
    ))->toBeFalse();
});

it('returns 404 for a direct sign-up request', function () {
    $this->get('/register')->assertNotFound();
    $this->post('/register', [
        'name' => 'Uninvited',
        'email' => 'uninvited@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertNotFound();

    expect(User::where('email', 'uninvited@example.com')->exists())->toBeFalse();
});

describe('demonstration mode', function () {
    it('prefills the superadmin when demonstration mode is on', function () {
        config(['app.demo_mode' => true]);

        $this->get(route('login'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('auth/login')
                ->where('defaultEmail', config('demo.superadmin.email'))
                ->where('defaultPassword', config('demo.password'))
                ->has('demoAccounts')
            );
    });

    it('shows no credentials when demonstration mode is off', function () {
        config(['app.demo_mode' => false]);

        $this->get(route('login'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('auth/login')
                ->where('defaultEmail', null)
                ->where('defaultPassword', null)
                ->where('demoAccounts', null)
            );
    });

    it('lists only accounts that the seeder actually creates', function () {
        $this->seed();

        foreach (config('demo.accounts') as $account) {
            expect(User::where('email', $account['email'])->exists())
                ->toBeTrue("Demo account {$account['email']} is advertised but not seeded.");
        }
    });

    it('signs in with the advertised superadmin credentials', function () {
        $this->seed();

        $this->post(route('login.store'), [
            'email' => config('demo.superadmin.email'),
            'password' => config('demo.password'),
        ])->assertRedirect();

        $this->assertAuthenticated();

        expect(auth()->user()->isAdmin())->toBeTrue();
    });
});
