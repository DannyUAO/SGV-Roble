// Cliente/src/pages/salida/salida.jsx
import React, { useEffect, useState } from 'react';
import visitasservice from '../../services/visitasservice';
import authservice from '../../services/authservice';
import './salida.css';

export default function Salida({ navegar, cerrarSesion }) {
  const usuario = authservice.getUsuario();
  const [dentro,   setDentro]   = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje,  setMensaje]  = useState('');

  useEffect(() => { cargarDentro(); }, []);

  const cargarDentro = async () => {
    try {
      const data = await visitasservice.getDentroAhora();
      setDentro(data);
    } catch (err) { console.error(err); }
  };

  const registrarSalida = async (visitaId) => {
    try {
      await visitasservice.registrarSalida(visitaId);
      setMensaje('✅ Salida registrada exitosamente');
      setTimeout(() => setMensaje(''), 3000);
      cargarDentro();
    } catch (err) {
      setMensaje('❌ ' + (err.error || 'Error al registrar salida'));
    }
  };

  const filtrados = dentro.filter(v =>
    v.visitante.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.documento.includes(busqueda) ||
    v.apartamento.includes(busqueda)
  );

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-logo">🏢</div>
          <div><h3>SVG-Roble</h3><p>Gestión de Visitantes</p></div>
        </div>
        <nav className="sb-nav">
          <div className="sb-item" onClick={() => navegar('dashboard')}><span className="si-icon">🏠</span><span>Dashboard</span></div>
          <div className="sb-item" onClick={() => navegar('ingreso')}><span className="si-icon">➕</span><span>Registrar Ingreso</span></div>
          <div className="sb-item active"><span className="si-icon">🚪</span><span>Registrar Salida</span></div>
          <div className="sb-item" onClick={() => navegar('historial')}><span className="si-icon">📋</span><span>Historial</span></div>
          <div className="sb-item" onClick={() => navegar('frecuentes')}><span className="si-icon">⭐</span><span>Frecuentes</span></div>
        </nav>
        <div className="sb-user">
          <div className="sb-avatar">{usuario?.nombre?.[0] || 'U'}</div>
          <div className="sb-user-info"><h4>{usuario?.nombre}</h4><p>{usuario?.rol}</p></div>
          <div className="sb-logout" onClick={cerrarSesion}>⏻</div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="tb-back" onClick={() => navegar('dashboard')}>←</span>
            <h2>Registrar Salida</h2>
          </div>
        </div>

        <div className="content">
          {mensaje && <div className="mensaje-box">{mensaje}</div>}

          <input className="search-input" placeholder="Buscar por nombre, documento o apartamento..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />

          <div className="card" style={{ marginTop: 16 }}>
            {filtrados.length === 0 && (
              <p style={{ padding: 16, color: '#999' }}>No hay visitantes dentro en este momento.</p>
            )}
            {filtrados.map(v => (
              <div key={v.visita_id} className="feed-item" style={{ padding: '12px 18px' }}>
                <div className="feed-dot entry"></div>
                <div className="feed-info">
                  <div className="feed-name">{v.visitante}</div>
                  <div className="feed-detail">
                    📍 Apto {v.apartamento} · Doc: {v.documento} ·
                    Ingresó: {new Date(v.hora_ingreso).toLocaleTimeString()}
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => registrarSalida(v.visita_id)}>
                  🚪 Registrar Salida
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}