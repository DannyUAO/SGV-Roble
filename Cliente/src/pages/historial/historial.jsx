// Cliente/src/pages/historial/historial.jsx
import React, { useEffect, useState } from 'react';
import visitasservice from '../../services/visitasservice';
import authservice from '../../services/authservice';
import './historial.css';

export default function Historial({ navegar, cerrarSesion }) {
  const usuario = authservice.getUsuario();
  const [historial, setHistorial] = useState([]);
  const [filtros,   setFiltros]   = useState({ busqueda: '', apartamento: '', desde: '', hasta: '' });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const params = {};
      if (filtros.busqueda)    params.busqueda    = filtros.busqueda;
      if (filtros.apartamento) params.apartamento = filtros.apartamento;
      if (filtros.desde)       params.desde       = filtros.desde;
      if (filtros.hasta)       params.hasta       = filtros.hasta;
      const data = await visitasservice.getHistorial(params);
      setHistorial(data);
    } catch (err) { console.error(err); }
  };

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
          <div className="sb-item active"><span className="si-icon">📋</span><span>Historial</span></div>
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
            <h2>Historial de Visitas</h2>
          </div>
        </div>

        <div className="content">
          {/* Filtros */}
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div className="form-row cols-2">
              <div className="fgroup">
                <label>Nombre / Documento</label>
                <input className="finput" placeholder="Buscar..."
                  value={filtros.busqueda}
                  onChange={e => setFiltros({ ...filtros, busqueda: e.target.value })} />
              </div>
              <div className="fgroup">
                <label>Apartamento</label>
                <input className="finput" placeholder="Ej: 301"
                  value={filtros.apartamento}
                  onChange={e => setFiltros({ ...filtros, apartamento: e.target.value })} />
              </div>
            </div>
            <div className="form-row cols-2">
              <div className="fgroup">
                <label>Fecha inicio</label>
                <input className="finput" type="date"
                  value={filtros.desde}
                  onChange={e => setFiltros({ ...filtros, desde: e.target.value })} />
              </div>
              <div className="fgroup">
                <label>Fecha fin</label>
                <input className="finput" type="date"
                  value={filtros.hasta}
                  onChange={e => setFiltros({ ...filtros, hasta: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={cargar}>🔍 Buscar</button>
          </div>

          {/* Tabla */}
          <div className="card">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Visitante</th>
                  <th>Documento</th>
                  <th>Apartamento</th>
                  <th>Ingreso</th>
                  <th>Salida</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historial.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 16, color: '#999' }}>Sin resultados</td></tr>
                )}
                {historial.map(v => (
                  <tr key={v.visita_id}>
                    <td>{v.visitante}</td>
                    <td>{v.documento}</td>
                    <td>{v.apartamento}</td>
                    <td>{new Date(v.hora_ingreso).toLocaleString()}</td>
                    <td>{v.hora_salida ? new Date(v.hora_salida).toLocaleString() : '—'}</td>
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