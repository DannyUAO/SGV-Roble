// Cliente/src/App.jsx
import React, { useState } from 'react';
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/dashboard';
import Ingreso from './pages/ingreso/ingreso';
import Salida from './pages/salida/salida';
import Historial from './pages/historial/historial';
import Frecuentes from './pages/frecuentes/frecuentes';
import Usuarios from './pages/usuarios/usuarios';
import Reportes from './pages/reportes/reportes';
import Residentes from './pages/residentes/residentes';
import authservice from './services/authservice';

export default function App() {
  const [pagina, setPagina] = useState(
    authservice.isLoggedIn() ? 'dashboard' : 'login'
  );

  const navegar = (p) => setPagina(p);

  const cerrarSesion = () => {
    authservice.logout();
    setPagina('login');
  };

  if (pagina === 'login') return <Login onLogin={() => navegar('dashboard')} />;

  const props = { navegar, cerrarSesion };

  return (
    <>
      {pagina === 'dashboard'  && <Dashboard  {...props} />}
      {pagina === 'ingreso'    && <Ingreso     {...props} />}
      {pagina === 'salida'     && <Salida      {...props} />}
      {pagina === 'historial'  && <Historial   {...props} />}
      {pagina === 'frecuentes' && <Frecuentes  {...props} />}
      {pagina === 'usuarios'   && <Usuarios    {...props} />}
      {pagina === 'reportes'   && <Reportes    {...props} />}
      {pagina === 'residentes' && <Residentes  {...props} />}
    </>
  );
}