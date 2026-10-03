import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.js';

/** Vista mostrada cuando un rol intenta abrir un modulo que no le corresponde. */
export default function SinPermisos() {
  const { rol, usuario } = useAuth();
  const location = useLocation();
  const solicitado = location.state?.solicitado;

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f8f9ff' }}>
      <div className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="aqua-card text-center w-100" style={{ maxWidth: 620 }}>
          <div className="card-body p-5">
            <span className="d-inline-flex align-items-center justify-content-center rounded-3 mb-4" style={{ width: 56, height: 56, backgroundColor: '#eff4ff', border: '1px solid #d3e4fe' }} aria-hidden="true">
              <i className="bi bi-water" style={{ color: '#0e3a5d', fontSize: '1.5rem' }} />
            </span>
            <span className="stat-icon bg-tint-danger mx-auto mb-3 d-flex" style={{ width: 62, height: 62, fontSize: '1.8rem' }} aria-hidden="true">
              <i className="bi bi-shield-lock" />
            </span>
            <h1 className="h5 fw-semibold mb-2" style={{ color: '#00243f' }}>Acceso restringido</h1>
            <p className="text-muted-aqua small mb-1">
              {rol ? (
                <>
                  Tu sesión activa con rol <strong>{rol.nombre}</strong>
                  {usuario ? ` (${usuario.nombre})` : ''} no tiene permiso para abrir este módulo.
                </>
              ) : (
                'Necesitas iniciar sesión para abrir este módulo.'
              )}
            </p>
            {solicitado && (
              <p className="text-muted-aqua small mb-3">
                Ruta solicitada: <code>{solicitado}</code>
              </p>
            )}
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
              {rol?.rutaInicio && (
                <Link to={rol.rutaInicio} className="btn btn-aqua btn-sm">
                  Ir a mi módulo
                </Link>
              )}
              <Link to="/login" className="btn btn-soft btn-sm">
                <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />
                Iniciar sesión con otra cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}