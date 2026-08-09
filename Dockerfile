# syntax=docker/dockerfile:1
#
# Three stages: resolve PHP dependencies, build the frontend, then assemble a
# runtime image serving nginx + php-fpm with a queue worker under supervisor.
#
# The vendor stage comes first because the asset build needs it: the Wayfinder
# Vite plugin shells out to `php artisan wayfinder:generate` to write the typed
# route helpers that every page imports. Those helpers are gitignored, so
# without PHP in the asset stage the build dies with "Could not open input
# file: artisan".

# ---------------------------------------------------------------------------
# Stage 1 — PHP dependencies
# ---------------------------------------------------------------------------
FROM php:8.4-cli-alpine AS vendor

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app

COPY composer.json composer.lock ./

# --no-scripts because package discovery runs artisan, which needs application
# code that has not been copied yet. Discovery runs in the runtime stage.
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction \
    --no-progress

COPY . .

RUN composer dump-autoload --no-dev --optimize --classmap-authoritative

# ---------------------------------------------------------------------------
# Stage 2 — frontend assets
# ---------------------------------------------------------------------------
# Debian, not Alpine: Tailwind v4 and Vite pull native binaries that are
# published for glibc, and the musl builds are a common source of CI-only
# failures.
FROM node:22-bookworm-slim AS assets

# PHP is a build tool here, not a runtime: the Wayfinder plugin needs `artisan`
# to generate the route helpers before Vite can resolve their imports.
RUN apt-get update \
    && apt-get install -y --no-install-recommends php-cli php-xml php-mbstring \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Build platforms often set NODE_ENV=production, which would omit the
# devDependencies that Vite, Tailwind and TypeScript all live in.
ENV NODE_ENV=development \
    NPM_CONFIG_PRODUCTION=false

COPY package.json package-lock.json ./
RUN npm ci --include=dev --include=optional --no-audit --no-fund

# The full source, plus the vendor tree from stage 1. Wayfinder boots the
# framework to read the route table, so it needs both.
COPY . .
COPY --from=vendor /app/vendor ./vendor

# Route generation reads config, and Laravel refuses to boot without a key.
# This one is used only to build assets and never reaches the runtime image.
ENV APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
    APP_ENV=production \
    NODE_OPTIONS=--max-old-space-size=4096

RUN npm run build

# A successful exit with no manifest means Vite wrote nothing — catch it here,
# where it costs a failed build, rather than serving a page with no styles or
# scripts and no clue why.
RUN test -f public/build/manifest.json \
    || (echo "asset build produced no manifest" && exit 1)

# ---------------------------------------------------------------------------
# Stage 3 — runtime
# ---------------------------------------------------------------------------
FROM php:8.4-fpm-alpine AS runtime

# nginx serves static files and proxies PHP to php-fpm; supervisor keeps both
# alive in the single container Dokploy expects. bash is here because Dokploy's
# web terminal execs bash unconditionally, and Alpine ships only BusyBox sh.
RUN apk add --no-cache \
        bash \
        nginx \
        supervisor \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
        libpng-dev \
        freetype-dev \
        libjpeg-turbo-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        bcmath \
        intl \
        zip \
        gd \
        opcache \
    && apk del --no-network libpng-dev freetype-dev libjpeg-turbo-dev \
    && rm -rf /var/cache/apk/*

WORKDIR /var/www/html

COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build
# Generated in the asset stage and gitignored, so they exist nowhere else.
COPY --from=assets /app/resources/js/routes ./resources/js/routes

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/99-app.ini
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

# The scripts skipped during composer install; artisan is available now.
RUN php artisan package:discover --ansi

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 80

ENTRYPOINT ["entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
