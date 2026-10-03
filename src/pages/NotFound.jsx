import { Link, useLocation } from 'react-router-dom';

import { ROLES } from '../mock/catalogoRoles.js';

/** Vista 404 del monolito. */
export default function NotFound() {
  const location = useLocation();

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f8f9ff' }}>
      <div className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="aqua-card text-center w-100" style={{ maxWidth: 640 }}>
          <div className="card-body p-5">
            <span className="d-inline-flex align-items-center justify-content-center rounded-3 mb-4" style={{ width: 56, height: 56, backgroundColor: '#eff4ff', border: '1px solid #d3e4fe' }} aria-hidden="true">
              <i className="bi bi-water" style={{ color: '#0e3a5d', fontSize: '1.5rem' }} />
            </span>
            <p className="display-6 fw-bold mb-1" style={{ color: '#0e3a5d' }}>404</p>
            <h1 className="h5 fw-semibold mb-2" style={{ color: '#00243f' }}>Página no encontrada</h1>
            <p className="text-muted-aqua small mb-4">
              La ruta <code>{location.pathname}</code> no existe en el sistema.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
              <Link to="/login" className="btn btn-aqua btn-sm">
                Iniciar sesión
              </Link>
              <Link to="/postular" className="btn btn-outline-aqua btn-sm">
                Postular
              </Link>
            </div>
            <p className="text-muted-aqua mb-2" style={{ fontSize: '0.8rem' }}>
              Módulos disponibles
            </p>
            <ul className="list-unstyled d-flex flex-wrap justify-content-center gap-3 mb-0">
              {ROLES.filter((rol) => rol.rutaInicio !== null).map((rol) => (
                <li key={rol.clave}>
                  <Link to={rol.rutaInicio} className="small">
                    <i className={`bi bi-${rol.icono} me-1`} aria-hidden="true" />
                    {rol.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}