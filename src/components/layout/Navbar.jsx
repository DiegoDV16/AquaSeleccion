import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.js';

/**
 * Navbar
 * Barra superior corporativa: marca AquaSeleccion y apertura del sidebar en
 * movil. El modulo al que se ingresa lo determina el rol del usuario que inicia
 * sesion, por lo que no hay selector de rol en el maquetado.
 */
export default function Navbar({ sidebarAbierto, onToggleSidebar }) {
  const { rol } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg aqua-navbar sticky-top">
      <div className="container-fluid">
        <button
          className="btn btn-sm btn-soft d-lg-none me-2"
          type="button"
          onClick={onToggleSidebar}
          aria-label="Mostrar u ocultar menu de navegacion"
          aria-expanded={sidebarAbierto}
        >
          <i className="bi bi-list fs-5" aria-hidden="true" />
        </button>

        <Link className="navbar-brand d-flex align-items-center gap-2 me-lg-3" to={rol.rutaInicio ?? '/login'}>
          <span className="aqua-brand-mark" aria-hidden="true">
            <i className="bi bi-water" />
          </span>
          <span className="d-flex flex-column lh-sm">
            <span className="fw-semibold">AquaSeleccion</span>
            <small className="text-muted-aqua" style={{ fontSize: '0.68rem' }}>
              Evaluaciones psicologicas y reclutamiento
            </small>
          </span>
        </Link>

        {/* Modulo asignado por el rol del usuario: informativo, no editable */}
        {rol.rutaInicio && (
          <span className="aqua-modulo-chip d-none d-lg-inline-flex ms-auto" title="Modulo asignado por tu rol">
            <i className={`bi bi-${rol.icono}`} aria-hidden="true" />
            {rol.nombre}
          </span>
        )}
      </div>
    </nav>
  );
}
