// Cliente/src/pages/ingreso/ingreso.jsx
import React, { useState, useEffect } from 'react';
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

  const [visitantes,      setVisitantes]      = useState([]);
  const [filtroDocumento, setFiltroDocumento] = useState('');

  useEffect(() => {
    visitasservice.getVisitantes()
      .then(data => setVisitantes(data))
      .catch(() => {});
  }, [exito]); // recarga tras cada ingreso exitoso

  const visitantesFiltrados = filtroDocumento
    ? visitantes.filter(v => v.documento.toLowerCase().includes(filtroDocumento.toLowerCase()))
    : visitantes;

  const seleccionarVisitante = (v) => {
    setForm(f => ({
      ...f,
      nombre:    v.nombre    || '',
      documento: v.documento || '',
      correo:    v.correo    || '',
      telefono:  v.telefono  || '',
    }));
    setError('');
  };

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

          {/* Lista de visitantes registrados */}
          <div className="card visitantes-lista-card">
            <div className="visitantes-lista-header">
              <h3>Visitantes registrados</h3>
              <input
                className="finput visitantes-filtro"
                placeholder="Filtrar por documento..."
                value={filtroDocumento}
                onChange={e => setFiltroDocumento(e.target.value)}
              />
            </div>

            {visitantesFiltrados.length === 0 ? (
              <p className="visitantes-vacio">No se encontraron visitantes.</p>
            ) : (
              <ul className="visitantes-ul">
                {visitantesFiltrados.map(v => (
                  <li key={v.id} className="visitante-item" onClick={() => seleccionarVisitante(v)}>
                    <span className="visitante-avatar">{v.nombre.charAt(0).toUpperCase()}</span>
                    <div className="visitante-info">
                      <span className="visitante-nombre">{v.nombre}</span>
                      <span className="visitante-doc">Doc: {v.documento}</span>
                    </div>
                    <span className="visitante-accion">Seleccionar →</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
