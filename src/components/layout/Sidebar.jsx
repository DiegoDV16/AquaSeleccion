import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.js';
import { MENU_POR_ROL } from '../../mock/menu.js';
import { contarSolicitudes } from '../../services/solicitudesApi.js';

/**
 * Sidebar
 * Navegacion rapida filtrada segun el rol activo del Contexto.
 * Los contadores se consultan al backend en cada cambio de ruta para no
 * depender de los datos simulados.
 */
export default function Sidebar({ colapsado, abierto, onNavegar, onToggleColapsado }) {
  const { rolActivo } = useAuth();
  const location = useLocation();
  const bloques = MENU_POR_ROL[rolActivo] ?? [];
  const [contadores, setContadores] = useState({});

  useEffect(() => {
    let vigente = true;

    if (rolActivo !== 'analista' && rolActivo !== 'evaluador') {
      setContadores({});
      return () => {
        vigente = false;
      };
    }

    contarSolicitudes().then((datos) => {
      if (vigente && datos?.ok) {
        setContadores(datos.contadores ?? {});
      }
    });

    return () => {
      vigente = false;
    };
  }, [rolActivo, location.pathname]);

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
      <button
        type="button"
        className="sidebar-collapse-toggle d-none d-lg-inline-flex"
        onClick={onToggleColapsado}
        aria-label={colapsado ? 'Expandir menu lateral' : 'Plegar menu lateral'}
        aria-expanded={!colapsado}
        aria-controls="sidebar-aquaseleccion"
      >
        <i className={`bi ${colapsado ? 'bi-chevron-right' : 'bi-chevron-left'}`} aria-hidden="true" />
      </button>

      <div className="flex-grow-1 d-flex flex-column">
        {bloques.map((bloque) => (
          <nav key={bloque.titulo} className="d-flex flex-column py-2" aria-label={bloque.titulo}>
            <p className="sidebar-section-title mb-1">{bloque.titulo}</p>
            {bloque.items.map((item) => {
              const claveContador =
                item.to === '/analista/solicitudes'
                  ? 'solicitudes'
                  : item.to === '/evaluador/mis-solicitudes'
                    ? 'misSolicitudes'
                    : null;
              const contador = claveContador ? contadores[claveContador] : 0;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to.split('/').length === 3}
                  className="nav-link"
                  onClick={onNavegar}
                  aria-label={item.label}
                  data-tooltip={colapsado ? item.label : undefined}
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
    </aside>
  );
}
