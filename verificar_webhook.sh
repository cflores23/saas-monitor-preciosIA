#!/bin/bash

echo "🔎 Verificando que el webhook y la app estén activos..."

# Verifica que el puerto 5000 esté en escucha
if lsof -i :5000 | grep LISTEN; then
  echo "✅ Webhook escuchando correctamente en el puerto 5000."
else
  echo "❌ Webhook NO está activo en el puerto 5000."
fi

# Opcional: verificar que PM2 tenga corriendo los procesos
pm2 list
