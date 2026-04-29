// Cliente/src/pages/salida/salida.jsx
import React, { useEffect, useState } from 'react';
import visitasservice from '../../services/visitasservice';
import Sidebar from '../../componentes/sidebar/sidebar';
import './salida.css';

export default function Salida({ navegar, cerrarSesion }) {
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
      <Sidebar paginaActiva="salida" navegar={navegar} cerrarSesion={cerrarSesion} />

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="tb-back" onClick={() => navegar('dashboard')}>←</span>
            <h2>Registrar Salida</h2>
          </div>
        </div>

        <div className="content">
          {mensaje && <div className={mensaje.startsWith('✅') ? 'exito-box' : 'error-box'}>{mensaje}</div>}

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
