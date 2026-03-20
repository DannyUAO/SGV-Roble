// Cliente/src/pages/reportes/reportes.jsx
import React, { useEffect, useState } from 'react';
import visitasservice from '../../services/visitasservice';
import authservice from '../../services/authservice';

export default function Reportes({ navegar, cerrarSesion }) {
  const usuario = authservice.getUsuario();
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    visitasservice.getHistorial()
      .then(setHistorial)
      .catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalHoy = historial.filter(v => {
    const hoy = new Date().toDateString();
    return new Date(v.hora_ingreso).toDateString() === hoy;
  }).length;

  const dentroAhora = historial.filter(v => v.estado === 'dentro').length;

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
          <div className="sb-item" onClick={() => navegar('salida')}><span className="si-icon">🚪</span><span>Registrar Salida</span></div>
          <div className="sb-item" onClick={() => navegar('historial')}><span className="si-icon">📋</span><span>Historial</span></div>
          <div className="sb-item" onClick={() => navegar('frecuentes')}><span className="si-icon">⭐</span><span>Frecuentes</span></div>
          <div className="sb-section-label">Administración</div>
          <div className="sb-item active"><span className="si-icon">📊</span><span>Reportes</span></div>
          <div className="sb-item" onClick={() => navegar('usuarios')}><span className="si-icon">👥</span><span>Usuarios</span></div>
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
            <h2>Reportes</h2>
          </div>
        </div>

        <div className="content">
          <div className="kpi-grid">
            <div className="kpi-card c-blue">
              <div className="kpi-icon">📥</div>
              <div className="kpi-val">{totalHoy}</div>
              <div className="kpi-label">Ingresos hoy</div>
            </div>
            <div className="kpi-card c-green">
              <div className="kpi-icon">🏢</div>
              <div className="kpi-val">{dentroAhora}</div>
              <div className="kpi-label">Dentro ahora</div>
            </div>
            <div className="kpi-card c-purple">
              <div className="kpi-icon">📋</div>
              <div className="kpi-val">{historial.length}</div>
              <div className="kpi-label">Total registros</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 24, padding: 16 }}>
            <h3>Últimas 10 visitas</h3>
            <table className="tabla" style={{ marginTop: 16 }}>
              <thead>
                <tr>
                  <th>Visitante</th>
                  <th>Apartamento</th>
                  <th>Ingreso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historial.slice(0, 10).map(v => (
                  <tr key={v.visita_id}>
                    <td>{v.visitante}</td>
                    <td>{v.apartamento}</td>
                    <td>{new Date(v.hora_ingreso).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${v.estado === 'dentro' ? 'badge-green' : 'badge-gray'}`}>
                        {v.estado === 'dentro' ? '● Dentro' : '✓ Salió'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}