// Cliente/src/pages/dashboard/dashboard.jsx
import React, { useEffect, useState } from 'react';
import visitasservice from '../../services/visitasservice';
import authservice from '../../services/authservice';
import './dashboard.css';
import '../../componentes/sidebar/sidebar.css';

export default function Dashboard({ navegar, cerrarSesion }) {
  const [dentroAhora, setDentroAhora] = useState([]);
  const [hora, setHora] = useState(new Date().toLocaleTimeString());
  const usuario = authservice.getUsuario();

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
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-logo">🏢</div>
          <div>
            <h3>SVG-Roble</h3>
            <p>Gestión de Visitantes</p>
          </div>
        </div>
        <nav className="sb-nav">
          <div className="sb-section-label">Principal</div>
          <div className="sb-item active" onClick={() => navegar('dashboard')}>
            <span className="si-icon">🏠</span><span>Dashboard</span>
          </div>
          <div className="sb-section-label">Visitantes</div>
          <div className="sb-item" onClick={() => navegar('ingreso')}>
            <span className="si-icon">➕</span><span>Registrar Ingreso</span>
          </div>
          <div className="sb-item" onClick={() => navegar('salida')}>
            <span className="si-icon">🚪</span><span>Registrar Salida</span>
          </div>
          <div className="sb-item" onClick={() => navegar('historial')}>
            <span className="si-icon">📋</span><span>Historial</span>
          </div>
          <div className="sb-item" onClick={() => navegar('frecuentes')}>
            <span className="si-icon">⭐</span><span>Frecuentes</span>
          </div>
          {usuario?.rol === 'administrador' && (
            <>
              <div className="sb-section-label">Administración</div>
              <div className="sb-item" onClick={() => navegar('reportes')}>
                <span className="si-icon">📊</span><span>Reportes</span>
              </div>
              <div className="sb-item" onClick={() => navegar('usuarios')}>
                <span className="si-icon">👥</span><span>Usuarios</span>
              </div>
            </>
          )}
        </nav>
        <div className="sb-user">
          <div className="sb-avatar">{usuario?.nombre?.[0] || 'U'}</div>
          <div className="sb-user-info">
            <h4>{usuario?.nombre}</h4>
            <p>{usuario?.rol} · {usuario?.turno || ''}</p>
          </div>
          <div className="sb-logout" onClick={cerrarSesion} title="Cerrar sesión">⏻</div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-left"><h2>Panel de Control</h2></div>
          <div className="topbar-right">
            <span className="badge badge-green">● Sistema activo</span>
            <span className="tb-time">{hora}</span>
          </div>
        </div>

        <div className="content">
          {/* KPIs */}
          <div className="kpi-grid">
            <div className="kpi-card c-green">
              <div className="kpi-icon">🏢</div>
              <div className="kpi-val">{dentroAhora.length}</div>
              <div className="kpi-label">Dentro ahora</div>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="section-header"><h3>Accesos Rápidos</h3></div>
          <div className="quick-grid">
            <div className="quick-card" onClick={() => navegar('ingreso')}>
              <div className="qc-icon">➕</div>
              <div className="qc-title">Registrar Ingreso</div>
            </div>
            <div className="quick-card" onClick={() => navegar('salida')}>
              <div className="qc-icon">🚪</div>
              <div className="qc-title">Registrar Salida</div>
            </div>
            <div className="quick-card" onClick={() => navegar('historial')}>
              <div className="qc-icon">📋</div>
              <div className="qc-title">Ver Historial</div>
            </div>
            <div className="quick-card" onClick={() => navegar('frecuentes')}>
              <div className="qc-icon">⭐</div>
              <div className="qc-title">Frecuentes</div>
            </div>
          </div>

          {/* Dentro ahora */}
          <div className="card" style={{ marginTop: 24 }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f1f1', display: 'flex', justifyContent: 'space-between' }}>
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