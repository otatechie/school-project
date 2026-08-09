<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * Seeds reference data on a container's first boot only.
 *
 * The deployment entrypoint runs this on every start, so it must be safe to
 * repeat: once the office has real users, seeding would overwrite them.
 */
class SeedIfEmpty extends Command
{
    protected $signature = 'app:seed-if-empty';

    protected $description = 'Seed the database only when it has no users yet';

    public function handle(): int
    {
        if (User::query()->withTrashed()->exists()) {
            $this->info('Database already has users — skipping seed.');

            return self::SUCCESS;
        }

        $this->info('No users found — seeding initial data.');

        $this->call('db:seed', ['--force' => true]);

        return self::SUCCESS;
    }
}
