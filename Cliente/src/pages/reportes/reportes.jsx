// Cliente/src/pages/reportes/reportes.jsx
import React, { useEffect, useState } from 'react';
import visitasservice from '../../services/visitasservice';
import Sidebar from '../../componentes/sidebar/sidebar';

export default function Reportes({ navegar, cerrarSesion }) {
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
      <Sidebar paginaActiva="reportes" navegar={navegar} cerrarSesion={cerrarSesion} />

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
