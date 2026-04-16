// Cliente/src/pages/login/Login.jsx
import React, { useState } from 'react';
import authservice from '../../services/authservice';
import './Login.css';

export default function Login({ onLogin }) {
  const [documento,  setDocumento]  = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error,      setError]      = useState('');
  const [cargando,   setCargando]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await authservice.login(documento, contrasena);
      onLogin();
    } catch (err) {
      setError(err.error || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">

      {/* Panel izquierdo — identidad visual */}
      <div className="login-left">
        <div className="ll-content">
          <div className="ll-logo">🏢</div>
          <h1 className="ll-title">SGV-Roble</h1>
          <p className="ll-subtitle">Sistema de Gestión de Visitantes</p>
          <div className="ll-features">
            <div className="ll-feature">Control de acceso en tiempo real</div>
            <div className="ll-feature">Historial completo de visitas</div>
            <div className="ll-feature">Gestión de residentes y reportes</div>
          </div>
        </div>
        <p className="ll-footer">Universidad Autónoma de Occidente · 2026</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-welcome">Bienvenido 👋</h2>
          <p className="login-desc">Inicia sesión para acceder al sistema</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Número de documento</label>
              <input
                className="form-input"
                type="text"
                placeholder="Tu cédula o documento"
                value={documento}
                onChange={e => setDocumento(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                className="form-input"
                type="password"
                placeholder="Tu contraseña"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                required
              />
              <div className="hint-box">⚠️ Máximo 3 intentos · Bloqueo automático 5 min</div>
            </div>

            {error && <div className="error-box">❌ {error}</div>}

            <button className="btn-login" type="submit" disabled={cargando}>
              {cargando ? 'Ingresando...' : 'INGRESAR AL SISTEMA →'}
            </button>
          </form>

          <div className="login-footer">
            ¿Olvidaste tu contraseña? Contacta al administrador
          </div>
        </div>
      </div>
    </div>
  );
}
