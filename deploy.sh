#!/bin/bash

# Ruta del proyecto
PROYECTO="/var/www/log-personal-avanzado"

echo "→ Haciendo pull del repositorio..."
cd "$PROYECTO" || exit
git pull origin main

echo "→ Instalando dependencias PHP..."
composer install --no-interaction --optimize-autoloader

echo "→ Ejecutando migraciones (sin tocar datos existentes)..."
php artisan migrate --force

echo "→ Construyendo assets frontend..."
npm install
npm run build

echo "→ Estableciendo permisos..."

# Comprobar y cambiar propietario solo si hay archivos con dueño distinto
if sudo find "$PROYECTO" \! -user antonio -o \! -group www-data | grep -q .; then
  echo "→ Cambiando propietario a antonio:www-data en todo el proyecto..."
  sudo chown -R antonio:www-data "$PROYECTO"
else
  echo "→ Todos los archivos ya tienen el propietario correcto."
fi

# Comprobar y cambiar permisos en storage y bootstrap/cache solo si hay permisos diferentes a 775
for dir in "$PROYECTO/storage" "$PROYECTO/bootstrap/cache"; do
  if sudo find "$dir" \! -perm 775 | grep -q .; then
    echo "→ Cambiando permisos a 775 en $dir..."
    sudo chmod -R 775 "$dir"
  else
    echo "→ Permisos correctos en $dir."
  fi
done

echo "✅ Proyecto actualizado correctamente."
