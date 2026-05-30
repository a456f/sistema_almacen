import express from 'express';
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
app.use(express.json());

// Servir archivos subidos (imágenes de cajas y productos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
