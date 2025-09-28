#!/bin/bash

# -----------------------------
# Deploy automático para saas-monitor
# -----------------------------

APP_DIR="/var/www/saas-monitor-preciosIA"
APP_NAME="saas-monitor"

echo "🚀 Iniciando despliegue de ;) $APP_NAME..."

# Ir al directorio de la app
cd $APP_DIR || { echo "Error: no se puede acceder a $APP_DIR"; exit 1; }

# Traer cambios desde GitHub y resetear hard para evitar divergencias
git fetch origin
git reset --hard origin/main

echo "📦 Instalar dependencias críticas..."
npm install cors dotenv express mysql2 nodemailer --save || { echo "Error en instalación de dependencias críticas"; exit 1; }

echo "📦 Instalar dependencias pesadas en segundo plano (Puppeteer/Selenium)..."
npm install puppeteer selenium-webdriver --save &

# Evitar procesos duplicados en PM2: eliminar antiguos si existen
pm2 delete $APP_NAME 2>/dev/null

# Iniciar/reiniciar la app con nombre consistente
pm2 start index.js --name "$APP_NAME" || pm2 restart "$APP_NAME" --update-env

# Guardar configuración PM2 para reinicio automático al iniciar el servidor
pm2 save

echo "✅ Despliegue completado para $APP_NAME"

