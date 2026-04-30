// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ── Middlewares globales ──────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// ── Rutas ─────────────────────────────────────────────────────
app.use('/api/auth',       require('./rutas/auth'));
app.use('/api/visitas',    require('./rutas/visitas'));
app.use('/api/usuarios',   require('./rutas/usuarios'));
app.use('/api/residentes', require('./rutas/residentes'));

// ── Ruta de prueba ────────────────────────────────────────────
app.get('/', (req, res) => res.json({ mensaje: 'SGV-Roble API activa ✅' }));

// ── Arrancar servidor ─────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));