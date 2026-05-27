import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son obligatorios.' });
  }
  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE username = ? AND estado = 1',
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
    }
    await db.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [user.id]);
    res.json({
      message: 'Login exitoso',
      token: `token_inv_${user.id}`,
      user: { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol },
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

export default router;
