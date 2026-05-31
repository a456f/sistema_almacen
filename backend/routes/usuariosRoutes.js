import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db.js';

const router = express.Router();

// GET lista de usuarios
router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, username, nombre, rol, estado, ultimo_login, fecha_creacion
       FROM usuarios ORDER BY id`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST crear usuario
router.post('/', async (req, res) => {
  const { username, password, nombre, rol } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      `INSERT INTO usuarios (username, password_hash, nombre, rol, estado)
       VALUES (?, ?, ?, ?, 1)`,
      [username.trim(), hash, nombre?.trim() || null, rol || 'admin']
    );
    res.status(201).json({ id: r.insertId, username });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ese usuario ya existe.' });
    res.status(500).json({ error: err.message });
  }
});

// PUT editar (nombre/rol/estado/contraseña opcional)
router.put('/:id', async (req, res) => {
  const { nombre, rol, estado, password } = req.body || {};
  try {
    let sql = 'UPDATE usuarios SET nombre=?, rol=?, estado=?';
    const params = [nombre || null, rol || 'admin', estado ?? 1];
    if (password && password.trim()) {
      const hash = await bcrypt.hash(password, 10);
      sql += ', password_hash=?';
      params.push(hash);
    }
    sql += ' WHERE id=?';
    params.push(req.params.id);
    await db.query(sql, params);
    res.json({ message: 'Usuario actualizado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
