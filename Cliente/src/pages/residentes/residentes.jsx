// Cliente/src/pages/residentes/residentes.jsx
import React, { useEffect, useState } from 'react';
import residentesservice from '../../services/residentesservice';
import Sidebar from '../../componentes/sidebar/sidebar';
import './residentes.css';

const FORM_VACIO = { apartamento: '', nombre: '', correo: '' };

export default function Residentes({ navegar, cerrarSesion }) {
  const [residentes, setResidentes]   = useState([]);
  const [form, setForm]               = useState(FORM_VACIO);
  const [editando, setEditando]       = useState(null); // id del residente en edición
  const [error, setError]             = useState('');
  const [exito, setExito]             = useState('');

  useEffect(() => {
    residentesservice.getAll()
      .then(setResidentes)
      .catch(() => setError('Error al cargar residentes'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setExito('');
    try {
      if (editando) {
        const actualizado = await residentesservice.editar(editando, { ...form, activo: true });
        setResidentes(residentes.map(r => r.id === editando ? actualizado : r));
        setExito('✅ Residente actualizado');
      } else {
        const nuevo = await residentesservice.crear(form);
        setResidentes([...residentes, nuevo]);
        setExito('✅ Residente registrado');
      }
      setForm(FORM_VACIO);
      setEditando(null);
    } catch (err) {
      setError(err.error || 'Error al guardar residente');
    }
  };

  const iniciarEdicion = (r) => {
    setEditando(r.id);
    setForm({ apartamento: r.apartamento, nombre: r.nombre, correo: r.correo });
    setError(''); setExito('');
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setError(''); setExito('');
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este residente?')) return;
    try {
      await residentesservice.eliminar(id);
      setResidentes(residentes.filter(r => r.id !== id));
      setExito('✅ Residente eliminado');
    } catch (err) {
      setError(err.error || 'Error al eliminar');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar paginaActiva="residentes" navegar={navegar} cerrarSesion={cerrarSesion} />

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="tb-back" onClick={() => navegar('dashboard')}>←</span>
            <h2>Residentes</h2>
          </div>
        </div>

        <div className="content">
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>
              {editando ? 'Editar Residente' : 'Nuevo Residente'}
            </h3>

            {error && <div className="error-box">❌ {error}</div>}
            {exito && <div className="exito-box">{exito}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row cols-3">
                <div className="fgroup">
                  <label>Apartamento *</label>
                  <input
                    className="finput"
                    name="apartamento"
                    value={form.apartamento}
                    onChange={handleChange}
                    placeholder="Ej: 301"
                    disabled={!!editando}
                    required
                  />
                </div>
                <div className="fgroup">
                  <label>Nombre del residente *</label>
                  <input
                    className="finput"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Nombre completo"
                    required
                  />
                </div>
                <div className="fgroup">
                  <label>Correo electrónico *</label>
                  <input
                    className="finput"
                    name="correo"
                    type="email"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit">
                  {editando ? '💾 Guardar cambios' : '➕ Registrar'}
                </button>
                {editando && (
                  <button className="btn btn-secondary" type="button" onClick={cancelarEdicion}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Apartamento</th>
                  <th>Residente</th>
                  <th>Correo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {residentes.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: 24 }}>
                    No hay residentes registrados
                  </td></tr>
                )}
                {residentes.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.apartamento}</strong></td>
                    <td>{r.nombre}</td>
                    <td>{r.correo}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" onClick={() => iniciarEdicion(r)}>
                        ✏️ Editar
                      </button>
                      <button className="btn btn-danger" onClick={() => eliminar(r.id)}>
                        🗑️ Eliminar
                      </button>
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
