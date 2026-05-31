import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { db } from '../db.js';

const router = express.Router();

const ESTADOS = ['ACTIVO', 'REVISION', 'SUSPENDIDO', 'NO_HABIDO'];
const validarEstado = (e) => (e && ESTADOS.includes(e) ? e : 'ACTIVO');

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

const traducirError = (err) => {
  if (err.code === 'ER_DUP_ENTRY') return 'El código QR ya existe. Usa uno diferente.';
  return err.message || 'Error en el servidor.';
};

const registrarHistorial = async (conn, entidad, entidadId, accion, descripcion) => {
  try {
    await conn.query(
      'INSERT INTO historial (entidad, entidad_id, accion, descripcion) VALUES (?, ?, ?, ?)',
      [entidad, entidadId, accion, descripcion]
    );
  } catch (_) { /* no romper la operación principal por historial */ }
};

// ── Stats ──
router.get('/stats', async (_req, res) => {
  try {
    const [[totales]] = await db.query(
      'SELECT COUNT(*) AS total_cajas, COALESCE(SUM(cantidad),0) AS total_unidades FROM cajas'
    );
    const [porEstado] = await db.query(
      'SELECT estado, COUNT(*) AS total FROM cajas GROUP BY estado'
    );
    const [porCategoria] = await db.query(`
      SELECT c.nombre, c.color, COUNT(p.id) AS productos, COALESCE(SUM(p.cantidad), 0) AS unidades
      FROM categorias c
      LEFT JOIN productos p ON p.categoria_id = c.id
      GROUP BY c.id ORDER BY productos DESC
    `);
    res.json({ ...totales, porEstado, porCategoria });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Sugerir próximo código QR ──
router.get('/siguiente-qr', async (_req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT codigo_qr FROM cajas WHERE codigo_qr REGEXP '^QR-[0-9]+$' ORDER BY CAST(SUBSTRING(codigo_qr, 4) AS UNSIGNED) DESC LIMIT 1"
    );
    let next = 1;
    if (rows.length > 0) {
      next = parseInt(rows[0].codigo_qr.replace('QR-', ''), 10) + 1;
    }
    res.json({ codigo_qr: `QR-${String(next).padStart(3, '0')}` });
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
  const estado = req.query.estado || '';

  const where = []; const params = [];
  if (search) {
    where.push(`(c.codigo_qr LIKE ? OR c.detalles LIKE ? OR EXISTS (
      SELECT 1 FROM productos p WHERE p.caja_id = c.id AND (
        p.nombre LIKE ? OR p.numero_serie LIKE ? OR p.marca LIKE ? OR p.modelo LIKE ? OR p.tipo LIKE ?
      )
    ))`);
    const like = `%${search}%`;
    params.push(like, like, like, like, like, like, like);
  }
  if (estado) { where.push('c.estado = ?'); params.push(estado); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM cajas c ${whereSql}`, params);
    const [rows] = await db.query(
      `SELECT c.*,
              (SELECT ruta FROM caja_imagenes WHERE caja_id = c.id ORDER BY id LIMIT 1) AS portada,
              (SELECT COUNT(*) FROM productos p WHERE p.caja_id = c.id) AS total_productos
       FROM cajas c ${whereSql}
       ORDER BY c.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ data: rows, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Detalle de caja (con imágenes y productos) ──
router.get('/:id', async (req, res) => {
  try {
    const [[caja]] = await db.query('SELECT * FROM cajas WHERE id = ?', [req.params.id]);
    if (!caja) return res.status(404).json({ error: 'Caja no encontrada' });
    const [imagenes] = await db.query(
      'SELECT id, ruta FROM caja_imagenes WHERE caja_id = ? ORDER BY id',
      [req.params.id]
    );
    const [productos] = await db.query(
      `SELECT p.*, cat.nombre AS categoria_nombre, cat.color AS categoria_color,
              (SELECT COUNT(*) FROM producto_imagenes WHERE producto_id = p.id) AS total_imagenes
       FROM productos p
       LEFT JOIN categorias cat ON cat.id = p.categoria_id
       WHERE p.caja_id = ? ORDER BY p.id DESC`,
      [req.params.id]
    );
    res.json({ ...caja, imagenes, productos });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Historial de una caja ──
router.get('/:id/historial', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM historial WHERE entidad = 'CAJA' AND entidad_id = ? ORDER BY fecha DESC LIMIT 100`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Crear caja (con N imágenes) ──
router.post('/', uploadCaja.array('imagenes', 6), async (req, res) => {
  const { codigo_qr, estado, detalles } = req.body;
  if (!codigo_qr || !codigo_qr.trim()) return res.status(400).json({ error: 'El código QR es obligatorio.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO cajas (codigo_qr, cantidad, estado, detalles) VALUES (?, 0, ?, ?)',
      [codigo_qr.trim(), validarEstado(estado), detalles || null]
    );
    const cajaId = result.insertId;

    const archivos = req.files || [];
    if (archivos.length > 0) {
      const valores = archivos.map((f) => [cajaId, f.path.replace(/\\/g, '/')]);
      await conn.query('INSERT INTO caja_imagenes (caja_id, ruta) VALUES ?', [valores]);
    }
    await registrarHistorial(conn, 'CAJA', cajaId, 'CREADA', `Caja ${codigo_qr.trim()} creada con ${archivos.length} imagen(es)`);

    await conn.commit();
    res.status(201).json({ message: 'Caja registrada.', id: cajaId });
  } catch (err) {
    await conn.rollback();
    res.status(err.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ error: traducirError(err) });
  } finally { conn.release(); }
});

// ── Editar caja ──
router.put('/:id', uploadCaja.array('imagenes', 6), async (req, res) => {
  const { codigo_qr, estado, detalles } = req.body;
  if (!codigo_qr || !codigo_qr.trim()) return res.status(400).json({ error: 'El código QR es obligatorio.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE cajas SET codigo_qr=?, estado=?, detalles=?, fecha_actualizacion=NOW() WHERE id=?',
      [codigo_qr.trim(), validarEstado(estado), detalles || null, req.params.id]
    );
    const archivos = req.files || [];
    if (archivos.length > 0) {
      const valores = archivos.map((f) => [req.params.id, f.path.replace(/\\/g, '/')]);
      await conn.query('INSERT INTO caja_imagenes (caja_id, ruta) VALUES ?', [valores]);
    }
    await registrarHistorial(conn, 'CAJA', req.params.id, 'ACTUALIZADA',
      `Caja actualizada${archivos.length ? `, ${archivos.length} imagen(es) agregadas` : ''}`);
    await conn.commit();
    res.json({ message: 'Caja actualizada.' });
  } catch (err) {
    await conn.rollback();
    res.status(err.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ error: traducirError(err) });
  } finally { conn.release(); }
});

// ── Borrar imagen específica de caja ──
router.delete('/:id/imagen/:imgId', async (req, res) => {
  try {
    const [[img]] = await db.query(
      'SELECT ruta FROM caja_imagenes WHERE id = ? AND caja_id = ?',
      [req.params.imgId, req.params.id]
    );
    if (img && fs.existsSync(img.ruta)) {
      try { fs.unlinkSync(img.ruta); } catch (_) {}
    }
    await db.query('DELETE FROM caja_imagenes WHERE id = ? AND caja_id = ?',
      [req.params.imgId, req.params.id]);
    res.json({ message: 'Imagen eliminada.' });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Eliminar caja ──
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cajas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Caja eliminada.' });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

export default router;
