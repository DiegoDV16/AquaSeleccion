import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.js';
import { obtenerRol } from '../../mock/catalogoRoles.js';
import { USUARIOS } from '../../mock/usuarios.js';

const CLAVE_DEMO = 'Aqua2026*';

/**
 * Cuentas de prueba del MVP: el rol se deduce del correo, por eso se listan
 * las credenciales reales de los mocks y no un selector de modulo. Al migrar a
 * MySQL + PHP este bloque se elimina y queda solo el formulario corporativo.
 */
const CUENTAS_DEMO = [
  { correo: 'catalina.fuentes@aquachile.cl', icono: 'shield-lock', tinte: 'primary' },
  { correo: 'mariajose.rojas@aquachile.cl', icono: 'people', tinte: 'info' },
  { correo: 'valentina.aravena@aquachile.cl', icono: 'clipboard2-pulse', tinte: 'success' },
].map((cuenta) => {
  const usuario = USUARIOS.find((registrado) => registrado.correo === cuenta.correo);
  return { ...cuenta, nombre: usuario.nombre, rol: obtenerRol(usuario.rol_id).nombre };
});

/**
 * Login
 * Vista publica de acceso al monolito. En el MVP el submit no llama a la API:
 * usa AuthProvider.login(), que busca el usuario por correo y redirige al
 * modulo que corresponde a su rol. No hay selector de modulo: para entrar a otro
 * modulo hay que iniciar sesion con otra cuenta.
 */
export default function Login() {
  const [formulario, setFormulario] = useState({ correo: '', clave: '', recordarme: true });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function actualizarCampo(evento) {
    const { name, value, type, checked } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : value }));
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');
    const resultado = login({ correo: formulario.correo, clave: formulario.clave });

    if (!resultado.ok) {
      setError(resultado.mensaje);
      return;
    }

    navigate(resultado.rol.rutaInicio, { replace: true });
  }

  function cargarCredencialesDemo(correo) {
    setFormulario((actual) => ({ ...actual, correo, clave: CLAVE_DEMO }));
    setError('');
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

                  <div className="mb-4">
                    <button type="submit" className="btn btn-aqua w-100 py-2">
                      <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true" />
                      Iniciar Sesión
                    </button>
                    <p className="text-muted-aqua mt-2 mb-0 text-center" style={{ fontSize: '0.76rem' }}>
                      El módulo se abre automáticamente según el rol asignado a tu cuenta.
                    </p>
                  </div>
                </form>

                <div className="border-top mt-4 pt-3">
                  <p className="mb-2">
                    <span className="etiqueta-aqua">Cuentas de prueba</span>
                  </p>
                  <p className="text-muted-aqua mb-2" style={{ fontSize: '0.76rem' }}>
                    Selecciona una cuenta para cargar sus credenciales y ver su módulo.
                  </p>
                  <div className="d-flex flex-column gap-2">
                    {CUENTAS_DEMO.map((cuenta) => (
                      <button
                        key={cuenta.correo}
                        type="button"
                        className="demo-account"
                        style={{ '--demo-accent': `var(--aqua-solid-${cuenta.tinte})` }}
                        onClick={() => cargarCredencialesDemo(cuenta.correo)}
                      >
                        <span className="demo-avatar" aria-hidden="true">
                          <i className={`bi bi-${cuenta.icono}`} />
                        </span>
                        <span className="flex-grow-1">
                          <span className="demo-name">
                            {cuenta.nombre} · {cuenta.rol}
                          </span>
                          <span className="demo-mail">{cuenta.correo}</span>
                        </span>
                        <i className="bi bi-arrow-right-circle text-muted-aqua" aria-hidden="true" />
                      </button>
                    ))}
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