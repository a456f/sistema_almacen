import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { db } from '../db.js';

const router = express.Router();

const ESTADOS = ['ACTIVO', 'REVISION', 'SUSPENDIDO', 'NO_HABIDO'];

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
const uploadProd = multer({ storage: prodStorage, limits: { fileSize: 10 * 1024 * 1024 } });

const validarEstado = (e) => (e && ESTADOS.includes(e) ? e : 'ACTIVO');

const traducirError = (err) => {
  if (err.code === 'ER_DUP_ENTRY') return 'Ya existe un registro con esos datos.';
  return 'Error en el servidor. Intenta de nuevo más tarde.';
};

// Trae las imágenes (rutas) de un producto
const fetchImagenes = async (productoId) => {
  const [imgs] = await db.query(
    'SELECT id, ruta FROM producto_imagenes WHERE producto_id = ? ORDER BY id',
    [productoId]
  );
  return imgs;
};

// ── Listar productos de una caja ──
router.get('/caja/:cajaId', async (req, res) => {
  try {
    const [productos] = await db.query(
      `SELECT * FROM productos WHERE caja_id = ? ORDER BY id DESC`,
      [req.params.cajaId]
    );
    const conImagenes = await Promise.all(
      productos.map(async (p) => ({ ...p, imagenes: await fetchImagenes(p.id) }))
    );
    res.json(conImagenes);
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Detalle de un producto ──
router.get('/:id', async (req, res) => {
  try {
    const [[producto]] = await db.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    producto.imagenes = await fetchImagenes(producto.id);
    res.json(producto);
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Crear producto vinculado a caja (con N imágenes) ──
//    Auto-incrementa caja.cantidad
router.post('/', uploadProd.any(), async (req, res) => {
  const { caja_id, nombre, numero_serie, estado } = req.body;
  if (!caja_id || !nombre) {
    return res.status(400).json({ error: 'caja_id y nombre son obligatorios.' });
  }
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Validar que la caja exista
    const [[caja]] = await connection.query('SELECT id FROM cajas WHERE id = ?', [caja_id]);
    if (!caja) throw new Error('La caja no existe.');

    const [r] = await connection.query(
      `INSERT INTO productos (caja_id, nombre, numero_serie, estado) VALUES (?, ?, ?, ?)`,
      [caja_id, nombre, numero_serie || null, validarEstado(estado)]
    );
    const productoId = r.insertId;

    // Imágenes
    const archivos = req.files || [];
    if (archivos.length > 0) {
      const valores = archivos.map((f) => [productoId, f.path.replace(/\\/g, '/')]);
      await connection.query(
        'INSERT INTO producto_imagenes (producto_id, ruta) VALUES ?',
        [valores]
      );
    }

    // Auto-incrementar cantidad de la caja
    await connection.query('UPDATE cajas SET cantidad = cantidad + 1, fecha_actualizacion = NOW() WHERE id = ?', [caja_id]);

    await connection.commit();
    res.status(201).json({ message: 'Producto registrado.', id: productoId, fotos: archivos.length });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message || traducirError(err) });
  } finally {
    connection.release();
  }
});

// ── Editar producto (puede agregar más imágenes) ──
router.put('/:id', uploadProd.any(), async (req, res) => {
  const { nombre, numero_serie, estado } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio.' });
  try {
    await db.query(
      `UPDATE productos SET nombre=?, numero_serie=?, estado=?, fecha_actualizacion=NOW() WHERE id=?`,
      [nombre, numero_serie || null, validarEstado(estado), req.params.id]
    );
    // Imágenes adicionales (si vienen)
    const archivos = req.files || [];
    if (archivos.length > 0) {
      const valores = archivos.map((f) => [req.params.id, f.path.replace(/\\/g, '/')]);
      await db.query('INSERT INTO producto_imagenes (producto_id, ruta) VALUES ?', [valores]);
    }
    res.json({ message: 'Producto actualizado.', nuevas_fotos: archivos.length });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Eliminar imagen específica ──
router.delete('/:id/imagen/:imgId', async (req, res) => {
  try {
    const [[img]] = await db.query(
      'SELECT ruta FROM producto_imagenes WHERE id = ? AND producto_id = ?',
      [req.params.imgId, req.params.id]
    );
    if (img && fs.existsSync(img.ruta)) {
      try { fs.unlinkSync(img.ruta); } catch (_) { /* archivo ya borrado */ }
    }
    await db.query('DELETE FROM producto_imagenes WHERE id = ? AND producto_id = ?',
      [req.params.imgId, req.params.id]);
    res.json({ message: 'Imagen eliminada.' });
  } catch (err) { res.status(500).json({ error: traducirError(err) }); }
});

// ── Eliminar producto (auto-decrementa cantidad) ──
router.delete('/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[producto]] = await connection.query('SELECT caja_id FROM productos WHERE id = ?', [req.params.id]);
    if (!producto) {
      await connection.rollback();
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    // Borrar archivos físicos
    const [imgs] = await connection.query('SELECT ruta FROM producto_imagenes WHERE producto_id = ?', [req.params.id]);
    for (const im of imgs) {
      if (fs.existsSync(im.ruta)) {
        try { fs.unlinkSync(im.ruta); } catch (_) {}
      }
    }
    await connection.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
    await connection.query(
      'UPDATE cajas SET cantidad = GREATEST(cantidad - 1, 0), fecha_actualizacion = NOW() WHERE id = ?',
      [producto.caja_id]
    );
    await connection.commit();
    res.json({ message: 'Producto eliminado.' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: traducirError(err) });
  } finally {
    connection.release();
  }
});

export default router;
