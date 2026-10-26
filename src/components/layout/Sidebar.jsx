import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.js';
import { contadoresMenu, MENU_POR_ROL } from '../../mock/menu.js';

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
 * Sidebar
 * Navegacion rapida filtrada segun el rol activo del Contexto.
 * En escritorio se puede plegar a una barra de iconos; en movil se comporta
 * como offcanvas (controlado desde AppLayout, sin depender de bootstrap.js).
 */
export default function Sidebar({ colapsado, abierto, onNavegar, onToggleColapsado }) {
  const { rolActivo, rol, usuario, logout } = useAuth();
  const bloques = MENU_POR_ROL[rolActivo] ?? [];
  const contadores = contadoresMenu(usuario?.id);
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
    <aside
      id="sidebar-aquaseleccion"
      className={[
        'aqua-sidebar offcanvas-lg offcanvas-start flex-column',
        colapsado ? 'collapsed' : '',
        abierto ? 'show' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Menu de navegacion por modulo"
    >
      {/* Perfil del usuario activo */}
      <div className="sidebar-profile border-bottom">
        <div className="dropdown position-relative w-100" ref={menuRef}>
          <button
            className="btn sidebar-profile-btn w-100 d-flex align-items-center gap-2"
            type="button"
            onClick={() => setMenuUsuarioAbierto((abiertoMenu) => !abiertoMenu)}
            aria-expanded={menuUsuarioAbierto}
            aria-haspopup="true"
            title={usuario?.nombre}
          >
            <span className="aqua-avatar">{iniciales(usuario?.nombre)}</span>
            {!colapsado && (
              <>
                <span className="d-flex flex-column text-start lh-sm flex-grow-1 overflow-hidden">
                  <span className="sidebar-footer-text fw-semibold text-truncate small">
                    {usuario?.nombre ?? 'Usuario'}
                  </span>
                  <span className="sidebar-footer-text text-muted-aqua text-truncate" style={{ fontSize: '0.72rem' }}>
                    {usuario?.unidad ?? rol.nombre}
                  </span>
                </span>
                <i
                  className={`bi ${menuUsuarioAbierto ? 'bi-chevron-up' : 'bi-chevron-down'} text-muted-aqua`}
                  aria-hidden="true"
                />
              </>
            )}
          </button>

          {menuUsuarioAbierto && (
            <div
              className="dropdown-menu dropdown-menu-end show position-absolute mt-2"
              style={{ right: 0, left: 'auto', minWidth: 240 }}
            >
              <div className="px-3 py-2 border-bottom">
                <p className="mb-0 fw-semibold small">{usuario?.nombre}</p>
                <p className="mb-1 text-muted-aqua" style={{ fontSize: '0.76rem' }}>
                  {usuario?.correo}
                </p>
                <span className={`badge badge-estado ${usuario?.estado === 'activo' ? 'badge-estado-activo' : 'badge-estado-inactivo'}`}>
                  {rol.nombre}
                </span>
              </div>
              <Link className="dropdown-item small" to={rol.rutaInicio ?? '/login'} onClick={onNavegar}>
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

      <div className="flex-grow-1 d-flex flex-column">
        {bloques.map((bloque) => (
          <nav key={bloque.titulo} className="d-flex flex-column py-2" aria-label={bloque.titulo}>
            <p className="sidebar-section-title mb-1">{bloque.titulo}</p>
            {bloque.items.map((item) => {
              const contador = contadores[`${rolActivo}${item.to}`];
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to.split('/').length === 3}
                  className="nav-link"
                  onClick={onNavegar}
                  title={item.label}
                  style={{ borderRadius: '999px' }}
                >
                  <i className={`bi bi-${item.icono}`} aria-hidden="true" />
                  <span>{item.label}</span>
                  {contador ? (
                    <span className="badge rounded-pill ms-auto">{contador}</span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>
        ))}
      </div>

      <div className="sidebar-footer">
        <button
          className="sidebar-collapse-btn d-none d-lg-flex"
          type="button"
          onClick={onToggleColapsado}
          aria-label={colapsado ? 'Desplegar menu lateral' : 'Plegar menu lateral'}
        >
          <i
            className={`bi ${colapsado ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar-inset-reverse'}`}
            aria-hidden="true"
          />
          <span className="sidebar-footer-text">{colapsado ? 'Desplegar menu' : 'Plegar menu'}</span>
        </button>

        <div className="sidebar-session">
          <span className="sidebar-session-icon">
            <i className={`bi bi-${rol.icono}`} aria-hidden="true" />
          </span>
          <span className="sidebar-session-text">
            <span className="sidebar-footer-text sidebar-session-label">Sesion activa</span>
            <span className="sidebar-footer-text sidebar-session-role text-capitalize">{rol.nombre}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
