#!/bin/bash

# Ruta del proyecto
PROYECTO="/var/www/log-personal-avanzado"

# Mensaje inicial
echo "→ Haciendo pull del repositorio..."
cd $PROYECTO || exit
git pull origin main

# Instalando dependencias PHP
echo "→ Instalando dependencias PHP..."
composer install --no-interaction --optimize-autoloader

# Ejecutando migraciones (sin tocar datos existentes)
echo "→ Ejecutando migraciones (sin tocar datos existentes)..."
php artisan migrate --force

# Construyendo assets frontend
echo "→ Construyendo assets frontend..."
npm install
npm run build

# Estableciendo permisos correctamente con sudo
echo "→ Estableciendo permisos..."
sudo chown -R antonio:www-data /var/www/internetwebsite
sudo chmod -R 775 /var/www/internetwebsite/storage /var/www/internetwebsite/bootstrap/cache

# Mensaje de éxito
echo "✅ Proyecto actualizado correctamente."
