// Cliente/src/componentes/sidebar/Sidebar.jsx
import React from 'react';
import authservice from '../../services/authservice';
import './sidebar.css';

const MENU = [
  { id: 'dashboard',  icon: '🏠', label: 'Dashboard',        seccion: 'Principal' },
  { id: 'ingreso',    icon: '➕', label: 'Registrar Ingreso', seccion: 'Visitantes' },
  { id: 'salida',     icon: '🚪', label: 'Registrar Salida' },
  { id: 'historial',  icon: '📋', label: 'Historial' },
  { id: 'frecuentes', icon: '⭐', label: 'Frecuentes' },
  { id: 'reportes',    icon: '📊', label: 'Reportes',    seccion: 'Administración', soloAdmin: true },
  { id: 'residentes', icon: '🏠', label: 'Residentes',                             soloAdmin: true },
  { id: 'usuarios',   icon: '👥', label: 'Usuarios',                               soloAdmin: true },
];

export default function Sidebar({ paginaActiva, navegar, cerrarSesion }) {
  const usuario = authservice.getUsuario();
  const items = MENU.filter(i => !i.soloAdmin || usuario?.rol === 'administrador');

  return (
    <aside className="sidebar">

      {/* ── Marca ── */}
      <div className="sb-brand">
        <div className="sb-brand-inner">
          <div className="sb-logo">🏢</div>
          <div className="sb-brand-text">
            <h3>SGV-Roble</h3>
            <p>Gestión de Visitantes</p>
          </div>
          <div className="sb-status">
            <span className="sb-status-dot"></span>
            EN LÍNEA
          </div>
        </div>
      </div>

      {/* ── Navegación ── */}
      <nav className="sb-nav">
        {items.map(item => (
          <React.Fragment key={item.id}>
            {item.seccion && <div className="sb-section-label">{item.seccion}</div>}
            <div
              className={`sb-item${paginaActiva === item.id ? ' active' : ''}`}
              onClick={() => navegar(item.id)}
            >
              <div className="si-icon-wrap">{item.icon}</div>
              <span className="sb-item-label">{item.label}</span>
            </div>
          </React.Fragment>
        ))}
      </nav>

      {/* ── Usuario ── */}
      <div className="sb-user">
        <div className="sb-avatar-wrap">
          <div className="sb-avatar">{usuario?.nombre?.[0]?.toUpperCase() || 'U'}</div>
          <span className="sb-avatar-online"></span>
        </div>
        <div className="sb-user-info">
          <h4>{usuario?.nombre}</h4>
          <p>{usuario?.rol}{usuario?.turno ? ` · turno ${usuario.turno}` : ''}</p>
        </div>
        <div className="sb-logout" onClick={cerrarSesion} title="Cerrar sesión">⏻</div>
      </div>

    </aside>
  );
}
