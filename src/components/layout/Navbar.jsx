import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.js';

function iniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join('')
    .toUpperCase();
}

/**
 * Navbar
 * Barra superior corporativa: marca AquaChile, apertura del sidebar y menu de
 * usuario. El modulo al que se ingresa lo determina el rol del usuario que
 * inicia sesion, por lo que no hay selector de rol en el maquetado.
 */
export default function Navbar({ sidebarAbierto, onToggleSidebar }) {
  const { usuario, rol, logout } = useAuth();
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuUsuarioAbierto(false);
  }, [location.pathname]);

  useEffect(() => {
    function cerrarAlClickFuera(evento) {
      if (menuRef.current && !menuRef.current.contains(evento.target)) {
        setMenuUsuarioAbierto(false);
      }
    }
    document.addEventListener('mousedown', cerrarAlClickFuera);
    return () => document.removeEventListener('mousedown', cerrarAlClickFuera);
  }, []);

  function manejarLogout() {
    logout();
    navigate('/login');
  }

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

        <div className="d-none d-md-block navbar-text small me-auto text-muted-aqua">
          <i className="bi bi-geo-alt me-1" aria-hidden="true" />
          Puerto Montt, Chile
        </div>

        <div className="d-flex align-items-center gap-2 ms-auto">
          {/* Modulo asignado por el rol del usuario: informativo, no editable */}
          {rol.rutaInicio && (
            <span className="aqua-modulo-chip d-none d-lg-inline-flex" title="Modulo asignado por tu rol">
              <i className={`bi bi-${rol.icono}`} aria-hidden="true" />
              {rol.nombre}
            </span>
          )}

          <div className="dropdown position-relative" ref={menuRef}>
            <button
              className="btn btn-sm d-flex align-items-center gap-2 border-0"
              type="button"
              onClick={() => setMenuUsuarioAbierto((abierto) => !abierto)}
              aria-expanded={menuUsuarioAbierto}
              aria-haspopup="true"
            >
              <span className="aqua-avatar">{iniciales(usuario?.nombre)}</span>
              <span className="d-none d-xl-inline text-start lh-sm">
                <span className="d-block small fw-semibold">{usuario?.nombre ?? 'Usuario'}</span>
                <span className="d-block text-muted-aqua" style={{ fontSize: '0.7rem' }}>
                  {usuario?.unidad ?? rol.nombre}
                </span>
              </span>
              <i className={`bi ${menuUsuarioAbierto ? 'bi-chevron-up' : 'bi-chevron-down'} text-muted-aqua`} aria-hidden="true" />
            </button>

            {menuUsuarioAbierto && (
              <div className="dropdown-menu dropdown-menu-end show position-absolute mt-2" style={{ right: 0, left: 'auto' }}>
                <div className="px-3 py-2 border-bottom">
                  <p className="mb-0 fw-semibold small">{usuario?.nombre}</p>
                  <p className="mb-1 text-muted-aqua" style={{ fontSize: '0.76rem' }}>
                    {usuario?.correo}
                  </p>
                  <span className={`badge badge-estado ${usuario?.estado === 'activo' ? 'badge-estado-activo' : 'badge-estado-inactivo'}`}>
                    {rol.nombre}
                  </span>
                </div>
                <Link className="dropdown-item small" to={rol.rutaInicio ?? '/login'}>
                  <i className="bi bi-speedometer2 me-2" aria-hidden="true" />
                  Ir a mi modulo
                </Link>
                <button className="dropdown-item small text-danger" type="button" onClick={manejarLogout}>
                  <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />
                  Cerrar sesion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}