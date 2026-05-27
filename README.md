# Sistema de Control de Inventario de Cajas

Sistema independiente (separado de OISGO) para gestionar el inventario de cajas.
Stack: **React + TypeScript + Vite** (frontend) · **Node + Express + MySQL** (backend).

## Requisitos
- Node.js 18+
- MySQL corriendo (Laragon, XAMPP o MySQL standalone)

---

## 1) Configurar la base de datos

Edita `backend/.env` con tus credenciales de MySQL. Por defecto:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          (vacío en Laragon por defecto)
DB_NAME=sistema_inventario
DB_PORT=3306
PORT=4001
ADMIN_USER=admin
ADMIN_PASS=admin123
```

## 2) Inicializar la BD (crea tablas + admin + categorías)

```bash
cd backend
npm install
npm run init-db
```

## 3) Importar las cajas del Excel  (opcional pero recomendado)

```bash
npm run import-excel
```

Lee `C:/Users/ANTHONY/Downloads/qodifica/scrap_data/descargas/Inventario_Cajas_final (1).xlsx`
y carga las ~67 cajas. Para usar otro Excel:

```bash
node importExcel.js "ruta/a/tu/archivo.xlsx"
```

## 4) Arrancar el backend

```bash
npm start
```
Queda escuchando en `http://localhost:4001`.

## 5) Arrancar el frontend (en otra terminal)

```bash
cd ..        # raíz del proyecto
npm install
npm run dev
```
Abre `http://localhost:5174`.

---

## Acceso
- Usuario: **admin**
- Contraseña: **admin123**

(se cambian en `backend/.env` antes de correr `npm run init-db`)

## Funciones
- Login con sesión persistente (7 días)
- Tabla de cajas con búsqueda, filtro por categoría y paginación
- Crear / editar / eliminar cajas
- Vista de detalle al hacer clic en una fila
- Estadísticas: total de cajas, total de unidades y desglose por categoría
- Animación de bienvenida al iniciar sesión

---

## 🚀 Despliegue en el VPS

El sistema convive con OISGO **sin chocar**: usa puertos propios (backend **4001**, panel **4000**) y su propia base de datos `sistema_inventario`. MySQL, Node y PM2 ya están instalados por OISGO.

Los datos viajan en el repo como SQL (`backend/sql/seed_cajas.sql`), así que **no necesitas subir el Excel al VPS**.

### Paso 1 — Subir el código al VPS

**Opción A · Git (recomendado).** Crea un repo en GitHub y empújalo:
```bash
# En tu PC, dentro de la carpeta del proyecto:
git init && git add -A && git commit -m "init sistema-inventario"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/sistema-inventario.git
git push -u origin main
```
Luego en el VPS:
```bash
cd /root
git clone https://github.com/TU_USUARIO/sistema-inventario.git
cd sistema-inventario
```

**Opción B · SCP (sin GitHub).** Desde tu PC (PowerShell), sube la carpeta sin node_modules:
```powershell
scp -r C:\Users\ANTHONY\Downloads\sistema-inventario root@TU_IP_VPS:/root/
```

### Paso 2 — Instalar (una sola vez)
```bash
cd /root/sistema-inventario
bash install.sh
```
Esto crea la BD, importa las 67 cajas, instala dependencias, compila y levanta PM2.

### Paso 3 — Abrir
- Panel: `http://TU_IP_VPS:4000`
- Login: **admin / admin123**

### Actualizaciones futuras
```bash
cd /root/sistema-inventario
git pull        # (si usaste git)
bash update.sh  # reinstala deps, recompila y reinicia PM2
```

### Puertos usados
| Sistema | Backend | Panel |
|---------|---------|-------|
| OISGO | 3001 | 3000 |
| Inventario | 4001 | 4000 |

---

## Estructura
```
sistema-inventario/
├── backend/
│   ├── server.js            arranque Express
│   ├── db.js                pool MySQL
│   ├── initDb.js            crea BD + tablas + admin + categorías
│   ├── importExcel.js       importa cajas desde el Excel
│   ├── sql/schema.sql       esquema de tablas
│   └── routes/              authRoutes, cajasRoutes
└── src/
    ├── pages/               Login, Dashboard
    ├── components/          CajasModule (tabla + CRUD)
    ├── services/            authService
    └── config/api.ts        detección de URL del backend
```
