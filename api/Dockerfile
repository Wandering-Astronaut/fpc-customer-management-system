FROM php:8.3-fpm-alpine

# ── System dependencies ────────────────────────────────────────────────────
RUN apk add --no-cache \
    bash \
    curl \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    oniguruma-dev \
    $PHPIZE_DEPS

# ── PHP extensions ─────────────────────────────────────────────────────────
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    mbstring \
    zip \
    opcache

# ── Composer ───────────────────────────────────────────────────────────────
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# ── OPcache tuning ─────────────────────────────────────────────────────────
RUN echo "opcache.enable=1\nopcache.memory_consumption=128\nopcache.max_accelerated_files=10000\nopcache.revalidate_freq=0" \
    >> /usr/local/etc/php/conf.d/opcache.ini

# ── Working directory ──────────────────────────────────────────────────────
WORKDIR /var/www/html

# ── Copy source ────────────────────────────────────────────────────────────
COPY . .

# ── Install PHP dependencies ───────────────────────────────────────────────
RUN composer install --no-interaction --no-dev --optimize-autoloader

# ── Permissions ────────────────────────────────────────────────────────────
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# ── Entrypoint ─────────────────────────────────────────────────────────────
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]
