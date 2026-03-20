// Cliente/src/services/usuariosservice.js
import api from './api';

const usuariosservice = {
  // Listar todos los usuarios
  getUsuarios: () => api.get('/usuarios'),

  // Crear usuario
  crearUsuario: (datos) => api.post('/usuarios', datos),

  // Actualizar usuario
  actualizarUsuario: (id, datos) => api.patch(`/usuarios/${id}`, datos),

  // Desactivar usuario
  desactivarUsuario: (id) => api.delete(`/usuarios/${id}`),
};

export default usuariosservice;