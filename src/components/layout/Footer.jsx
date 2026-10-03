import { Link } from 'react-router-dom';

/** Footer corporativo comun a los modulos internos del monolito. */
export default function Footer() {
  return (
    <footer className="aqua-footer py-3 mt-auto border-top" style={{ backgroundColor: '#fff', borderColor: 'var(--aqua-border, #d3e4fe)', fontSize: '0.78rem', color: '#5b6572' }}>
      <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <span>
          &copy; {new Date().getFullYear()} AquaChile S.A. &middot; AquaSeleccion - Sistema de Evaluaciones
          Psicologicas y Reclutamiento
        </span>
        <span className="d-flex align-items-center gap-3">
          <Link to="/postular">Postular</Link>
          <span aria-hidden="true">&middot;</span>
          <span>Soporte TI</span>
          <span aria-hidden="true">&middot;</span>
          <span>v0.1.0 (MVP)</span>
        </span>
      </div>
    </footer>
  );
}