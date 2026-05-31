import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { db } from '../db.js';

const router = express.Router();

// Estados aplicables a productos (distintos a los de caja)
const ESTADOS = ['ACTIVO', 'AGREGADO', 'RETIRADO', 'NO_HABIDO'];
const validarEstado = (e) => (e && ESTADOS.includes(e) ? e : 'ACTIVO');

const prodStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = 'uploads/productos/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${path.extname(file.originalname)}`);
  },
});
// Máximo 6 fotos por producto
const uploadProd = multer({
  storage: prodStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 6 },
});

const traducirError = (err) => err.message || 'Error en el servidor.';

const registrarHistorial = async (conn, entidadId, accion, descripcion, entidad = 'PRODUCTO') => {
  try {
    await conn.query(
      'INSERT INTO historial (entidad, entidad_id, accion, descripcion) VALUES (?, ?, ?, ?)',
      [entidad, entidadId, accion, descripcion]
    );
  } catch (_) {}
};

const fetchImagenes = async (productoId) => {
  const [imgs] = await db.query(
    'SELECT id, ruta FROM producto_imagenes WHERE producto_id = ? ORDER BY id',
    [productoId]
  );
  return imgs;
};

// ── Listar productos de una caja (paginado) ──
router.get('/caja/:cajaId', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;
  try {
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM productos WHERE caja_id = ?',
      [req.params.cajaId]
    );
    const [productos] = await db.query(
      `SELECT p.*, cat.nombre AS categoria_nombre, cat.color AS categoria_color
       FROM productos p
       LEFT JOIN categorias cat ON cat.id = p.categoria_id
       WHERE p.caja_id = ?
       ORDER BY p.id DESC
       LIMIT ? OFFSET ?`,
      [req.params.cajaId, limit, offset]
    );
    const conImagenes = await Promise.all(
      productos.map(async (p) => ({ ...p, imagenes: await fetchImagenes(p.id) }))
    );
    res.json({
      data: conImagenes,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Detalle de un producto ──
router.get('/:id', async (req, res) => {
  try {
    const [[producto]] = await db.query(
      `SELECT p.*, cat.nombre AS categoria_nombre, cat.color AS categoria_color
       FROM productos p LEFT JOIN categorias cat ON cat.id = p.categoria_id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    producto.imagenes = await fetchImagenes(producto.id);
    res.json(producto);
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Historial de un producto ──
router.get('/:id/historial', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM historial WHERE entidad = 'PRODUCTO' AND entidad_id = ? ORDER BY fecha DESC LIMIT 100`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Crear producto (auto-incrementa cantidad de caja) ──
router.post('/', uploadProd.array('fotos', 6), async (req, res) => {
  const {
    caja_id, nombre, numero_serie, categoria_id, marca, modelo, tipo,
    descripcion, uso, caracteristicas, estado, cantidad
  } = req.body;
  if (!caja_id || !nombre) {
    return res.status(400).json({ error: 'caja_id y nombre son obligatorios.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[caja]] = await conn.query('SELECT id FROM cajas WHERE id = ?', [caja_id]);
    if (!caja) throw new Error('La caja no existe.');

    const cant = parseInt(cantidad, 10) || 1;
    const [r] = await conn.query(
      `INSERT INTO productos
       (caja_id, cantidad, categoria_id, marca, modelo, tipo, descripcion, uso, caracteristicas, nombre, numero_serie, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [caja_id, cant, categoria_id || null, marca || null, modelo || null, tipo || null,
       descripcion || null, uso || null, caracteristicas || null,
       nombre, numero_serie || null, validarEstado(estado)]
    );
    const productoId = r.insertId;

    const archivos = req.files || [];
    if (archivos.length > 0) {
      const valores = archivos.map((f) => [productoId, f.path.replace(/\\/g, '/')]);
      await conn.query('INSERT INTO producto_imagenes (producto_id, ruta) VALUES ?', [valores]);
    }

    // Auto-incrementar cantidad de la caja según cantidad declarada (default 1)
    await conn.query(
      'UPDATE cajas SET cantidad = cantidad + ?, fecha_actualizacion = NOW() WHERE id = ?',
      [cant, caja_id]
    );

    await registrarHistorial(conn, productoId, 'CREADO',
      `Producto "${nombre}" creado (${archivos.length} imagen(es))`);
    await registrarHistorial(conn, caja_id, 'PRODUCTO_AGREGADO',
      `Se agregó producto "${nombre}" (+${cant} unidades)`, 'CAJA');

    await conn.commit();
    res.status(201).json({
      message: 'Producto registrado.',
      id: productoId,
      fotos: archivos.length,
      warning: archivos.length < 3 ? `Recomendamos al menos 3 fotos (subiste ${archivos.length})` : null,
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: traducirError(err) });
  } finally { conn.release(); }
});

// ── Editar producto (puede agregar más imágenes) ──
router.put('/:id', uploadProd.array('fotos', 6), async (req, res) => {
  const {
    nombre, numero_serie, categoria_id, marca, modelo, tipo,
    descripcion, uso, caracteristicas, estado, cantidad
  } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[anterior]] = await conn.query(
      'SELECT cantidad, caja_id FROM productos WHERE id = ?', [req.params.id]
    );
    if (!anterior) throw new Error('Producto no encontrado.');

    const nuevaCant = parseInt(cantidad, 10) || anterior.cantidad;
    const delta = nuevaCant - anterior.cantidad;

    await conn.query(
      `UPDATE productos SET
        nombre=?, numero_serie=?, categoria_id=?, marca=?, modelo=?, tipo=?,
        descripcion=?, uso=?, caracteristicas=?, estado=?, cantidad=?,
        fecha_actualizacion=NOW()
       WHERE id=?`,
      [nombre, numero_serie || null, categoria_id || null, marca || null, modelo || null,
       tipo || null, descripcion || null, uso || null, caracteristicas || null,
       validarEstado(estado), nuevaCant, req.params.id]
    );
    if (delta !== 0) {
      await conn.query(
        'UPDATE cajas SET cantidad = GREATEST(cantidad + ?, 0), fecha_actualizacion = NOW() WHERE id = ?',
        [delta, anterior.caja_id]
      );
    }

    const archivos = req.files || [];
    if (archivos.length > 0) {
      const valores = archivos.map((f) => [req.params.id, f.path.replace(/\\/g, '/')]);
      await conn.query('INSERT INTO producto_imagenes (producto_id, ruta) VALUES ?', [valores]);
    }

    await registrarHistorial(conn, req.params.id, 'ACTUALIZADO',
      `Producto actualizado${archivos.length ? `, ${archivos.length} foto(s) agregadas` : ''}${delta !== 0 ? `, cantidad cambió ${delta > 0 ? '+' : ''}${delta}` : ''}`);
    await conn.commit();
    res.json({ message: 'Producto actualizado.', nuevas_fotos: archivos.length });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: traducirError(err) });
  } finally { conn.release(); }
});

// ── Eliminar imagen específica de producto ──
router.delete('/:id/imagen/:imgId', async (req, res) => {
  try {
    const [[img]] = await db.query(
      'SELECT ruta FROM producto_imagenes WHERE id = ? AND producto_id = ?',
      [req.params.imgId, req.params.id]
    );
    if (img && fs.existsSync(img.ruta)) {
      try { fs.unlinkSync(img.ruta); } catch (_) {}
    }
    await db.query('DELETE FROM producto_imagenes WHERE id = ? AND producto_id = ?',
      [req.params.imgId, req.params.id]);
    res.json({ message: 'Imagen eliminada.' });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Eliminar producto ──
router.delete('/:id', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[producto]] = await conn.query(
      'SELECT caja_id, cantidad, nombre FROM productos WHERE id = ?', [req.params.id]
    );
    if (!producto) {
      await conn.rollback();
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    const [imgs] = await conn.query('SELECT ruta FROM producto_imagenes WHERE producto_id = ?', [req.params.id]);
    for (const im of imgs) {
      if (fs.existsSync(im.ruta)) { try { fs.unlinkSync(im.ruta); } catch (_) {} }
    }
    await conn.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
    await conn.query(
      'UPDATE cajas SET cantidad = GREATEST(cantidad - ?, 0), fecha_actualizacion = NOW() WHERE id = ?',
      [producto.cantidad, producto.caja_id]
    );
    await registrarHistorial(conn, producto.caja_id, 'PRODUCTO_ELIMINADO',
      `Producto "${producto.nombre}" eliminado (-${producto.cantidad} unidades)`, 'CAJA');
    await conn.commit();
    res.json({ message: 'Producto eliminado.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: traducirError(err) });
  } finally { conn.release(); }
});

export default router;
