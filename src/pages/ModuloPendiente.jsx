import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.js';

/**
 * Marcador de posicion de las vistas que se incorporan en cada rama feature.
 * Se elimina al cerrar el ultimo modulo (feature/modulo-evaluador).
 */
export default function ModuloPendiente({ modulo = 'Este modulo' }) {
  const { rol } = useAuth();

  return (
    <div className="aqua-card">
      <div className="card-body text-center py-5">
        <span
          className="stat-icon bg-tint-warning mx-auto mb-3"
          style={{ width: 60, height: 60, fontSize: '1.7rem' }}
          aria-hidden="true"
        >
          <i className="bi bi-cone-striped" />
        </span>
        <h1 className="h5 fw-semibold mb-2">{modulo} en construccion</h1>
        <p className="text-muted-aqua small mb-3">
          Esta vista se incorpora en la rama <code>feature/</code> correspondiente a su modulo.
        </p>
        <p className="text-muted-aqua small mb-0">
          Rol activo: <strong>{rol.nombre}</strong>
        </p>
      </div>
    </div>
  );
}