// Endpoints para gestionar marcas, modelos y tipos (catálogos reutilizables)
import express from 'express';
import { db } from '../db.js';

const router = express.Router();

const TABLES = { marcas: 'marcas', modelos: 'modelos', tipos: 'tipos' };

// GET todo lo necesario para los selects (carga única)
router.get('/', async (_req, res) => {
  try {
    const [marcas]  = await db.query('SELECT id, nombre FROM marcas  ORDER BY nombre');
    const [modelos] = await db.query('SELECT id, nombre FROM modelos ORDER BY nombre');
    const [tipos]   = await db.query('SELECT id, nombre FROM tipos   ORDER BY nombre');
    res.json({ marcas, modelos, tipos });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET por catálogo individual con búsqueda
router.get('/:cat', async (req, res) => {
  const tabla = TABLES[req.params.cat];
  if (!tabla) return res.status(404).json({ error: 'Catálogo no encontrado' });
  const search = (req.query.search || '').trim();
  try {
    const where = search ? 'WHERE nombre LIKE ?' : '';
    const params = search ? [`%${search}%`] : [];
    const [rows] = await db.query(
      `SELECT id, nombre FROM ${tabla} ${where} ORDER BY nombre LIMIT 200`,
      params
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST nuevo elemento (o ignorar si ya existe)
router.post('/:cat', async (req, res) => {
  const tabla = TABLES[req.params.cat];
  if (!tabla) return res.status(404).json({ error: 'Catálogo no encontrado' });
  const nombre = (req.body?.nombre || '').trim();
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const [r] = await db.query(`INSERT IGNORE INTO ${tabla} (nombre) VALUES (?)`, [nombre]);
    if (r.insertId) return res.status(201).json({ id: r.insertId, nombre });
    // ya existía
    const [[existing]] = await db.query(`SELECT id, nombre FROM ${tabla} WHERE nombre = ?`, [nombre]);
    res.json(existing);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete('/:cat/:id', async (req, res) => {
  const tabla = TABLES[req.params.cat];
  if (!tabla) return res.status(404).json({ error: 'Catálogo no encontrado' });
  try {
    await db.query(`DELETE FROM ${tabla} WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Helper exportable — auto-inserta los valores marca/modelo/tipo enviados
 *  en sus respectivos catálogos para que aparezcan en futuras sugerencias.
 */
export const autoCatalogar = async ({ marca, modelo, tipo }) => {
  try {
    if (marca?.trim())   await db.query('INSERT IGNORE INTO marcas  (nombre) VALUES (?)', [marca.trim()]);
    if (modelo?.trim())  await db.query('INSERT IGNORE INTO modelos (nombre) VALUES (?)', [modelo.trim()]);
    if (tipo?.trim())    await db.query('INSERT IGNORE INTO tipos   (nombre) VALUES (?)', [tipo.trim()]);
  } catch (_) { /* no crítico */ }
};

export default router;
