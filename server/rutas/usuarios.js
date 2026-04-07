// server/rutas/usuarios.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool   = require('../bd/connection');
const auth   = require('../middleware/authmiddleware');

// Middleware: solo administradores
const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'administrador')
    return res.status(403).json({ error: 'Solo administradores' });
  next();
};

// GET /api/usuarios  — listar todos
router.get('/', auth, soloAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, documento, rol, turno, correo, activo FROM usuarios ORDER BY nombre'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/usuarios  — crear usuario
router.post('/', auth, soloAdmin, async (req, res) => {
  const { nombre, documento, contrasena, rol, turno, correo } = req.body;

  if (!nombre || !documento || !contrasena || !rol)
    return res.status(400).json({ error: 'Faltan campos obligatorios' });

  try {
    const hash = await bcrypt.hash(contrasena, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, documento, contrasena_hash, rol, turno, correo)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, nombre, documento, rol, turno, correo, activo`,
      [nombre, documento, hash, rol, turno || null, correo || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'El documento ya existe' });
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PATCH /api/usuarios/:id  — actualizar usuario
router.patch('/:id', auth, soloAdmin, async (req, res) => {
  const { nombre, rol, turno, correo, activo, contrasena } = req.body;

  try {
    let hash = null;
    if (contrasena) hash = await bcrypt.hash(contrasena, 10);

    const { rows } = await pool.query(
      `UPDATE usuarios SET
        nombre    = COALESCE($1, nombre),
        rol       = COALESCE($2, rol),
        turno     = COALESCE($3, turno),
        correo    = COALESCE($4, correo),
        activo    = COALESCE($5, activo),
        contrasena_hash = COALESCE($6, contrasena_hash),
        actualizado_en  = NOW()
       WHERE id = $7
       RETURNING id, nombre, documento, rol, turno, correo, activo`,
      [nombre, rol, turno, correo, activo, hash, req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE /api/usuarios/:id  — desactivar (no borrar)
router.delete('/:id', auth, soloAdmin, async (req, res) => {
  try {
    await pool.query(
      'UPDATE usuarios SET activo=FALSE WHERE id=$1',
      [req.params.id]
    );
    res.json({ mensaje: 'Usuario desactivado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;