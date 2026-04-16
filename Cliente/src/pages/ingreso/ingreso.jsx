// Cliente/src/pages/ingreso/ingreso.jsx
import React, { useState } from 'react';
import visitasservice from '../../services/visitasservice';
import Sidebar from '../../componentes/sidebar/sidebar';
import './ingreso.css';

export default function Ingreso({ navegar, cerrarSesion }) {
  const [form, setForm] = useState({
    nombre: '', documento: '', apartamento: '',
    residente_responsable: '', correo: '', telefono: ''
  });
  const [error,    setError]    = useState('');
  const [exito,    setExito]    = useState(false);
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
      <Sidebar paginaActiva="ingreso" navegar={navegar} cerrarSesion={cerrarSesion} />

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
