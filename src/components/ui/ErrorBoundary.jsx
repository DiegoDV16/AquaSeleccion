import { Component } from 'react';

/**
 * ErrorBoundary
 * Evita que un error de renderizado deje la aplicacion completamente en blanco.
 * Muestra una salida de emergencia con opcion de recargar o volver al login.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Error de interfaz en AquaSeleccion', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-3">
          <div className="aqua-card" style={{ maxWidth: 520, width: '100%' }}>
            <div className="card-body text-center p-4">
              <span
                className="stat-icon bg-tint-danger d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: 56, height: 56, fontSize: '1.5rem' }}
                aria-hidden="true"
              >
                <i className="bi bi-exclamation-triangle" />
              </span>
              <h1 className="h5 fw-semibold mb-2">No se pudo cargar la interfaz</h1>
              <p className="text-muted-aqua small mb-4">
                Ocurrio un error inesperado. Recarga la pagina; si el problema continua, vuelve a iniciar
                sesion.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-aqua btn-sm"
                  onClick={() => window.location.reload()}
                >
                  <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
                  Recargar pagina
                </button>
                <button
                  type="button"
                  className="btn btn-soft btn-sm"
                  onClick={() => {
                    window.location.href = '/login';
                  }}
                >
                  <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true" />
                  Ir al login
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
