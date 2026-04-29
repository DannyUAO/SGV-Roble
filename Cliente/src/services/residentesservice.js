// Cliente/src/services/residentesservice.js
import api from './api';

const residentesservice = {
  getAll:   ()          => api.get('/residentes'),
  crear:    (datos)     => api.post('/residentes', datos),
  editar:   (id, datos) => api.put(`/residentes/${id}`, datos),
  eliminar: (id)        => api.delete(`/residentes/${id}`),
};

export default residentesservice;
