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
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f8f9ff' }}>
      <div className="container py-4 py-lg-5 flex-grow-1 d-flex align-items-center">
        <div className="row g-0 w-100 shadow-lg rounded-4 overflow-hidden" style={{ minHeight: '680px', backgroundColor: '#fff' }}>
          {/* Panel izquierdo: identidad corporativa */}
          <div className="col-lg-5 aqua-hero p-4 p-lg-5 d-flex flex-column justify-content-between position-relative">
            <div className="position-absolute rounded-circle" style={{ width: 320, height: 320, right: -80, bottom: -80, background: 'rgba(129, 240, 255, 0.08)' }} aria-hidden="true" />
            <div className="position-absolute rounded-circle" style={{ width: 380, height: 380, top: -120, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0, 57, 101, 0.35)' }} aria-hidden="true" />

            <div className="position-relative" style={{ zIndex: 1 }}>
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className="d-inline-flex align-items-center justify-content-center bg-white rounded-3 shadow-sm" style={{ width: 42, height: 42 }} aria-hidden="true">
                  <i className="bi bi-water text-primary" style={{ fontSize: '1.4rem' }} />
                </span>
                <span className="d-flex flex-column lh-sm">
                  <span className="fw-semibold text-uppercase" style={{ letterSpacing: '0.08em', color: '#81f0ff', fontSize: '0.95rem' }}>AquaChile</span>
                  <small className="text-uppercase" style={{ letterSpacing: '0.18em', color: '#d3e4fe', fontSize: '0.68rem' }}>Talento &amp; Selección</small>
                </span>
              </div>

              <p className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-1 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#90f1ff', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#81f0ff' }} aria-hidden="true" />
                Acuicultura Sustentable de Clase Mundial
              </p>

              <h1 className="mb-3" style={{ fontSize: '1.75rem', lineHeight: 1.25 }}>
                Sistema de Evaluaciones Psicológicas y Reclutamiento
              </h1>
              <p className="lead" style={{ fontSize: '0.95rem', maxWidth: '22rem' }}>
                Gestionamos capacidades críticas, evaluaciones psicométricas avanzadas y trayectorias
                profesionales en el ecosistema marítimo del sur austral.
              </p>
            </div>

            <div className="position-relative mt-4 pt-4" style={{ zIndex: 1, borderTop: '1px solid rgba(211, 228, 254, 0.25)' }}>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <div className="rounded-3 p-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <span className="fw-bold d-block" style={{ fontSize: '1.35rem', color: '#90f1ff' }}>+5.000</span>
                    <small className="text-uppercase" style={{ letterSpacing: '0.1em', color: '#d3e4fe', fontSize: '0.66rem' }}>Colaboradores Activos</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="rounded-3 p-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <span className="fw-bold d-block" style={{ fontSize: '1.35rem', color: '#90f1ff' }}>100%</span>
                    <small className="text-uppercase" style={{ letterSpacing: '0.1em', color: '#d3e4fe', fontSize: '0.66rem' }}>Trazabilidad Ética</small>
                  </div>
                </div>
              </div>
              <small className="text-uppercase d-block mb-2" style={{ letterSpacing: '0.16em', color: '#d3e4fe', fontSize: '0.68rem' }}>Estándares y Certificaciones</small>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge rounded-pill fw-normal" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#d3e4fe' }}>
                  <i className="bi bi-patch-check me-1" style={{ color: '#90f1ff' }} aria-hidden="true" />ASC Certified
                </span>
                <span className="badge rounded-pill fw-normal" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#d3e4fe' }}>
                  <i className="bi bi-shield me-1" style={{ color: '#90f1ff' }} aria-hidden="true" />BAP 4-Star
                </span>
                <span className="badge rounded-pill fw-normal" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#d3e4fe' }}>
                  <i className="bi bi-award me-1" style={{ color: '#90f1ff' }} aria-hidden="true" />GlobalGAP
                </span>
              </div>
            </div>
          </div>

          {/* Panel derecho: acceso */}
          <div className="col-lg-7 bg-white p-4 p-lg-5 d-flex flex-column justify-content-center">
            <div className="w-100 mx-auto" style={{ maxWidth: 480 }}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <span className="d-inline-flex align-items-center justify-content-center rounded-3" style={{ width: 48, height: 48, backgroundColor: '#eff4ff', border: '1px solid #d3e4fe' }} aria-hidden="true">
                  <i className="bi bi-water" style={{ color: '#0e3a5d', fontSize: '1.3rem' }} />
                </span>
                <span>
                  <h2 className="h5 fw-semibold mb-0" style={{ color: '#00243f' }}>Acceso Plataforma</h2>
                  <small className="text-uppercase fw-semibold" style={{ letterSpacing: '0.12em', color: '#006973', fontSize: '0.7rem' }}>Talento &amp; Selección Corporativa</small>
                </span>
              </div>

              <p className="text-muted-aqua mb-4">
                Ingresa tus credenciales corporativas autorizadas{' '}
                <strong style={{ color: '#0e3a5d' }}>@aquachile.cl</strong> para acceder al entorno evaluativo.
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
                    Correo Institucional
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
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label mb-1" htmlFor="clave">
                      Contraseña
                    </label>
                    <a href="#recuperar" className="small">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0" aria-hidden="true">
                      <i className="bi bi-lock" />
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0"
                      id="clave"
                      name="clave"
                      placeholder="Ingresa tu contraseña"
                      value={formulario.clave}
                      onChange={actualizarCampo}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <div className="form-check mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="recordarme"
                      name="recordarme"
                      checked={formulario.recordarme}
                      onChange={actualizarCampo}
                    />
                    <label className="form-check-label small" htmlFor="recordarme">
                      Recordar sesión en este equipo seguro
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <button type="submit" className="btn btn-aqua w-100 py-2">
                    Iniciar Sesión
                    <i className="bi bi-box-arrow-in-right ms-2" aria-hidden="true" />
                  </button>
                  <p className="text-muted-aqua mt-2 mb-0 text-center" style={{ fontSize: '0.76rem' }}>
                    El módulo se abre automáticamente según el rol asignado a tu cuenta.
                  </p>
                </div>
              </form>

              <div className="border-top pt-3">
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

              {/* Tarjeta Portal de Empleo */}
              <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: '#eff4ff', border: '1px solid #d3e4fe' }}>
                <div className="d-flex gap-3">
                  <span className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: 38, height: 38, backgroundColor: '#d3e4fe', color: '#00243f' }} aria-hidden="true">
                    <i className="bi bi-briefcase" />
                  </span>
                  <div>
                    <h3 className="h6 fw-semibold mb-1" style={{ color: '#00243f' }}>
                      ¿Deseas trabajar con nosotros?
                    </h3>
                    <p className="text-muted-aqua small mb-2">
                      Postula a nuestras vacantes operativas, técnicas y ejecutivas a lo largo de Chile.
                    </p>
                    <Link to="/postular" className="small fw-semibold text-decoration-none" style={{ color: '#006973' }}>
                      Ir a Portal de Empleos Externo
                      <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="border-top mt-4 pt-3 d-flex flex-column flex-sm-row justify-content-between gap-2 text-muted-aqua" style={{ fontSize: '0.76rem' }}>
                <span>&copy; {new Date().getFullYear()} AquaChile S.A. &middot; Plataforma ATS Corporativa</span>
                <span>
                  <Link to="/postular" className="text-decoration-none">Postular</Link> &middot; Soporte TI &middot; v0.1.0 (MVP)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
