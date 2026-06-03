#!/bin/bash
set -e

echo "🚀 Starting FPC API..."

# Ensure Laravel storage paths exist (volume mounts may omit empty dirs)
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/app/public
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

# Wait for DB (belt-and-suspenders on top of compose healthcheck)
until php -r "new PDO('pgsql:host=database;port=5432;dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');" 2>/dev/null; do
  echo "⏳ Waiting for PostgreSQL..."
  sleep 2
done

echo "✅ PostgreSQL ready"

# Run migrations
php artisan migrate --force

# Bootstrap Elasticsearch index
php artisan elasticsearch:setup || true

echo "✅ Bootstrap complete"

exec "$@"
