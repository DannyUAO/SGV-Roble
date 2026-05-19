// Cliente/src/services/visitasservice.js
import api from './api';

const visitasservice = {
  // Personas dentro ahora (dashboard)
  getDentroAhora: () => api.get('/visitas/dentro'),

  // Historial con filtros opcionales
  getHistorial: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    return api.get(`/visitas/historial${params ? '?' + params : ''}`);
  },

  // Visitantes frecuentes
  getFrecuentes: () => api.get('/visitas/frecuentes'),

  // Registrar ingreso
  registrarIngreso: (datos) => api.post('/visitas/ingreso', datos),

  // Registrar salida
  registrarSalida: (visitaId) => api.patch(`/visitas/${visitaId}/salida`, {}),

  // Buscar visitante por documento (autocompletado)
  buscarPorDocumento: (documento) => api.get(`/visitas/buscar?documento=${documento}`),
};

export default visitasservice;