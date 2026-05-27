#!/bin/bash
# =====================================================================
# Instalador del Sistema de Inventario de Cajas en el VPS (Ubuntu)
# Convive con OISGO sin chocar: backend 4001, frontend 4000, BD propia.
# Uso (dentro de la carpeta del proyecto en el VPS):  bash install.sh
# =====================================================================
set -e

echo "============================================"
echo "  Sistema de Inventario - Instalación VPS"
echo "============================================"

# 1. Node.js 22 (si no existe)
if ! command -v node >/dev/null 2>&1; then
  echo "[1/7] Instalando Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install -y nodejs
else
  echo "[1/7] Node.js ya instalado: $(node -v)"
fi

# 2. PM2 (si no existe)
if ! command -v pm2 >/dev/null 2>&1; then
  echo "[2/7] Instalando PM2..."
  npm install -g pm2
else
  echo "[2/7] PM2 ya instalado"
fi

# 3. Base de datos (MySQL ya está instalado por OISGO)
echo "[3/7] Configurando base de datos sistema_inventario..."
systemctl start mysql 2>/dev/null || true
mysql -u root <<'EOF'
CREATE DATABASE IF NOT EXISTS sistema_inventario CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'appuser'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON sistema_inventario.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
EOF

# 4. Esquema + datos
echo "[4/7] Importando esquema, admin y cajas..."
mysql -u appuser -p123456 sistema_inventario < backend/sql/schema.sql
mysql -u appuser -p123456 sistema_inventario < backend/sql/seed_admin.sql
[ -f backend/sql/seed_cajas.sql ] && mysql -u appuser -p123456 sistema_inventario < backend/sql/seed_cajas.sql

# 5. .env del backend para el VPS
echo "[5/7] Escribiendo backend/.env..."
cat > backend/.env <<'EOF'
DB_HOST=127.0.0.1
DB_USER=appuser
DB_PASSWORD=123456
DB_NAME=sistema_inventario
DB_PORT=3306
PORT=4001
ADMIN_USER=admin
ADMIN_PASS=admin123
EOF

# 6. Dependencias + build
echo "[6/7] Instalando dependencias y compilando..."
npm install
cd backend && npm install && cd ..
npm run build

# 7. PM2
echo "[7/7] Iniciando servicios con PM2..."
pm2 delete inventario-backend 2>/dev/null || true
pm2 delete inventario-frontend 2>/dev/null || true
pm2 start backend/server.js --name inventario-backend
pm2 serve dist 4000 --name inventario-frontend --spa
pm2 save

# Firewall
ufw allow 4000/tcp 2>/dev/null || true
ufw allow 4001/tcp 2>/dev/null || true

IP=$(curl -s ifconfig.me || echo "TU_IP")
echo ""
echo "============================================"
echo "  INSTALACIÓN COMPLETA"
echo "============================================"
echo "  Panel:  http://$IP:4000"
echo "  API:    http://$IP:4001"
echo "  Login:  admin / admin123"
echo "  BD:     sistema_inventario (appuser/123456)"
echo "============================================"
