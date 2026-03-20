// server/rutas/auth.js
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../bd/connection');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { documento, contrasena } = req.body;

  if (!documento || !contrasena)
    return res.status(400).json({ error: 'Documento y contraseña requeridos' });

  try {
    // Buscar usuario
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE documento = $1 AND activo = TRUE',
      [documento]
    );

    if (!rows.length)
      return res.status(401).json({ error: 'Credenciales inválidas' });

    const usuario = rows[0];

    // Verificar bloqueo temporal (RF-06)
    if (usuario.bloqueado_hasta && new Date() < new Date(usuario.bloqueado_hasta))
      return res.status(403).json({ error: 'Usuario bloqueado temporalmente. Intenta en 5 minutos.' });

    // Verificar contraseña
    const valida = await bcrypt.compare(contrasena, usuario.contrasena_hash);

    if (!valida) {
      // Incrementar intentos fallidos
      const intentos = usuario.intentos_fallidos + 1;
      const bloqueo  = intentos >= 3
        ? new Date(Date.now() + 5 * 60 * 1000) // 5 minutos
        : null;

      await pool.query(
        'UPDATE usuarios SET intentos_fallidos=$1, bloqueado_hasta=$2 WHERE id=$3',
        [intentos, bloqueo, usuario.id]
      );

      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Resetear intentos fallidos
    await pool.query(
      'UPDATE usuarios SET intentos_fallidos=0, bloqueado_hasta=NULL WHERE id=$1',
      [usuario.id]
    );

    // Generar JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      usuario: {
        id:     usuario.id,
        nombre: usuario.nombre,
        rol:    usuario.rol,
        turno:  usuario.turno,
        correo: usuario.correo,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;