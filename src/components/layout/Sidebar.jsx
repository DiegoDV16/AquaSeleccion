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
  const { rolActivo, rol, usuario } = useAuth();
  const bloques = MENU_POR_ROL[rolActivo] ?? [];
  const contadores = contadoresMenu(usuario?.id);

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
      {/* Encabezado de marca, estilo chrome de Stitch */}
      <div
        className="d-flex align-items-center gap-2 px-3 py-3 border-bottom"
        style={{ borderColor: 'var(--aqua-border, #d3e4fe)' }}
      >
        <span className="aqua-brand-mark" aria-hidden="true">
          <i className="bi bi-water" />
        </span>
        {!colapsado && (
          <span className="d-flex flex-column lh-sm">
            <span className="fw-bold" style={{ color: '#0e3a5d', fontSize: '0.95rem' }}>
              Talento AquaChile
            </span>
            <small className="text-muted-aqua" style={{ fontSize: '0.68rem' }}>
              Sistema de Gestion de Talento
            </small>
          </span>
        )}
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
