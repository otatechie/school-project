# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 — build the frontend assets
# ---------------------------------------------------------------------------
FROM node:22-alpine AS assets

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY resources ./resources
COPY public ./public
COPY vite.config.ts tsconfig.json components.json ./

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 — install PHP dependencies
# ---------------------------------------------------------------------------
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

# Scripts are skipped here because artisan needs the full source tree, which
# is not copied yet. They run in the final stage instead.
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --no-scripts \
    --optimize-autoloader

# ---------------------------------------------------------------------------
# Stage 3 — the runtime image
# ---------------------------------------------------------------------------
FROM php:8.4-fpm-alpine AS runtime

# nginx serves static files and proxies PHP to php-fpm; supervisor keeps both
# alive in the single container Dokploy expects.
RUN apk add --no-cache \
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

COPY --from=vendor /app/vendor ./vendor
COPY . .
COPY --from=assets /app/public/build ./public/build

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/99-app.ini
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

# Composer's post-install scripts were skipped in the vendor stage; run the
# package discovery they would have done, now that artisan is present.
RUN php artisan package:discover --ansi

RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 80

ENTRYPOINT ["entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
