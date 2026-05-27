#!/bin/bash
# Actualiza el sistema en el VPS tras un git pull (o subida de código nuevo).
# Uso (dentro de la carpeta del proyecto en el VPS):  bash update.sh
set -e

echo "Actualizando Sistema de Inventario..."
npm install
cd backend && npm install && cd ..
npm run build

pm2 restart inventario-backend
pm2 restart inventario-frontend
echo "✓ Listo. pm2 list para ver el estado."
