// Cliente/src/pages/ingreso/ingreso.jsx
import React, { useState } from 'react';
import visitasservice from '../../services/visitasservice';
import authservice from '../../services/authservice';
import './ingreso.css';

export default function Ingreso({ navegar, cerrarSesion }) {
  const usuario = authservice.getUsuario();
  const [form, setForm] = useState({
    nombre: '', documento: '', apartamento: '',
    residente_responsable: '', correo: '', telefono: ''
  });
  const [error,   setError]   = useState('');
  const [exito,   setExito]   = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const buscarVisitante = async () => {
    if (!form.documento) return;
    try {
      const data = await visitasservice.buscarPorDocumento(form.documento);
      if (data.length) {
        const v = data[0];
        setForm(f => ({ ...f, nombre: v.nombre || f.nombre }));
      }
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await visitasservice.registrarIngreso(form);
      setExito(true);
      setForm({ nombre: '', documento: '', apartamento: '', residente_responsable: '', correo: '', telefono: '' });
    } catch (err) {
      setError(err.error || 'Error al registrar ingreso');
    } finally {
      setCargando(false);
    }
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
          <div className="sb-item active"><span className="si-icon">➕</span><span>Registrar Ingreso</span></div>
          <div className="sb-item" onClick={() => navegar('salida')}><span className="si-icon">🚪</span><span>Registrar Salida</span></div>
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
            <h2>Registrar Ingreso</h2>
          </div>
        </div>

        <div className="content">
          {exito && (
            <div className="exito-box">
              ✅ Ingreso registrado exitosamente
              <button onClick={() => setExito(false)} style={{ marginLeft: 16 }}>Nuevo ingreso</button>
            </div>
          )}

          {!exito && (
            <form className="card" style={{ padding: 24 }} onSubmit={handleSubmit}>
              <div className="form-row cols-2">
                <div className="fgroup">
                  <label>Número de documento *</label>
                  <input className="finput" name="documento" value={form.documento}
                    onChange={handleChange} onBlur={buscarVisitante} required />
                </div>
                <div className="fgroup">
                  <label>Nombre completo *</label>
                  <input className="finput" name="nombre" value={form.nombre}
                    onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row cols-2">
                <div className="fgroup">
                  <label>Apartamento a visitar *</label>
                  <input className="finput" name="apartamento" value={form.apartamento}
                    onChange={handleChange} required />
                </div>
                <div className="fgroup">
                  <label>Residente responsable *</label>
                  <input className="finput" name="residente_responsable" value={form.residente_responsable}
                    onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row cols-2">
                <div className="fgroup">
                  <label>Correo (opcional)</label>
                  <input className="finput" name="correo" type="email" value={form.correo}
                    onChange={handleChange} />
                </div>
                <div className="fgroup">
                  <label>Teléfono (opcional)</label>
                  <input className="finput" name="telefono" value={form.telefono}
                    onChange={handleChange} />
                </div>
              </div>

              {error && <div className="error-box">❌ {error}</div>}

              <button className="btn btn-primary" type="submit" disabled={cargando}>
                {cargando ? 'Registrando...' : '✅ Confirmar Ingreso'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}