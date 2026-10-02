import { NavLink } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.js';
import { contadoresMenu, MENU_POR_ROL } from '../../mock/menu.js';

/**
 * Sidebar
 * Navegacion rapida filtrada segun el rol activo del Contexto.
 * En escritorio se puede plegar a una barra de iconos; en movil se comporta
 * como offcanvas (controlado desde AppLayout, sin depender de bootstrap.js).
 */
export default function Sidebar({ colapsado, abierto, onNavegar }) {
  const { rolActivo, rol } = useAuth();
  const bloques = MENU_POR_ROL[rolActivo] ?? [];
  const contadores = contadoresMenu();

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

      <div className="sidebar-footer d-none d-lg-block">
        <div className="d-flex align-items-center gap-2">
          <i className={`bi bi-${rol.icono}`} aria-hidden="true" />
          <span className="sidebar-footer-text">
            Sesion activa
            <span className="d-block text-capitalize">{rol.nombre}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}