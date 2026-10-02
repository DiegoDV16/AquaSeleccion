import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.js';
import { ROLES } from '../../mock/catalogoRoles.js';

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
 * Barra superior corporativa: marca AquaChile, apertura del sidebar en
 * escritorio, conmutador de rol (solo disponible en el maquetado estatico) y
 * menu de usuario con la opcion de cerrar sesion.
 */
export default function Navbar({ sidebarAbierto, onToggleSidebar }) {
  const { rolActivo, cambiarRol, usuario, rol, logout } = useAuth();
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

  function manejarCambioRol(evento) {
    cambiarRol(evento.target.value);
  }

  function manejarLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar navbar-expand-lg aqua-navbar sticky-top">
      <div className="container-fluid">
        <button
          className="btn btn-sm btn-outline-light d-lg-none me-2"
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
            <small className="text-white-50" style={{ fontSize: '0.68rem' }}>
              Evaluaciones psicologicas y reclutamiento
            </small>
          </span>
        </Link>

        <div className="d-none d-md-block navbar-text small me-auto">
          <i className="bi bi-geo-alt me-1" aria-hidden="true" />
          Puerto Montt, Chile
        </div>

        <div className="d-flex align-items-center gap-2 ms-auto">
          {/* Conmutador de rol: disponible unicamente en la etapa de maquetacion */}
          <div className="d-none d-sm-flex align-items-center gap-2">
            <label htmlFor="selector-rol" className="navbar-text small mb-0 d-none d-xl-inline">
              <i className="bi bi-person-badge me-1" aria-hidden="true" />
              Rol activo
            </label>
            <select
              id="selector-rol"
              className="form-select form-select-sm aqua-role-select"
              value={rolActivo}
              onChange={manejarCambioRol}
              title="Cambia el rol para navegar las vistas de cada modulo"
            >
              {ROLES.filter((item) => item.rutaInicio !== null).map((item) => (
                <option key={item.clave} value={item.clave}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-sm btn-outline-light d-sm-none"
            type="button"
            onClick={onToggleSidebar}
            aria-label="Cambiar rol"
          >
            <i className="bi bi-person-gear" aria-hidden="true" />
          </button>

          <div className="dropdown position-relative" ref={menuRef}>
            <button
              className="btn btn-sm d-flex align-items-center gap-2 text-white border-0"
              type="button"
              onClick={() => setMenuUsuarioAbierto((abierto) => !abierto)}
              aria-expanded={menuUsuarioAbierto}
              aria-haspopup="true"
            >
              <span className="aqua-avatar">{iniciales(usuario?.nombre)}</span>
              <span className="d-none d-xl-inline text-start lh-sm">
                <span className="d-block small fw-semibold">{usuario?.nombre ?? 'Usuario'}</span>
                <span className="d-block text-white-50" style={{ fontSize: '0.7rem' }}>
                  {rol.nombre}
                </span>
              </span>
              <i className={`bi ${menuUsuarioAbierto ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true" />
            </button>

            {menuUsuarioAbierto && (
              <div
                className="dropdown-menu dropdown-menu-end show position-absolute mt-2"
                style={{ right: 0, left: 'auto' }}
              >
                <div className="px-3 py-2 border-bottom">
                  <p className="mb-0 fw-semibold small">{usuario?.nombre}</p>
                  <p className="mb-0 text-muted-aqua" style={{ fontSize: '0.76rem' }}>
                    {usuario?.correo}
                  </p>
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