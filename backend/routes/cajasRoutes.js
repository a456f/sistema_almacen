import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { db } from '../db.js';

const router = express.Router();

// Multer para imagen de caja (1 sola)
const cajaStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = 'uploads/cajas/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `caja_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${path.extname(file.originalname)}`);
  },
});
const uploadCaja = multer({ storage: cajaStorage, limits: { fileSize: 10 * 1024 * 1024 } });

const ESTADOS = ['ACTIVO', 'REVISION', 'SUSPENDIDO', 'NO_HABIDO'];

const traducirError = (err) => {
  if (err.code === 'ER_DUP_ENTRY') return 'Ya existe un registro con esos datos.';
  if (err.code === 'ER_BAD_NULL_ERROR') return 'Falta un campo obligatorio.';
  return 'Error en el servidor. Intenta de nuevo más tarde.';
};

// ── Stats ──
router.get('/stats', async (_req, res) => {
  try {
    const [[totales]] = await db.query(
      'SELECT COUNT(*) AS total_cajas, COALESCE(SUM(cantidad),0) AS total_unidades FROM cajas'
    );
    const [porCategoria] = await db.query(`
      SELECT c.nombre, c.color, COUNT(cj.id) AS cajas, COALESCE(SUM(cj.cantidad),0) AS unidades
      FROM categorias c
      LEFT JOIN cajas cj ON cj.categoria_id = c.id
      GROUP BY c.id ORDER BY cajas DESC
    `);
    const [porEstado] = await db.query(
      `SELECT estado, COUNT(*) AS total FROM cajas GROUP BY estado`
    );
    res.json({ ...totales, porCategoria, porEstado });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Categorías ──
router.get('/categorias', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Listado de cajas ──
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();
  const categoria = req.query.categoria || '';
  const estado = req.query.estado || '';

  const where = []; const params = [];
  if (search) {
    where.push('(c.numero_caja LIKE ? OR c.marca LIKE ? OR c.modelo LIKE ? OR c.descripcion LIKE ? OR c.tipo LIKE ? OR EXISTS (SELECT 1 FROM productos p WHERE p.caja_id = c.id AND (p.nombre LIKE ? OR p.numero_serie LIKE ?)))');
    const like = `%${search}%`;
    params.push(like, like, like, like, like, like, like);
  }
  if (categoria) { where.push('c.categoria_id = ?'); params.push(categoria); }
  if (estado)    { where.push('c.estado = ?');       params.push(estado); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM cajas c ${whereSql}`, params);
    const [rows] = await db.query(
      `SELECT c.*, cat.nombre AS categoria_nombre, cat.color AS categoria_color,
              (SELECT COUNT(*) FROM productos p WHERE p.caja_id = c.id) AS total_productos
       FROM cajas c
       LEFT JOIN categorias cat ON cat.id = c.categoria_id
       ${whereSql}
       ORDER BY c.numero_caja, c.id
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ data: rows, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Detalle (con productos e imágenes) ──
router.get('/:id', async (req, res) => {
  try {
    const [[caja]] = await db.query(
      `SELECT c.*, cat.nombre AS categoria_nombre, cat.color AS categoria_color
       FROM cajas c LEFT JOIN categorias cat ON cat.id = c.categoria_id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (!caja) return res.status(404).json({ error: 'Caja no encontrada' });
    const [productos] = await db.query(
      `SELECT p.*, (SELECT COUNT(*) FROM producto_imagenes WHERE producto_id = p.id) AS total_imagenes
       FROM productos p WHERE p.caja_id = ? ORDER BY p.id DESC`,
      [req.params.id]
    );
    res.json({ ...caja, productos });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// Helper para validar estado
const validarEstado = (e) => (e && ESTADOS.includes(e) ? e : 'ACTIVO');

// ── Crear caja (con imagen opcional) ──
router.post('/', uploadCaja.single('imagen'), async (req, res) => {
  const { numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id, estado } = req.body;
  if (!numero_caja) return res.status(400).json({ error: 'El número de caja es obligatorio.' });
  try {
    const imagen = req.file ? req.file.path.replace(/\\/g, '/') : null;
    const [result] = await db.query(
      `INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id, estado, imagen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero_caja, parseInt(cantidad, 10) || 0, marca || null, modelo || null, descripcion || null,
       tipo || null, uso || null, caracteristicas || null, categoria_id || null, validarEstado(estado), imagen]
    );
    res.status(201).json({ message: 'Caja registrada.', id: result.insertId });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Editar caja ──
router.put('/:id', uploadCaja.single('imagen'), async (req, res) => {
  const { numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id, estado } = req.body;
  if (!numero_caja) return res.status(400).json({ error: 'El número de caja es obligatorio.' });
  try {
    // Si llega nueva imagen, usar; si no, mantener la existente
    let imagenSql = '';
    const params = [numero_caja, parseInt(cantidad, 10) || 0, marca || null, modelo || null, descripcion || null,
      tipo || null, uso || null, caracteristicas || null, categoria_id || null, validarEstado(estado)];
    if (req.file) {
      imagenSql = ', imagen=?';
      params.push(req.file.path.replace(/\\/g, '/'));
    }
    params.push(req.params.id);
    await db.query(
      `UPDATE cajas SET numero_caja=?, cantidad=?, marca=?, modelo=?, descripcion=?, tipo=?, uso=?, caracteristicas=?, categoria_id=?, estado=?${imagenSql}, fecha_actualizacion=NOW() WHERE id=?`,
      params
    );
    res.json({ message: 'Caja actualizada.' });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Eliminar ──
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cajas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Caja eliminada.' });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

export default router;
