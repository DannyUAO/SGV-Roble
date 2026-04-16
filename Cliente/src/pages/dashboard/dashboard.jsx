// Cliente/src/pages/dashboard/dashboard.jsx
import React, { useEffect, useState } from 'react';
import visitasservice from '../../services/visitasservice';
import Sidebar from '../../componentes/sidebar/sidebar';
import './dashboard.css';

export default function Dashboard({ navegar, cerrarSesion }) {
  const [dentroAhora, setDentroAhora] = useState([]);
  const [hora, setHora] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(() => {
      setHora(new Date().toLocaleTimeString());
      cargarDatos();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      const data = await visitasservice.getDentroAhora();
      setDentroAhora(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar paginaActiva="dashboard" navegar={navegar} cerrarSesion={cerrarSesion} />

      <main className="main">
        <div className="topbar">
          <div className="topbar-left"><h2>Panel de Control</h2></div>
          <div className="topbar-right">
            <span className="badge badge-green">● Sistema activo</span>
            <span className="tb-time">{hora}</span>
          </div>
        </div>

        <div className="content">
          <div className="kpi-grid">
            <div className="kpi-card c-green">
              <div className="kpi-icon">🏢</div>
              <div className="kpi-val">{dentroAhora.length}</div>
              <div className="kpi-label">Dentro ahora</div>
            </div>
          </div>

          <div className="section-header"><h3>Accesos Rápidos</h3></div>
          <div className="quick-grid">
            <div className="quick-card qc-ingreso" onClick={() => navegar('ingreso')}>
              <div className="qc-icon">➕</div>
              <div className="qc-title">Registrar Ingreso</div>
            </div>
            <div className="quick-card qc-salida" onClick={() => navegar('salida')}>
              <div className="qc-icon">🚪</div>
              <div className="qc-title">Registrar Salida</div>
            </div>
            <div className="quick-card qc-historial" onClick={() => navegar('historial')}>
              <div className="qc-icon">📋</div>
              <div className="qc-title">Ver Historial</div>
            </div>
            <div className="quick-card qc-frecuentes" onClick={() => navegar('frecuentes')}>
              <div className="qc-icon">⭐</div>
              <div className="qc-title">Frecuentes</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-header">
              <h3>Personas dentro ahora</h3>
              <span className="badge badge-green">● En vivo</span>
            </div>
            <div className="live-feed">
              {dentroAhora.length === 0 && (
                <p style={{ padding: 16, color: '#999' }}>No hay visitantes dentro en este momento.</p>
              )}
              {dentroAhora.map(v => (
                <div key={v.visita_id} className="feed-item">
                  <div className="feed-dot entry"></div>
                  <div className="feed-info">
                    <div className="feed-name">{v.visitante}</div>
                    <div className="feed-detail">📍 Apto {v.apartamento} · Doc: {v.documento}</div>
                  </div>
                  <div className="feed-time">
                    {new Date(v.hora_ingreso).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
