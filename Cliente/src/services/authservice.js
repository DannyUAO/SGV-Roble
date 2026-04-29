// Cliente/src/services/authservice.js
const BASE_URL = 'http://localhost:3001/api';

const authservice = {
  login: async (documento, contrasena) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documento, contrasena }),
    });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    // Guardar token y usuario en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  getUsuario: () => {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  },

  isLoggedIn: () => !!localStorage.getItem('token'),
};

export default authservice;