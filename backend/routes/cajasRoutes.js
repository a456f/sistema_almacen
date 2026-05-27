import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Traduce errores técnicos de MySQL a mensajes amigables
const traducirError = (err) => {
  if (err.code === 'ER_DUP_ENTRY') return 'Ya existe un registro con esos datos.';
  if (err.code === 'ER_DATA_TOO_LONG') return 'Uno de los campos excede el largo permitido.';
  if (err.code === 'ER_BAD_NULL_ERROR') return 'Falta un campo obligatorio.';
  return 'Error en el servidor. Intenta de nuevo más tarde.';
};

// ── Estadísticas ──
router.get('/stats', async (_req, res) => {
  try {
    const [[totales]] = await db.query(
      'SELECT COUNT(*) AS total_cajas, COALESCE(SUM(cantidad),0) AS total_unidades FROM cajas'
    );
    const [porCategoria] = await db.query(`
      SELECT c.nombre, c.color, COUNT(cj.id) AS cajas, COALESCE(SUM(cj.cantidad),0) AS unidades
      FROM categorias c
      LEFT JOIN cajas cj ON cj.categoria_id = c.id
      GROUP BY c.id
      ORDER BY cajas DESC
    `);
    res.json({ ...totales, porCategoria });
  } catch (err) {
    res.status(500).json({ error: traducirError(err) });
  }
});

// ── Categorías ──
router.get('/categorias', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: traducirError(err) });
  }
});

// ── Listado de cajas (búsqueda + filtro + paginación) ──
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();
  const categoria = req.query.categoria || '';

  const where = [];
  const params = [];
  if (search) {
    where.push('(c.numero_caja LIKE ? OR c.marca LIKE ? OR c.modelo LIKE ? OR c.descripcion LIKE ? OR c.tipo LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like, like, like);
  }
  if (categoria) {
    where.push('c.categoria_id = ?');
    params.push(categoria);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM cajas c ${whereSql}`, params
    );
    const [rows] = await db.query(
      `SELECT c.*, cat.nombre AS categoria_nombre, cat.color AS categoria_color
       FROM cajas c
       LEFT JOIN categorias cat ON cat.id = c.categoria_id
       ${whereSql}
       ORDER BY c.numero_caja, c.id
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ data: rows, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    res.status(500).json({ error: traducirError(err) });
  }
});

// ── Crear caja ──
router.post('/', async (req, res) => {
  const { numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id } = req.body;
  if (!numero_caja) {
    return res.status(400).json({ error: 'El número de caja es obligatorio.' });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero_caja, cantidad || 0, marca || null, modelo || null, descripcion || null,
       tipo || null, uso || null, caracteristicas || null, categoria_id || null]
    );
    res.status(201).json({ message: 'Caja registrada.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: traducirError(err) });
  }
});

// ── Editar caja ──
router.put('/:id', async (req, res) => {
  const { numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id } = req.body;
  if (!numero_caja) {
    return res.status(400).json({ error: 'El número de caja es obligatorio.' });
  }
  try {
    await db.query(
      `UPDATE cajas SET numero_caja=?, cantidad=?, marca=?, modelo=?, descripcion=?, tipo=?, uso=?, caracteristicas=?, categoria_id=?, fecha_actualizacion=NOW()
       WHERE id=?`,
      [numero_caja, cantidad || 0, marca || null, modelo || null, descripcion || null,
       tipo || null, uso || null, caracteristicas || null, categoria_id || null, req.params.id]
    );
    res.json({ message: 'Caja actualizada.' });
  } catch (err) {
    res.status(500).json({ error: traducirError(err) });
  }
});

// ── Eliminar caja ──
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cajas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Caja eliminada.' });
  } catch (err) {
    res.status(500).json({ error: traducirError(err) });
  }
});

export default router;
