// Cliente/src/pages/frecuentes/frecuentes.jsx
import React, { useEffect, useState } from 'react';
import visitasservice from '../../services/visitasservice';
import authservice from '../../services/authservice';
import './frecuentes.css';

export default function Frecuentes({ navegar, cerrarSesion }) {
  const usuario = authservice.getUsuario();
  const [frecuentes, setFrecuentes] = useState([]);

  useEffect(() => {
    visitasservice.getFrecuentes()
      .then(setFrecuentes)
      .catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          <div className="sb-item active"><span className="si-icon">⭐</span><span>Frecuentes</span></div>
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
            <h2>Visitantes Frecuentes</h2>
          </div>
        </div>

        <div className="content">
          <div className="card">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Visitas</th>
                  <th>Último apartamento</th>
                  <th>Última visita</th>
                </tr>
              </thead>
              <tbody>
                {frecuentes.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 16, color: '#999' }}>Sin visitantes frecuentes aún</td></tr>
                )}
                {frecuentes.map(v => (
                  <tr key={v.id}>
                    <td>{v.nombre}</td>
                    <td>{v.documento}</td>
                    <td><span className="badge badge-green">⭐ {v.visitas_totales}</span></td>
                    <td>{v.ultimo_apartamento || '—'}</td>
                    <td>{v.ultima_visita ? new Date(v.ultima_visita).toLocaleDateString() : '—'}</td>
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