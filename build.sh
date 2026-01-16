#!/bin/bash
set -e

echo "Installing dependencies..."
cd source-code/backend/backend
composer install --no-dev

echo "Generating app key if needed..."
php artisan key:generate --force || true

echo "Running migrations..."
php artisan migrate --force || true

echo "Build complete!"
