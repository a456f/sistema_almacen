import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db.js';
import authRoutes from './routes/authRoutes.js';
import cajasRoutes from './routes/cajasRoutes.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4001;

app.use(cors({ origin: true }));
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`\n🚀 Sistema de Inventario - backend escuchando en http://localhost:${PORT}`);
});
