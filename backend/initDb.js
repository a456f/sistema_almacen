// Inicializa la base de datos: crea la BD, tablas, usuario admin y categorías base.
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CATEGORIAS = [
  { nombre: '🔵 Red de Fibra Óptica', color: '#2563eb' },
  { nombre: '🟢 Red UTP / Datos', color: '#16a34a' },
  { nombre: '⚡ Cable / Equipo de Energía', color: '#f59e0b' },
  { nombre: '⚪ Otros / Accesorios', color: '#6b7280' },
];

async function main() {
  // 1) Conectar sin BD para poder crearla
  const root = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT) || 3306,
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
  await root.query(schema);
  console.log('✓ Base de datos y tablas creadas');
  await root.end();

  // 2) Conectar ya con la BD
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistema_inventario',
    port: Number(process.env.DB_PORT) || 3306,
  });

  // 3) Categorías base
  for (const c of CATEGORIAS) {
    await db.query('INSERT IGNORE INTO categorias (nombre, color) VALUES (?, ?)', [c.nombre, c.color]);
  }
  console.log('✓ Categorías base insertadas');

  // 4) Usuario admin
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin123';
  const hash = await bcrypt.hash(adminPass, 10);
  await db.query(
    `INSERT INTO usuarios (username, password_hash, nombre, rol)
     VALUES (?, ?, 'Administrador', 'admin')
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [adminUser, hash]
  );
  console.log(`✓ Usuario admin listo  ->  usuario: ${adminUser}  contraseña: ${adminPass}`);

  await db.end();
  console.log('\n✅ Inicialización completa. Ahora corre:  npm run import-excel  (opcional) y luego  npm start');
}

main().catch((err) => {
  console.error('✗ Error al inicializar:', err.message);
  process.exit(1);
});
