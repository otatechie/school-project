#!/bin/sh
# Container start-up: wait for the database, migrate, then cache and serve.
set -e

cd /var/www/html

# APP_KEY must be set in the Dokploy environment. Generating one here would
# produce a different key on every deploy, silently invalidating all existing
# sessions and any encrypted column — so fail loudly instead.
if [ -z "${APP_KEY}" ]; then
    echo "FATAL: APP_KEY is not set. Generate one with 'php artisan key:generate --show'"
    echo "       and add it to the application's environment variables in Dokploy."
    exit 1
fi

# Dokploy starts the app and the database together, so the first boot can win
# the race against MySQL accepting connections.
echo "Waiting for the database to accept connections..."
attempt=0
until php artisan db:show --quiet >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 30 ]; then
        echo "FATAL: database did not become available after 60 seconds."
        php artisan db:show || true
        exit 1
    fi
    sleep 2
done
echo "Database is up."

echo "Running migrations..."
php artisan migrate --force

# Seed reference data (chart of accounts, departments, demo users) only when
# the database is still empty, so a redeploy never overwrites real records.
if [ "${SEED_ON_FIRST_BOOT:-true}" = "true" ]; then
    php artisan app:seed-if-empty
fi

# Public disk is used for uploaded documents.
php artisan storage:link || true

echo "Caching configuration, routes and views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

chown -R www-data:www-data storage bootstrap/cache

echo "GovPay Desk is ready."
exec "$@"
