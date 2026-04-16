// Cliente/src/pages/usuarios/usuarios.jsx
import React, { useEffect, useState } from 'react';
import usuariosservice from '../../services/usuariosservice';
import Sidebar from '../../componentes/sidebar/sidebar';
import './usuarios.css';

export default function Usuarios({ navegar, cerrarSesion }) {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nombre: '', documento: '', contrasena: '', rol: 'vigilante', turno: 'dia', correo: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    usuariosservice.getUsuarios()
      .then(setUsuarios)
      .catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setExito('');
    try {
      const nuevo = await usuariosservice.crearUsuario(form);
      setUsuarios([...usuarios, nuevo]);
      setExito('✅ Usuario creado exitosamente');
      setForm({ nombre: '', documento: '', contrasena: '', rol: 'vigilante', turno: 'dia', correo: '' });
    } catch (err) {
      setError(err.error || 'Error al crear usuario');
    }
  };

  const desactivar = async (id) => {
    if (!window.confirm('¿Desactivar este usuario?')) return;
    try {
      await usuariosservice.desactivarUsuario(id);
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, activo: false } : u));
    } catch (err) {
      setError(err.error || 'Error al desactivar');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar paginaActiva="usuarios" navegar={navegar} cerrarSesion={cerrarSesion} />

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="tb-back" onClick={() => navegar('dashboard')}>←</span>
            <h2>Gestión de Usuarios</h2>
          </div>
        </div>

        <div className="content">
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Nuevo Usuario</h3>
            {error && <div className="error-box">❌ {error}</div>}
            {exito && <div className="exito-box">{exito}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row cols-2">
                <div className="fgroup">
                  <label>Nombre *</label>
                  <input className="finput" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                </div>
                <div className="fgroup">
                  <label>Documento *</label>
                  <input className="finput" value={form.documento} onChange={e => setForm({ ...form, documento: e.target.value })} required />
                </div>
              </div>
              <div className="form-row cols-2">
                <div className="fgroup">
                  <label>Contraseña *</label>
                  <input className="finput" type="password" value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })} required />
                </div>
                <div className="fgroup">
                  <label>Correo</label>
                  <input className="finput" type="email" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} />
                </div>
              </div>
              <div className="form-row cols-2">
                <div className="fgroup">
                  <label>Rol *</label>
                  <select className="finput" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                    <option value="vigilante">Vigilante</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
                <div className="fgroup">
                  <label>Turno</label>
                  <select className="finput" value={form.turno} onChange={e => setForm({ ...form, turno: e.target.value })}>
                    <option value="dia">Día</option>
                    <option value="noche">Noche</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" type="submit">➕ Crear Usuario</button>
            </form>
          </div>

          <div className="card">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Rol</th>
                  <th>Turno</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td>{u.nombre}</td>
                    <td>{u.documento}</td>
                    <td>{u.rol}</td>
                    <td>{u.turno || '—'}</td>
                    <td>
                      <span className={`badge ${u.activo ? 'badge-green' : 'badge-gray'}`}>
                        {u.activo ? '● Activo' : '✗ Inactivo'}
                      </span>
                    </td>
                    <td>
                      {u.activo && (
                        <button className="btn btn-danger" onClick={() => desactivar(u.id)}>
                          Desactivar
                        </button>
                      )}
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
