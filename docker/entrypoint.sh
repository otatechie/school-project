#!/bin/sh
# Container start-up: wait for the database, migrate, then cache and serve.
#
# Deliberately not `set -e`. A failure here used to kill the container before
# nginx started, which surfaces as a 502 from the proxy with no page to read
# and no clue as to why. Each step now reports its own failure and the server
# still comes up, so the error is visible in the browser and the logs rather
# than being a dead container.

cd /var/www/html

fail() {
    echo "=============================================="
    echo "STARTUP PROBLEM: $1"
    echo "=============================================="
}

# APP_KEY is the one thing worth refusing to start over: without it every
# session and encrypted value is invalid, and generating one here would produce
# a different key on each deploy.
if [ -z "${APP_KEY}" ]; then
    fail "APP_KEY is not set."
    echo "Generate one locally with: php artisan key:generate --show"
    echo "Then add it to the service's environment variables in Dokploy."
    exit 1
fi

# Dokploy starts the app and the database together, and MySQL initialises its
# data directory on first boot, so the app can wait several minutes the first
# time and a couple of seconds on every deploy after that.
echo "Waiting for the database..."
attempt=0
until php artisan db:show --quiet >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 90 ]; then
        fail "the database did not accept connections after 3 minutes."
        echo "Check DB_HOST, DB_DATABASE, DB_USERNAME and DB_PASSWORD, and that"
        echo "the database service is running. Diagnostics follow:"
        php artisan db:show 2>&1 | head -20
        break
    fi
    [ $((attempt % 15)) -eq 0 ] && echo "  still waiting (${attempt}0s)..."
    sleep 2
done

echo "Running migrations..."
php artisan migrate --force || fail "migrations failed — see the error above."

if [ "${SEED_ON_FIRST_BOOT:-true}" = "true" ]; then
    php artisan app:seed-if-empty || fail "seeding failed — see the error above."
fi

php artisan storage:link >/dev/null 2>&1 || true

# Caching config resolves every env() call once. If it fails the app still
# runs, just slower, so it must not be fatal.
echo "Caching configuration, routes and views..."
php artisan config:cache || fail "config:cache failed; continuing uncached."
php artisan route:cache || fail "route:cache failed; continuing uncached."
php artisan view:cache || fail "view:cache failed; continuing uncached."

chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

echo "Starting web server on port 80."
exec "$@"
