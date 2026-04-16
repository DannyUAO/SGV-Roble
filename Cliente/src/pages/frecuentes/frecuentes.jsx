// Cliente/src/pages/frecuentes/frecuentes.jsx
import React, { useEffect, useState } from 'react';
import visitasservice from '../../services/visitasservice';
import Sidebar from '../../componentes/sidebar/sidebar';
import './frecuentes.css';

export default function Frecuentes({ navegar, cerrarSesion }) {
  const [frecuentes, setFrecuentes] = useState([]);

  useEffect(() => {
    visitasservice.getFrecuentes()
      .then(setFrecuentes)
      .catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app-layout">
      <Sidebar paginaActiva="frecuentes" navegar={navegar} cerrarSesion={cerrarSesion} />

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
