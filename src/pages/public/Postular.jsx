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
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Encabezado del portal publico */}
      <header className="aqua-hero py-4">
        <div className="container">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <span className="aqua-brand-mark" aria-hidden="true">
                <i className="bi bi-water" />
              </span>
              <div className="d-flex flex-column lh-sm">
                <span className="fw-semibold fs-5">Portal de Postulaciones AquaChile</span>
                <small className="text-white-50">Oportunidades laborales en salmonicultura y plantas industriales</small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-outline-light btn-sm">
                <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true" />
                Acceso colaboradores
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-5 flex-grow-1">
        <div className="row g-4">
          {/* Formulario */}
          <div className="col-lg-8">
            <div className="aqua-card">
              <div className="card-body p-4">
                <h1 className="h4 fw-semibold mb-1">Formulario de postulación</h1>
                <p className="text-muted-aqua small mb-4">
                  Completa tus datos y adjunta tu curriculum en PDF. Recibiras la confirmación en el
                  correo indicado.
                </p>

                <form className="aqua-form" onSubmit={manejarEnvio} noValidate>
                  <fieldset className="mb-4">
                    <legend className="h6 fw-semibold mb-3">
                      <span className="badge bg-aqua-primary me-2">1</span>
                      Datos personales
                    </legend>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label" htmlFor="nombres">
                          Nombres <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errores.nombres ? 'is-invalid' : ''}`}
                          id="nombres"
                          name="nombres"
                          value={formulario.nombres}
                          onChange={actualizarCampo}
                          placeholder="Martina Andrea"
                          required
                        />
                        {errores.nombres && <div className="invalid-feedback">{errores.nombres}</div>}
                      </div>

                      <div className="col-md-4">
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
                          placeholder="Contreras"
                          required
                        />
                        {errores.apellido_paterno && <div className="invalid-feedback">{errores.apellido_paterno}</div>}
                      </div>

                      <div className="col-md-4">
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
                          placeholder="Muniz"
                          required
                        />
                        {errores.apellido_materno && <div className="invalid-feedback">{errores.apellido_materno}</div>}
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="mb-4">
                    <legend className="h6 fw-semibold mb-3">
                      <span className="badge bg-aqua-primary me-2">2</span>
                      Contacto
                    </legend>
                    <div className="row g-3">
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
                          Teléfono <span className="text-danger">*</span>
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
                  </fieldset>

                  <fieldset className="mb-4">
                    <legend className="h6 fw-semibold mb-3">
                      <span className="badge bg-aqua-primary me-2">3</span>
                      Vacante a postular
                    </legend>
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
                          placeholder="Cuentanos brevemente tu experiencia en el sector salmonicultor"
                        />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="mb-4">
                    <legend className="h6 fw-semibold mb-3">
                      <span className="badge bg-aqua-primary me-2">4</span>
                      Currículum Vitae
                    </legend>
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
                      <i className="bi bi-paperclip d-block" aria-hidden="true" />
                      {cv ? (
                        <>
                          <p className="mb-1 fw-semibold text-break">{cv.name}</p>
                          <p className="text-muted-aqua mb-0" style={{ fontSize: '0.8rem' }}>
                            {(cv.size / 1024).toFixed(0)} KB &middot; haz clic para reemplazar el archivo
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="fw-semibold mb-1">Arrastra tu CV o haz clic para buscarlo</p>
                          <p className="text-muted-aqua mb-0" style={{ fontSize: '0.8rem' }}>
                            Formato PDF, maximo {TAMANO_MAXIMO_MB} MB
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
                      <button type="button" className="btn btn-soft btn-sm mt-2" onClick={quitarArchivo}>
                        <i className="bi bi-x-circle me-1" aria-hidden="true" />
                        Quitar archivo
                      </button>
                    )}
                  </fieldset>

                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" id="autorizacion" defaultChecked required />
                    <label className="form-check-label small" htmlFor="autorizacion">
                      Autorizo a AquaChile a tratar mis datos personales para los fines de este proceso
                      de seleccion.
                    </label>
                  </div>

                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <button type="submit" className="btn btn-aqua px-4">
                      <i className="bi bi-send me-1" aria-hidden="true" />
                      Enviar postulación
                    </button>
                    <button
                      type="button"
                      className="btn btn-soft px-4"
                      onClick={() => {
                        setFormulario(ESTADO_INICIAL);
                        setCv(null);
                        setErrores({});
                      }}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1" aria-hidden="true" />
                      Limpiar formulario
                    </button>
                  </div>

                  <p className="text-muted-aqua mt-3 mb-0" style={{ fontSize: '0.76rem' }}>
                    Maquetado: los campos marcados con * son obligatorios. El envio no persiste datos
                    hasta conectar el controlador PHP.
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* Panel informativo */}
          <div className="col-lg-4">
            <div className="aqua-card mb-3">
              <div className="card-header">
                <i className="bi bi-info-circle me-2" aria-hidden="true" />
                Como funciona el proceso
              </div>
              <div className="card-body">
                <div className="aqua-timeline">
                  <div className="aqua-timeline-item">
                    <p className="mb-1 fw-semibold small">1. Postulación</p>
                    <p className="mb-0 text-muted-aqua" style={{ fontSize: '0.8rem' }}>
                      Envias tus datos y tu CV en PDF por este formulario.
                    </p>
                  </div>
                  <div className="aqua-timeline-item">
                    <p className="mb-1 fw-semibold small">2. Revision curricular</p>
                    <p className="mb-0 text-muted-aqua" style={{ fontSize: '0.8rem' }}>
                      Un analista de reclutamiento valida tu postulacion.
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
                      Un profesional psicologo realiza la evaluacion y registra el resultado.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {cargoSeleccionado && (
              <div className="aqua-card mb-3">
                <div className="card-header">
                  <i className="bi bi-briefcase me-2" aria-hidden="true" />
                  Vacante seleccionada
                </div>
                <div className="card-body">
                  <h2 className="h6 fw-semibold mb-2">{cargoSeleccionado.nombre}</h2>
                  <p className="text-muted-aqua small mb-0">
                    Jornada: {cargoSeleccionado.jornada}
                    <br />
                    Vacantes disponibles: {cargoSeleccionado.vacantes}
                  </p>
                </div>
              </div>
            )}

            <div className="aqua-card">
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