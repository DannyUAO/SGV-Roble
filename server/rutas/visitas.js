// server/rutas/visitas.js
const router = require('express').Router();
const pool   = require('../bd/connection');
const auth   = require('../middleware/authmiddleware');
const { notificarIngreso, notificarSalida } = require('../servicios/email');

// GET /api/visitas/dentro  — personas dentro ahora
router.get('/dentro', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM v_dentro_ahora ORDER BY hora_ingreso DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/visitas/historial  — historial con filtros opcionales
router.get('/historial', auth, async (req, res) => {
  const { desde, hasta, apartamento, busqueda } = req.query;
  let query  = 'SELECT * FROM v_historial WHERE 1=1';
  const params = [];

  if (desde) { params.push(desde); query += ` AND hora_ingreso >= $${params.length}`; }
  if (hasta) { params.push(hasta); query += ` AND hora_ingreso <= $${params.length}`; }
  if (apartamento) { params.push(apartamento); query += ` AND apartamento = $${params.length}`; }
  if (busqueda) {
    params.push(`%${busqueda}%`);
    query += ` AND (visitante ILIKE $${params.length} OR documento ILIKE $${params.length})`;
  }

  query += ' ORDER BY hora_ingreso DESC LIMIT 200';

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/visitas/frecuentes
router.get('/frecuentes', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM v_frecuentes ORDER BY visitas_totales DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/visitas/ingreso  — registrar ingreso
router.post('/ingreso', auth, async (req, res) => {
  const { nombre, documento, apartamento, residente_responsable, correo, telefono } = req.body;

  if (!nombre || !documento || !apartamento || !residente_responsable)
    return res.status(400).json({ error: 'Faltan campos obligatorios' });

  try {
    // Buscar o crear visitante
    let visitante = await pool.query(
      'SELECT * FROM visitantes WHERE documento = $1', [documento]
    );

    let visitante_id;
    if (visitante.rows.length) {
      visitante_id = visitante.rows[0].id;
      // Actualizar datos si cambiaron
      await pool.query(
        'UPDATE visitantes SET nombre=$1, correo=$2, telefono=$3, actualizado_en=NOW() WHERE id=$4',
        [nombre, correo || null, telefono || null, visitante_id]
      );
    } else {
      const nuevo = await pool.query(
        'INSERT INTO visitantes (nombre, documento, correo, telefono) VALUES ($1,$2,$3,$4) RETURNING id',
        [nombre, documento, correo || null, telefono || null]
      );
      visitante_id = nuevo.rows[0].id;
    }

    // Registrar visita
    const visita = await pool.query(
      `INSERT INTO visitas (visitante_id, apartamento, residente_responsable, usuario_ingreso_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [visitante_id, apartamento, residente_responsable, req.usuario.id]
    );

    // Enviar correo al residente (sin bloquear la respuesta)
    pool.query('SELECT nombre, correo FROM residentes WHERE apartamento=$1 AND activo=TRUE', [apartamento])
      .then(({ rows }) => {
        if (!rows.length) return;
        const residente = rows[0];
        return notificarIngreso({
          correoResidente: residente.correo,
          nombreResidente: residente.nombre,
          apartamento,
          visitante: nombre,
          documento,
          vigilante: req.usuario.nombre,
          horaIngreso: visita.rows[0].hora_ingreso,
        });
      })
      .catch(err => console.error('[email] Error al enviar notificación:', err.message));

    res.status(201).json(visita.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PATCH /api/visitas/:id/salida  — registrar salida
router.patch('/:id/salida', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE visitas
       SET hora_salida=NOW(), usuario_salida_id=$1, estado='salio', actualizado_en=NOW()
       WHERE id=$2 AND estado='dentro'
       RETURNING *`,
      [req.usuario.id, req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ error: 'Visita no encontrada o ya registró salida' });

    const visita = rows[0];
    res.json(visita);

    // Enviar correo al residente (sin bloquear la respuesta)
    pool.query(
      `SELECT r.nombre, r.correo, vt.nombre AS visitante, vt.documento
       FROM residentes r
       JOIN visitas vi ON vi.apartamento = r.apartamento
       JOIN visitantes vt ON vt.id = vi.visitante_id
       WHERE vi.id = $1 AND r.activo = TRUE`,
      [visita.id]
    ).then(({ rows: data }) => {
      if (!data.length) return;
      const d = data[0];
      return notificarSalida({
        correoResidente: d.correo,
        nombreResidente: d.nombre,
        apartamento: visita.apartamento,
        visitante: d.visitante,
        documento: d.documento,
        vigilante: req.usuario.nombre,
        horaIngreso: visita.hora_ingreso,
        horaSalida: visita.hora_salida,
      });
    }).catch(err => console.error('[email] Error al enviar notificación de salida:', err.message));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/visitas/buscar?documento=xxx  — autocompletado por documento
router.get('/buscar', auth, async (req, res) => {
  const { documento } = req.query;
  if (!documento) return res.json([]);

  try {
    const { rows } = await pool.query(
      `SELECT * FROM v_frecuentes WHERE documento ILIKE $1 LIMIT 5`,
      [`%${documento}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;