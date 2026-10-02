import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.js';
import { ROLES } from '../../mock/catalogoRoles.js';

/**
 * Login
 * Vista publica de acceso al monolito. En el MVP el submit no llama a la API:
 * usa AuthProvider.login() y redirige al modulo del rol seleccionado.
 */
export default function Login() {
  const [formulario, setFormulario] = useState({ correo: '', clave: '', rol: 'administrador', recordarme: true });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function actualizarCampo(evento) {
    const { name, value, type, checked } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : value }));
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    if (formulario.correo.trim() === '' || formulario.clave.trim() === '') {
      setError('Ingresa tu correo institucional y contrasena para continuar.');
      return;
    }
    setError('');
    const rol = login({ correo: formulario.correo, rol: formulario.rol });
    navigate(rol.rutaInicio, { replace: true });
  }

  function cargarCredencialesDemo(correo) {
    setFormulario((actual) => ({ ...actual, correo, clave: 'Aqua2026*' }));
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <div className="container py-5 flex-grow-1 d-flex align-items-center">
        <div className="row g-4 w-100 justify-content-center align-items-center">
          {/* Panel institucional */}
          <div className="col-lg-6">
            <div className="d-flex align-items-center gap-2 mb-4">
              <span className="aqua-brand-mark" aria-hidden="true">
                <i className="bi bi-water" />
              </span>
              <div className="d-flex flex-column lh-sm">
                <span className="fw-semibold text-aqua-primary">AquaChile</span>
                <small className="text-muted-aqua">AquaSeleccion</small>
              </div>
            </div>

            <h1 className="fw-semibold mb-3" style={{ fontSize: '1.9rem' }}>
              Sistema de Evaluaciones Psicologicas y Reclutamiento
            </h1>
            <p className="text-muted-aqua mb-4">
              Gestiona postulaciones externas e internas, solicitudes de evaluacion psicologica y la
              trazabilidad de cada etapa del proceso de seleccion.
            </p>

            <ul className="list-unstyled d-grid gap-3 mb-4">
              <li className="d-flex gap-3">
                <span className="stat-icon bg-tint-primary" style={{ width: 38, height: 38, flexBasis: 38, fontSize: '1rem' }} aria-hidden="true">
                  <i className="bi bi-file-earmark-person" />
                </span>
                <span>
                  <strong className="d-block small">Postulacion online</strong>
                  <span className="text-muted-aqua" style={{ fontSize: '0.82rem' }}>
                    Postientes externos cargan su CV en formato PDF.
                  </span>
                </span>
              </li>
              <li className="d-flex gap-3">
                <span className="stat-icon bg-tint-info" style={{ width: 38, height: 38, flexBasis: 38, fontSize: '1rem' }} aria-hidden="true">
                  <i className="bi bi-diagram-3" />
                </span>
                <span>
                  <strong className="d-block small">Movimiento interno</strong>
                  <span className="text-muted-aqua" style={{ fontSize: '0.82rem' }}>
                    Administradores postulan a colaboradores ya registrados.
                  </span>
                </span>
              </li>
              <li className="d-flex gap-3">
                <span className="stat-icon bg-tint-success" style={{ width: 38, height: 38, flexBasis: 38, fontSize: '1rem' }} aria-hidden="true">
                  <i className="bi bi-clipboard2-pulse" />
                </span>
                <span>
                  <strong className="d-block small">Evaluacion psicolaboral</strong>
                  <span className="text-muted-aqua" style={{ fontSize: '0.82rem' }}>
                    Psicologos asignados evaluan y registran su resultado.
                  </span>
                </span>
              </li>
            </ul>

            <Link to="/postular" className="btn btn-outline-aqua">
              <i className="bi bi-box-arrow-up-right me-1" aria-hidden="true" />
              Ir al portal publico de postulaciones
            </Link>
          </div>

          {/* Formulario */}
          <div className="col-lg-5">
            <div className="aqua-card">
              <div className="card-body p-4">
                <h2 className="h5 fw-semibold mb-1">Iniciar sesion</h2>
                <p className="text-muted-aqua small mb-4">
                  Acceso restringido a colaboradores autorizados de AquaChile.
                </p>

                <form className="aqua-form" onSubmit={manejarEnvio} noValidate>
                  {error && (
                    <div className="alert alert-danger py-2 small" role="alert">
                      <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label" htmlFor="correo">
                      Correo institucional
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0" aria-hidden="true">
                        <i className="bi bi-envelope" />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0"
                        id="correo"
                        name="correo"
                        placeholder="nombre.apellido@aquachile.cl"
                        value={formulario.correo}
                        onChange={actualizarCampo}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="clave">
                      Contrasena
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0" aria-hidden="true">
                        <i className="bi bi-lock" />
                      </span>
                      <input
                        type="password"
                        className="form-control border-start-0"
                        id="clave"
                        name="clave"
                        placeholder="Ingresa tu contrasena"
                        value={formulario.clave}
                        onChange={actualizarCampo}
                        autoComplete="current-password"
                        required
                      />
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="recordarme"
                          name="recordarme"
                          checked={formulario.recordarme}
                          onChange={actualizarCampo}
                        />
                        <label className="form-check-label small" htmlFor="recordarme">
                          Recordarme
                        </label>
                      </div>
                      <a href="#recuperar" className="small">
                        Olvidé mi contraseña
                      </a>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="rol">
                      Módulo a ingresar
                    </label>
                    <select
                      className="form-select"
                      id="rol"
                      name="rol"
                      value={formulario.rol}
                      onChange={actualizarCampo}
                    >
                      {ROLES.filter((rol) => rol.rutaInicio !== null).map((rol) => (
                        <option key={rol.clave} value={rol.clave}>
                          {rol.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      Maquetado: el selector determina el módulo que se abre al ingresar.
                    </div>
                  </div>

                  <button type="submit" className="btn btn-aqua w-100 py-2">
                    <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true" />
                    Iniciar Sesión
                  </button>
                </form>

                <div className="border-top mt-4 pt-3">
                  <p className="text-muted-aqua mb-2" style={{ fontSize: '0.76rem' }}>
                    Credenciales de prueba
                  </p>
                  <div className="d-flex flex-column gap-1">
                    <button
                      type="button"
                      className="btn btn-soft btn-sm text-start"
                      onClick={() => cargarCredencialesDemo('catalina.fuentes@aquachile.cl')}
                    >
                      <i className="bi bi-shield-lock me-2" aria-hidden="true" />
                      Administrador
                    </button>
                    <button
                      type="button"
                      className="btn btn-soft btn-sm text-start"
                      onClick={() => cargarCredencialesDemo('mariajose.rojas@aquachile.cl')}
                    >
                      <i className="bi bi-people me-2" aria-hidden="true" />
                      Analista de reclutamiento
                    </button>
                    <button
                      type="button"
                      className="btn btn-soft btn-sm text-start"
                      onClick={() => cargarCredencialesDemo('valentina.aravena@aquachile.cl')}
                    >
                      <i className="bi bi-clipboard2-pulse me-2" aria-hidden="true" />
                      Evaluador
                    </button>
                  </div>
                </div>

                <div className="alert alert-primary mt-4 mb-0 d-flex gap-2" role="note">
                  <i className="bi bi-info-circle" aria-hidden="true" />
                  <span className="small">
                    ¿Deseas postular a nuestras vacantes?{' '}
                    <Link to="/postular" className="alert-link fw-semibold">
                      Postula aquí
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="aqua-footer py-3">
        <div className="container d-flex flex-column flex-md-row justify-content-between gap-2">
          <span>&copy; {new Date().getFullYear()} AquaChile S.A. &middot; AquaSeleccion</span>
          <span>
            <Link to="/postular">Postular</Link> &middot; Soporte TI &middot; v0.1.0 (MVP)
          </span>
        </div>
      </footer>
    </div>
  );
}