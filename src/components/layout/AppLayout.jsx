import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import { useAuth } from '../../context/AuthContext.js';

/**
 * AppLayout
 * Layout unico del monolito: Navbar + Sidebar + <Outlet /> + Footer.
 * El <Outlet /> renderiza la vista del modulo activo definida en AppRouter.
 */
export default function AppLayout() {
  const { cargando, autenticado } = useAuth();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [sidebarColapsado, setSidebarColapsado] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarAbierto(false);
  }, [location.pathname]);

  // Mientras se restaura la sesion no se renderiza el layout: el rol todavia
  // es null y el Navbar lo necesita para el enlace del modulo.
  if (cargando) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center text-muted-aqua">
          <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
          <p className="mb-0 small">Restaurando sesion...</p>
        </div>
      </div>
    );
  }

  // Sin sesion, RutaProtegida se encarga de redirigir al login.
  if (!autenticado) {
    return <Outlet />;
  }

  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido principal
      </a>

      <Navbar
        sidebarAbierto={sidebarAbierto}
        onToggleSidebar={() => setSidebarAbierto((abierto) => !abierto)}
      />

      <div className="d-flex flex-grow-1 align-items-stretch">
        <Sidebar
          colapsado={sidebarColapsado}
          abierto={sidebarAbierto}
          onNavegar={() => setSidebarAbierto(false)}
          onToggleColapsado={() => setSidebarColapsado((colapsado) => !colapsado)}
        />

        {sidebarAbierto && (
          <div
            className="offcanvas-backdrop fade show d-lg-none"
            role="presentation"
            onClick={() => setSidebarAbierto(false)}
          />
        )}

        <main id="contenido-principal" className="aqua-main" tabIndex={-1}>
          <div className="container-fluid px-3 px-lg-4">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}