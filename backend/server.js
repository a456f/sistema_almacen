import express from 'express';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import authRoutes from './routes/authRoutes.js';
import cajasRoutes from './routes/cajasRoutes.js';
import productosRoutes from './routes/productosRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = Number(process.env.PORT) || 4001;

app.use(cors({ origin: true }));
app.use(compression()); // gzip todas las respuestas JSON
app.use(express.json());

// Servir archivos subidos con cache largo (7 días) — las imágenes no cambian
// Path RELATIVO (no __dirname) para que coincida con multer que escribe a 'uploads/cajas/' relativo
app.use('/uploads', express.static('uploads', {
  maxAge: '7d',
  immutable: true,
  etag: true,
}));

app.get('/api/test', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ ok: true, message: 'Backend y base de datos conectados.' });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'No hay conexión a la base de datos.' });
  }
});

app.use('/api', authRoutes);
app.use('/api/cajas', cajasRoutes);
app.use('/api/productos', productosRoutes);

app.listen(PORT, () => {
  console.log(`\n🚀 Sistema de Inventario - backend escuchando en http://localhost:${PORT}`);
});
