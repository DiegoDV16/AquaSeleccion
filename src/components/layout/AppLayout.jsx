import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';

/**
 * AppLayout
 * Layout unico del monolito: Navbar + Sidebar + <Outlet /> + Footer.
 * El <Outlet /> renderiza la vista del modulo activo definida en AppRouter.
 */
export default function AppLayout() {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [sidebarColapsado, setSidebarColapsado] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarAbierto(false);
  }, [location.pathname]);

  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <Navbar
        sidebarAbierto={sidebarAbierto}
        onToggleSidebar={() => setSidebarAbierto((abierto) => !abierto)}
      />

      <div className="d-flex flex-grow-1 align-items-stretch">
        <Sidebar
          colapsado={sidebarColapsado}
          abierto={sidebarAbierto}
          onNavegar={() => setSidebarAbierto(false)}
        />

        {sidebarAbierto && (
          <div
            className="offcanvas-backdrop fade show d-lg-none"
            role="presentation"
            onClick={() => setSidebarAbierto(false)}
          />
        )}

        <main className="aqua-main">
          <div className="container-fluid px-3 px-lg-4">
            <div className="d-none d-lg-flex justify-content-end mb-2">
              <button
                className="btn btn-sm border"
                type="button"
                onClick={() => setSidebarColapsado((colapsado) => !colapsado)}
                aria-label={sidebarColapsado ? 'Expandir menu lateral' : 'Plegar menu lateral'}
                style={{ borderRadius: '999px', backgroundColor: '#fff', color: '#0e3a5d', borderColor: 'var(--aqua-border, #d3e4fe)' }}
              >
                <i className={`bi ${sidebarColapsado ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar-inset-reverse'}`} aria-hidden="true" />
                <span className="ms-1">{sidebarColapsado ? 'Expandir menu' : 'Plegar menu'}</span>
              </button>
            </div>

            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}