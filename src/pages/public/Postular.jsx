import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { cargosPorFamilia } from '../../mock/cargos.js';

const ESTADO_INICIAL = {
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  correo: '',
  telefono: '',
  familia_id: '',
  cargo_id: '',
  linkedin: '',
  comentarios: '',
};

const TAMANO_MAXIMO_MB = 5;

/**
 * Postular
 * Formulario publico de postulacion externa. En el MVP valida en cliente,
 * muestra el resumen del registro y confirma el envío con un modal estatico;
 * la persistencia se implementara en el controlador PHP (POST /postulaciones).
 */
export default function Postular() {
  const grupos = useMemo(() => cargosPorFamilia(), []);
  const [formulario, setFormulario] = useState(ESTADO_INICIAL);
  const [cv, setCv] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);
  const inputArchivoRef = useRef(null);

  const cargosFamiliaSeleccionada = useMemo(() => {
    const grupo = grupos.find((item) => item.id === Number(formulario.familia_id));
    return grupo ? grupo.cargos : [];
  }, [grupos, formulario.familia_id]);

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: undefined }));
  }

  function seleccionarFamilia(evento) {
    setFormulario((actual) => ({
      ...actual,
      familia_id: evento.target.value,
      cargo_id: '',
    }));
    setErrores((actual) => ({ ...actual, familia_id: undefined, cargo_id: undefined }));
  }

  function validarArchivo(archivo) {
    if (!archivo) {
      setErrores((actual) => ({ ...actual, cv: 'Debes adjuntar tu curriculum en formato PDF.' }));
      return;
    }
    if (archivo.type !== 'application/pdf' && !archivo.name.toLowerCase().endsWith('.pdf')) {
      setErrores((actual) => ({ ...actual, cv: 'El archivo debe estar en formato PDF.' }));
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      setErrores((actual) => ({ ...actual, cv: `El archivo supera los ${TAMANO_MAXIMO_MB} MB permitidos.` }));
      return;
    }
    setCv(archivo);
    setErrores((actual) => ({ ...actual, cv: undefined }));
  }

  function manejarArchivo(evento) {
    validarArchivo(evento.target.files?.[0]);
  }

  function manejarSoltar(evento) {
    evento.preventDefault();
    setArrastrando(false);
    validarArchivo(evento.dataTransfer.files?.[0]);
  }

  function quitarArchivo() {
    setCv(null);
    if (inputArchivoRef.current) inputArchivoRef.current.value = '';
  }

  function validarFormulario() {
    const nuevosErrores = {};
    if (!formulario.nombres.trim()) nuevosErrores.nombres = 'Ingresa tus nombres.';
    if (!formulario.apellido_paterno.trim()) nuevosErrores.apellido_paterno = 'Ingresa tu apellido paterno.';
    if (!formulario.apellido_materno.trim()) nuevosErrores.apellido_materno = 'Ingresa tu apellido materno.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formulario.correo)) nuevosErrores.correo = 'Ingresa un correo valido.';
    if (!/^\+?56?\s?9?\s?\d{4}\s?\d{4}$/.test(formulario.telefono.replace(/\s/g, '')) && formulario.telefono.replace(/\D/g, '').length < 9)
      nuevosErrores.telefono = 'Ingresa un telefono de contacto valido.';
    if (!formulario.familia_id) nuevosErrores.familia_id = 'Selecciona la familia de cargo.';
    if (!formulario.cargo_id) nuevosErrores.cargo_id = 'Selecciona el cargo al que postulas.';
    if (!cv) nuevosErrores.cv = 'Debes adjuntar tu curriculum en formato PDF.';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    if (validarFormulario()) setEnviado(true);
  }

  const cargoSeleccionado = cargosFamiliaSeleccionada.find((cargo) => cargo.id === Number(formulario.cargo_id));

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--aqua-surface)' }}>
      {/* Barra superior del portal publico */}
      <header className="bg-white border-bottom py-2" style={{ borderColor: 'var(--aqua-border)' }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <div className="d-flex align-items-center gap-3">
              <span className="aqua-brand-mark" aria-hidden="true">
                <i className="bi bi-water" />
              </span>
              <span className="badge rounded-pill bg-tint-info px-3 py-2 fw-semibold">
                Portal Oficial de Convocatorias
              </span>
            </div>
            <Link to="/login" className="btn btn-soft btn-sm d-inline-flex align-items-center gap-2">
              <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
              <span>Acceso Funcionarios / Login</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-4 flex-grow-1">
        {/* Hero */}
        <section className="aqua-hero rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden">
          <div
            className="position-absolute rounded-circle"
            style={{ width: 320, height: 320, right: -60, top: -110, background: 'rgba(0,105,115,0.35)', filter: 'blur(70px)' }}
            aria-hidden="true"
          />
          <div className="position-relative" style={{ maxWidth: 720 }}>
            <span className="badge rounded-pill mb-3 px-3 py-2 text-uppercase" style={{ backgroundColor: 'rgba(208,228,255,0.2)', color: '#d0e4ff', letterSpacing: '0.08em' }}>
              <i className="bi bi-clock me-1" aria-hidden="true" />
              Proceso Abierto Temporada 2025
            </span>
            <h1 className="h2 fw-bold mb-2">Portal de Empleo y Selección de Talentos AquaChile</h1>
            <p className="lead fw-light mb-4" style={{ fontSize: '1rem' }}>
              Únete a nuestro equipo líder en la industria acuícola nacional e internacional. Cultivamos
              excelencia, sustentabilidad e innovación austral.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge rounded-pill fw-normal px-3 py-2 d-inline-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#eaf1ff' }}>
                <i className="bi bi-water text-info" aria-hidden="true" /> Sustentabilidad Marina
              </span>
              <span className="badge rounded-pill fw-normal px-3 py-2 d-inline-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#eaf1ff' }}>
                <i className="bi bi-gear" aria-hidden="true" /> Tecnología de Punta
              </span>
              <span className="badge rounded-pill fw-normal px-3 py-2 d-inline-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#eaf1ff' }}>
                <i className="bi bi-arrow-left-right" aria-hidden="true" /> Carrera y Bienestar Austral
              </span>
            </div>
          </div>
        </section>

        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            {/* Tarjeta del formulario */}
            <div className="aqua-card p-4 p-md-5 mb-4">
              <h2 className="visually-hidden">Formulario de postulación</h2>

              <form className="aqua-form d-flex flex-column gap-4" onSubmit={manejarEnvio} noValidate>
                {/* Stepper / status track */}
                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ backgroundColor: 'rgba(239,244,255,0.6)' }}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge rounded-circle bg-aqua-primary" style={{ width: 24, height: 24, lineHeight: '16px' }}>1</span>
                    <span className="fw-semibold small text-aqua-primary">Identificación</span>
                  </div>
                  <span className="text-muted" style={{ letterSpacing: 2 }}>•••</span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge rounded-circle bg-aqua-primary" style={{ width: 24, height: 24, lineHeight: '16px' }}>2</span>
                    <span className="fw-semibold small text-aqua-primary">Postulación</span>
                  </div>
                  <span className="text-muted" style={{ letterSpacing: 2 }}>•••</span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge rounded-circle bg-aqua-primary" style={{ width: 24, height: 24, lineHeight: '16px' }}>3</span>
                    <span className="fw-semibold small text-aqua-primary">CV &amp; Validación</span>
                  </div>
                </div>

                {/* Sección 1: Datos Personales */}
                <section>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="rounded-2 d-inline-flex align-items-center justify-content-center bg-tint-primary" style={{ width: 30, height: 30 }}>
                      <i className="bi bi-person" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="h6 fw-semibold mb-0">Sección 1: Datos Personales</h3>
                      <p className="small text-muted-aqua mb-0">Ingresa tu identificación según tu cédula de identidad.</p>
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="nombres">
                        Nombres completos <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errores.nombres ? 'is-invalid' : ''}`}
                        id="nombres"
                        name="nombres"
                        value={formulario.nombres}
                        onChange={actualizarCampo}
                        placeholder="Ej. Camila Andrea"
                        required
                      />
                      {errores.nombres && <div className="invalid-feedback">{errores.nombres}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="apellido_paterno">
                        Apellido paterno <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errores.apellido_paterno ? 'is-invalid' : ''}`}
                        id="apellido_paterno"
                        name="apellido_paterno"
                        value={formulario.apellido_paterno}
                        onChange={actualizarCampo}
                        placeholder="Ej. Contreras"
                        required
                      />
                      {errores.apellido_paterno && <div className="invalid-feedback">{errores.apellido_paterno}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="apellido_materno">
                        Apellido materno <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errores.apellido_materno ? 'is-invalid' : ''}`}
                        id="apellido_materno"
                        name="apellido_materno"
                        value={formulario.apellido_materno}
                        onChange={actualizarCampo}
                        placeholder="Ej. Muñoz"
                        required
                      />
                      {errores.apellido_materno && <div className="invalid-feedback">{errores.apellido_materno}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="correo">
                        Correo electrónico <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
                        id="correo"
                        name="correo"
                        value={formulario.correo}
                        onChange={actualizarCampo}
                        placeholder="nombre.apellido@correo.cl"
                        required
                      />
                      {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="telefono">
                        Teléfono móvil <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                        id="telefono"
                        name="telefono"
                        value={formulario.telefono}
                        onChange={actualizarCampo}
                        placeholder="+56 9 1234 5678"
                        required
                      />
                      {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="linkedin">
                        LinkedIn (opcional)
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id="linkedin"
                        name="linkedin"
                        value={formulario.linkedin}
                        onChange={actualizarCampo}
                        placeholder="https://www.linkedin.com/in/..."
                      />
                    </div>
                  </div>
                </section>

                {/* Sección 2: Selección de Vacante */}
                <section>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="rounded-2 d-inline-flex align-items-center justify-content-center bg-tint-primary" style={{ width: 30, height: 30 }}>
                      <i className="bi bi-briefcase" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="h6 fw-semibold mb-0">Sección 2: Selección de Vacante y Área</h3>
                      <p className="small text-muted-aqua mb-0">Selecciona el área productiva y el cargo de tu interés.</p>
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="familia_id">
                        Familia de cargo <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${errores.familia_id ? 'is-invalid' : ''}`}
                        id="familia_id"
                        name="familia_id"
                        value={formulario.familia_id}
                        onChange={seleccionarFamilia}
                        required
                      >
                        <option value="">Seleccione una familia</option>
                        {grupos.map((grupo) => (
                          <option key={grupo.id} value={grupo.id}>
                            {grupo.nombre}
                          </option>
                        ))}
                      </select>
                      {errores.familia_id && <div className="invalid-feedback">{errores.familia_id}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="cargo_id">
                        Cargo al que postula <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${errores.cargo_id ? 'is-invalid' : ''}`}
                        id="cargo_id"
                        name="cargo_id"
                        value={formulario.cargo_id}
                        onChange={actualizarCampo}
                        disabled={!formulario.familia_id}
                        required
                      >
                        <option value="">{formulario.familia_id ? 'Seleccione un cargo' : 'Elija primero la familia'}</option>
                        {cargosFamiliaSeleccionada.map((cargo) => (
                          <option key={cargo.id} value={cargo.id}>
                            {cargo.nombre} ({cargo.vacantes} vacantes)
                          </option>
                        ))}
                      </select>
                      {errores.cargo_id && <div className="invalid-feedback">{errores.cargo_id}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="comentarios">
                        Comentarios (opcional)
                      </label>
                      <textarea
                        className="form-control"
                        id="comentarios"
                        name="comentarios"
                        rows={3}
                        value={formulario.comentarios}
                        onChange={actualizarCampo}
                        placeholder="Cuéntanos brevemente tu experiencia en el sector salmonicultor"
                      />
                    </div>

                    {cargoSeleccionado && (
                      <div className="col-12">
                        <div className="p-3 rounded-3 bg-tint-info d-flex align-items-center gap-2">
                          <i className="bi bi-geo-alt" aria-hidden="true" />
                          <span className="small">
                            <strong>{cargoSeleccionado.nombre}</strong> &middot; Jornada: {cargoSeleccionado.jornada}{' '}
                            &middot; Vacantes disponibles: {cargoSeleccionado.vacantes}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Sección 3: Antecedentes Curriculares */}
                <section>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="rounded-2 d-inline-flex align-items-center justify-content-center bg-tint-primary" style={{ width: 30, height: 30 }}>
                      <i className="bi bi-cloud-arrow-up" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="h6 fw-semibold mb-0">Sección 3: Antecedentes Curriculares</h3>
                      <p className="small text-muted-aqua mb-0">Adjunta tu Currículum Vitae actualizado en formato PDF.</p>
                    </div>
                  </div>

                  <div
                    className={`aqua-dropzone ${arrastrando ? 'is-dragover' : ''}`}
                    onDragOver={(evento) => {
                      evento.preventDefault();
                      setArrastrando(true);
                    }}
                    onDragLeave={() => setArrastrando(false)}
                    onDrop={manejarSoltar}
                    onClick={() => inputArchivoRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(evento) => {
                      if (evento.key === 'Enter' || evento.key === ' ') inputArchivoRef.current?.click();
                    }}
                  >
                    <span className="rounded-circle bg-white shadow-sm d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                      <i className="bi bi-cloud-arrow-up fs-4 text-aqua-primary" aria-hidden="true" />
                    </span>
                    {cv ? (
                      <>
                        <p className="mb-1 fw-semibold text-break">{cv.name}</p>
                        <p className="text-muted-aqua mb-0" style={{ fontSize: '0.8rem' }}>
                          {(cv.size / 1024).toFixed(0)} KB &middot; haz clic para reemplazar el archivo
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="fw-semibold mb-1">Arrastra y suelta tu archivo PDF aquí</p>
                        <p className="text-muted-aqua mb-0" style={{ fontSize: '0.8rem' }}>
                          o haz clic para explorar en tu dispositivo (máximo {TAMANO_MAXIMO_MB} MB)
                        </p>
                      </>
                    )}
                    <input
                      ref={inputArchivoRef}
                      type="file"
                      className="d-none"
                      accept="application/pdf,.pdf"
                      onChange={manejarArchivo}
                      aria-label="Adjuntar Curriculum Vitae en PDF"
                    />
                  </div>
                  {errores.cv && <div className="text-danger mt-2" style={{ fontSize: '0.8rem' }}>{errores.cv}</div>}
                  {cv && (
                    <div className="d-flex align-items-center justify-content-between p-3 rounded-3 mt-2" style={{ backgroundColor: 'var(--aqua-surface-alt)' }}>
                      <div className="d-flex align-items-center gap-2">
                        <span className="rounded d-inline-flex align-items-center justify-content-center bg-tint-danger" style={{ width: 36, height: 36 }}>
                          <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                        </span>
                        <div>
                          <div className="fw-semibold small text-break">{cv.name}</div>
                          <div className="text-muted-aqua" style={{ fontSize: '0.78rem' }}>
                            {(cv.size / 1024).toFixed(0)} KB &middot; listo para enviar
                          </div>
                        </div>
                      </div>
                      <button type="button" className="btn btn-link text-muted p-0" onClick={quitarArchivo} title="Eliminar archivo">
                        <i className="bi bi-x-lg" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </section>

                {/* Sección 4: Consentimiento */}
                <section>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="rounded-2 d-inline-flex align-items-center justify-content-center bg-tint-primary" style={{ width: 30, height: 30 }}>
                      <i className="bi bi-shield-check" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="h6 fw-semibold mb-0">Sección 4: Consentimiento Informado y Tratamiento de Datos</h3>
                      <p className="small text-muted-aqua mb-0">Declaraciones legales obligatorias bajo la legislación chilena vigente.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-3" style={{ backgroundColor: 'rgba(239,244,255,0.7)' }}>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="autorizacion" defaultChecked required />
                      <label className="form-check-label small" htmlFor="autorizacion">
                        Autorizo expresamente a <strong>Empresas AquaChile S.A.</strong> para tratar y almacenar mis
                        datos personales y antecedentes laborales con fines de postulación, evaluación psicométrica y
                        eventual contratación, conforme a la <strong>Ley N° 19.628</strong>.
                      </label>
                    </div>
                  </div>
                </section>

                {/* Envío */}
                <div className="d-flex flex-column gap-2 pt-2">
                  <button type="submit" className="btn btn-aqua btn-lg w-100 d-flex align-items-center justify-content-center gap-2">
                    <span>Enviar Postulación Oficial</span>
                    <i className="bi bi-arrow-right" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-soft"
                    onClick={() => {
                      setFormulario(ESTADO_INICIAL);
                      setCv(null);
                      setErrores({});
                    }}
                  >
                    <i className="bi bi-arrow-counterclockwise me-1" aria-hidden="true" />
                    Limpiar formulario
                  </button>
                  <p className="text-center text-muted-aqua mt-1 mb-0" style={{ fontSize: '0.76rem' }}>
                    Al pulsar &quot;Enviar Postulación Oficial&quot;, recibirás un correo de confirmación con tu
                    código de seguimiento único.
                  </p>
                </div>
              </form>
            </div>

            {/* Panel informativo */}
            <div className="aqua-card mb-4">
              <div className="card-header">
                <i className="bi bi-info-circle me-2" aria-hidden="true" />
                ¿Cómo funciona el proceso?
              </div>
              <div className="card-body">
                <div className="aqua-timeline">
                  <div className="aqua-timeline-item">
                    <p className="mb-1 fw-semibold small">1. Postulación</p>
                    <p className="mb-0 text-muted-aqua" style={{ fontSize: '0.8rem' }}>
                      Envías tus datos y tu CV en PDF por este formulario.
                    </p>
                  </div>
                  <div className="aqua-timeline-item">
                    <p className="mb-1 fw-semibold small">2. Revisión curricular</p>
                    <p className="mb-0 text-muted-aqua" style={{ fontSize: '0.8rem' }}>
                      Un analista de reclutamiento valida tu postulación.
                    </p>
                  </div>
                  <div className="aqua-timeline-item">
                    <p className="mb-1 fw-semibold small">3. Entrevista con RH</p>
                    <p className="mb-0 text-muted-aqua" style={{ fontSize: '0.8rem' }}>
                      Entrevista breve con el equipo de Personas.
                    </p>
                  </div>
                  <div className="aqua-timeline-item pb-0">
                    <p className="mb-1 fw-semibold small">4. Evaluación psicolaboral</p>
                    <p className="mb-0 text-muted-aqua" style={{ fontSize: '0.8rem' }}>
                      Un profesional psicólogo realiza la evaluación y registra el resultado.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="aqua-card mb-4">
              <div className="card-header">
                <i className="bi bi-building me-2" aria-hidden="true" />
                ¿Eres colaborador de AquaChile?
              </div>
              <div className="card-body">
                <p className="small text-muted-aqua mb-0">
                  ¿Ya eres colaborador de AquaChile? El movimiento interno se realiza por el equipo de
                  Personas, no por este formulario.
                </p>
                <Link to="/login" className="btn btn-outline-aqua btn-sm mt-3">
                  Ingresar con mi correo institucional
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="aqua-footer py-3">
        <div className="container d-flex flex-column flex-md-row justify-content-between gap-2">
          <span>&copy; {new Date().getFullYear()} AquaChile S.A. &middot; AquaSeleccion</span>
          <span>
            <Link to="/login">Acceso colaboradores</Link> &middot; Soporte TI &middot; v0.1.0 (MVP)
          </span>
        </div>
      </footer>

      {/* Modal de confirmacion de envio */}
      {enviado && (
        <>
          <div
            className="modal fade show d-block"
            id="postulacion-exitosa"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="postulacion-exitosa-titulo"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center p-4">
                  <span className="stat-icon bg-tint-success mx-auto mb-3" style={{ width: 60, height: 60, fontSize: '1.8rem' }} aria-hidden="true">
                    <i className="bi bi-check-lg" />
                  </span>
                  <h2 className="h5 fw-semibold mb-2" id="postulacion-exitosa-titulo">
                    Postulación registrada
                  </h2>
                  <p className="text-muted-aqua small mb-1">
                    Gracias, <strong>{formulario.nombres} {formulario.apellido_paterno}</strong>. Tu postulación
                    para <strong>{cargoSeleccionado?.nombre ?? 'el cargo seleccionado'}</strong> quedó registrada
                    con estado pendiente.
                  </p>
                  <p className="text-muted-aqua small mb-0">
                    Enviaremos la confirmacion a <strong>{formulario.correo}</strong>.
                  </p>
                </div>
                <div className="modal-footer justify-content-center border-0 pt-0">
                  <Link to="/postular" className="btn btn-soft">
                    Registrar otra postulación
                  </Link>
                  <Link to="/login" className="btn btn-aqua">
                    Iniciar sesión
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
}
