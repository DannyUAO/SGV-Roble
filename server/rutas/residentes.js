// server/rutas/residentes.js
const router = require('express').Router();
const pool   = require('../bd/connection');
const auth   = require('../middleware/authmiddleware');

// Solo administradores
const soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'administrador')
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  next();
};

// GET /api/residentes
router.get('/', auth, soloAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM residentes ORDER BY apartamento ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/residentes
router.post('/', auth, soloAdmin, async (req, res) => {
  const { apartamento, nombre, correo } = req.body;
  if (!apartamento || !nombre || !correo)
    return res.status(400).json({ error: 'Faltan campos obligatorios' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO residentes (apartamento, nombre, correo)
       VALUES ($1, $2, $3) RETURNING *`,
      [apartamento.trim(), nombre.trim(), correo.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: `El apartamento ${req.body.apartamento} ya tiene residente registrado` });
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /api/residentes/:id
router.put('/:id', auth, soloAdmin, async (req, res) => {
  const { nombre, correo, activo } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE residentes SET nombre=$1, correo=$2, activo=$3, actualizado_en=NOW()
       WHERE id=$4 RETURNING *`,
      [nombre.trim(), correo.trim(), activo ?? true, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Residente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE /api/residentes/:id
router.delete('/:id', auth, soloAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM residentes WHERE id=$1 RETURNING id',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Residente no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
