import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import ConfirmacionModal from '../../components/ui/ConfirmacionModal.jsx';
import { crearPostulacionPublica } from '../../services/candidatosApi.js';

const ESTADO_INICIAL = {
  fechaSolicitud: '',
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correo: '',
  telefono: '',
  idFamiliaCargo: '',
  idCargo: '',
  comentarios: '',
  autorizacion: false,
  curriculumCv: '',
};

const TAMANO_MAXIMO_MB = 5;
const LARGO_MAXIMO_CURRICULUM = 255;
const LARGO_MAXIMO_COMENTARIOS = 500;
const EXTENSIONES_CV_PERMITIDAS = ['pdf', 'doc', 'docx'];

function obtenerFechaLocal() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

/**
 * Postular
 * Formulario publico de postulacion externa con validacion en cliente y envio POST.
 */
export default function Postular() {
  const [grupos, setGrupos] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [errorCatalogos, setErrorCatalogos] = useState('');
  const [formulario, setFormulario] = useState(() => ({
    ...ESTADO_INICIAL,
    fechaSolicitud: obtenerFechaLocal(),
  }));
  const [cv, setCv] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const inputArchivoRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarCatalogos() {
      try {
        const respuesta = await fetch(
          'http://localhost/AquaSeleccion/backend/config/c_listaCargosDisponibles.php',
          { signal: controller.signal },
        );
        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.ok || !Array.isArray(resultado.familias)) {
          throw new Error(resultado.mensaje || 'No se pudieron cargar las familias y cargos.');
        }

        setGrupos(resultado.familias);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setErrorCatalogos(error.message || 'No se pudieron cargar las familias y cargos.');
        }
      } finally {
        if (!controller.signal.aborted) setCargandoCatalogos(false);
      }
    }

    cargarCatalogos();
    return () => controller.abort();
  }, []);

  const cargosFamiliaSeleccionada = useMemo(() => {
    const grupo = grupos.find((item) => item.id === Number(formulario.idFamiliaCargo));
    return grupo ? grupo.cargos : [];
  }, [grupos, formulario.idFamiliaCargo]);

  const familiaCargoSeleccionada = grupos.find((item) => item.id === Number(formulario.idFamiliaCargo));
  const cargoSeleccionado = cargosFamiliaSeleccionada.find(
    (cargo) => cargo.id === Number(formulario.idCargo),
  );

  const datosPersonalesCompletos = ['nombres', 'apellidoPaterno', 'apellidoMaterno', 'correo', 'telefono'].every(
    (campo) => formulario[campo].trim() !== '',
  );
  const vacanteCompleta = Boolean(formulario.idFamiliaCargo && formulario.idCargo);
  const curriculumCompleto = Boolean(cv);
  const consentimientoCompleto = Boolean(formulario.autorizacion);
  const progreso = Math.round(
    ([datosPersonalesCompletos, vacanteCompleta, curriculumCompleto, consentimientoCompleto].filter(Boolean)
      .length /
      4) *
      100,
  );
  const pasoActual = !datosPersonalesCompletos ? 1 : !vacanteCompleta ? 2 : 3;
  const cantidadErrores = Object.values(errores).filter(Boolean).length;
  const nombreResumen = `${formulario.nombres} ${formulario.apellidoPaterno}`.trim();

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: undefined }));
  }

  function actualizarAutorizacion(evento) {
    setFormulario((actual) => ({ ...actual, autorizacion: evento.target.checked }));
    setErrores((actual) => ({ ...actual, autorizacion: undefined }));
  }

  function seleccionarFamilia(evento) {
    setFormulario((actual) => ({
      ...actual,
      idFamiliaCargo: evento.target.value,
      idCargo: '',
    }));
    setErrores((actual) => ({ ...actual, idFamiliaCargo: undefined, idCargo: undefined }));
  }

  function validarArchivo(archivo) {
    if (!archivo) {
      setErrores((actual) => ({ ...actual, cv: 'Adjunta tu currículum en formato PDF o Word.' }));
      return;
    }

    const extension = archivo.name.split('.').pop()?.toLowerCase();

    if (!EXTENSIONES_CV_PERMITIDAS.includes(extension)) {
      setErrores((actual) => ({ ...actual, cv: 'El archivo debe estar en formato PDF o Word (.doc o .docx).' }));
      return;
    }

    if (Array.from(archivo.name).length > LARGO_MAXIMO_CURRICULUM) {
      setErrores((actual) => ({
        ...actual,
        cv: `El nombre del archivo no puede superar los ${LARGO_MAXIMO_CURRICULUM} caracteres.`,
      }));
      return;
    }

    if (archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      setErrores((actual) => ({ ...actual, cv: `El archivo supera los ${TAMANO_MAXIMO_MB} MB permitidos.` }));
      return;
    }

    setCv(archivo);
    setFormulario((actual) => ({ ...actual, curriculumCv: archivo.name }));
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
    setFormulario((actual) => ({ ...actual, curriculumCv: '' }));
    if (inputArchivoRef.current) inputArchivoRef.current.value = '';
  }

  function validarFormulario() {
    const nuevosErrores = {};

    if (!formulario.nombres.trim()) nuevosErrores.nombres = 'Ingresa tus nombres.';
    if (!formulario.apellidoPaterno.trim()) nuevosErrores.apellidoPaterno = 'Ingresa tu apellido paterno.';
    if (!formulario.apellidoMaterno.trim()) nuevosErrores.apellidoMaterno = 'Ingresa tu apellido materno.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formulario.correo)) {
      nuevosErrores.correo = 'Ingresa un correo valido.';
    }
    if (
      !/^\+?56?\s?9?\s?\d{4}\s?\d{4}$/.test(formulario.telefono.replace(/\s/g, '')) &&
      formulario.telefono.replace(/\D/g, '').length < 9
    ) {
      nuevosErrores.telefono = 'Ingresa un telefono de contacto valido.';
    }
    if (!formulario.idFamiliaCargo) nuevosErrores.idFamiliaCargo = 'Selecciona la familia de cargo.';
    if (!formulario.idCargo) nuevosErrores.idCargo = 'Selecciona el cargo al que postulas.';
    if (!cv) nuevosErrores.cv = 'Adjunta tu currículum en formato PDF o Word.';
    if (!formulario.autorizacion) {
      nuevosErrores.autorizacion = 'Debes autorizar el tratamiento de tus datos para continuar.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();

    if (enviando || !validarFormulario()) return;

    setEnviando(true);

    const respuesta = await crearPostulacionPublica({
      fechaSolicitud: formulario.fechaSolicitud,
      nombres: formulario.nombres,
      apellidoPaterno: formulario.apellidoPaterno,
      apellidoMaterno: formulario.apellidoMaterno,
      correo: formulario.correo,
      telefono: formulario.telefono,
      idFamiliaCargo: formulario.idFamiliaCargo,
      idCargo: formulario.idCargo,
      observaciones: formulario.comentarios,
      autorizacion: formulario.autorizacion ? '1' : '',
      curriculumCv: cv,
    });

    setEnviando(false);

    if (!respuesta?.ok) {
      setResultado({
        tipo: 'error',
        titulo: 'No pudimos enviar tu postulación',
        mensaje: respuesta?.mensaje ?? 'Ocurrió un problema al enviar tus antecedentes. Inténtalo nuevamente.',
      });
      return;
    }

    setResultado({
      tipo: 'exito',
      titulo: 'Postulación enviada',
      mensaje: respuesta.mensaje,
    });
    limpiarFormulario();
  }

  function limpiarFormulario() {
    setFormulario({ ...ESTADO_INICIAL, fechaSolicitud: obtenerFechaLocal() });
    setCv(null);
    setErrores({});
    if (inputArchivoRef.current) inputArchivoRef.current.value = '';
  }

  return (
    <div className="public-page d-flex flex-column min-vh-100">
      <header className="public-header">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="public-brand">
              <span className="aqua-brand-mark aqua-logo-box" aria-hidden="true">
                <img src="/ImagenRedes_Aqua.webp" alt="" className="aqua-logo-img" />
              </span>
              <div>
                <span className="public-brand-title">AquaChile</span>
                <span className="public-brand-subtitle">Selección de Talento</span>
              </div>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="public-header-badge d-none d-sm-inline-flex">
                <i className="bi bi-shield-lock" aria-hidden="true" />
                Postulación segura
              </span>
              <Link
                to="/login"
                className="btn btn-soft btn-sm public-login-link d-inline-flex align-items-center gap-2"
              >
                <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
                Acceso funcionarios
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="public-main flex-grow-1 py-4 py-lg-5">
        <div className="container">
          <section className="public-hero mb-4">
            <div className="row align-items-center g-4 position-relative">
              <div className="col-lg-8">
                <span className="public-hero-badge">
                  <i className="bi bi-broadcast" aria-hidden="true" />
                  Convocatorias {new Date().getFullYear()}
                </span>
                <h1>Tu próximo desafío comienza en AquaChile</h1>
                <p className="public-hero-lead">
                  Forma parte de un equipo que cultiva excelencia, sustentabilidad e innovación en la industria
                  acuícola. Completa tu postulación y comienza tu camino con nosotros.
                </p>
                <div className="public-hero-chips">
                  <span>
                    <i className="bi bi-water" aria-hidden="true" /> Sustentabilidad marina
                  </span>
                  <span>
                    <i className="bi bi-gear" aria-hidden="true" /> Tecnología de punta
                  </span>
                  <span>
                    <i className="bi bi-people" aria-hidden="true" /> Desarrollo y bienestar
                  </span>
                </div>
              </div>

              <div className="col-lg-4 d-none d-lg-block">
                <div className="public-hero-note">
                  <span className="public-hero-note-icon">
                    <i className="bi bi-send-check" aria-hidden="true" />
                  </span>
                  <strong>Postulación 100% online</strong>
                  <p>Completa tus datos, adjunta tu currículum y envía tu postulación.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="row g-4 align-items-start">
            <div className="col-lg-8">
              <div className="public-form-card">
                <div className="public-form-head">
                  <div>
                    <span className="public-eyebrow">Formulario oficial</span>
                    <h2>Postula a AquaChile</h2>
                    <p>Completa tus datos de contacto, selecciona el cargo de interés y adjunta tu currículum.</p>
                  </div>
                  <span className="public-required-note">
                    <span aria-hidden="true">*</span> Campos obligatorios
                  </span>
                </div>

                <div className="public-progress">
                  <div className="public-progress-head">
                    <span>Progreso del formulario</span>
                    <strong>{progreso}%</strong>
                  </div>
                  <div
                    className="progress"
                    role="progressbar"
                    aria-label="Progreso del formulario"
                    aria-valuenow={progreso}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="progress-bar" style={{ width: `${progreso}%` }} />
                  </div>
                </div>

                <ol className="public-stepper" aria-label="Etapas del formulario de postulación">
                  {[
                    { numero: 1, titulo: 'Identificación', completo: datosPersonalesCompletos },
                    { numero: 2, titulo: 'Cargo de interés', completo: vacanteCompleta },
                    {
                      numero: 3,
                      titulo: 'CV y consentimiento',
                      completo: curriculumCompleto && consentimientoCompleto,
                    },
                  ].map((paso) => (
                    <li
                      key={paso.numero}
                      className={`public-step ${paso.completo ? 'is-complete' : ''} ${
                        paso.numero === pasoActual ? 'is-active' : ''
                      }`}
                    >
                      <span className="public-step-number">
                        {paso.completo ? <i className="bi bi-check-lg" aria-hidden="true" /> : paso.numero}
                      </span>
                      <span>{paso.titulo}</span>
                    </li>
                  ))}
                </ol>

                <form
                  id="formulario-postulacion"
                  className="aqua-form public-form"
                  onSubmit={manejarEnvio}
                  noValidate
                >
                  {cantidadErrores > 0 && (
                    <div className="alert alert-danger d-flex align-items-start gap-2" role="alert">
                      <i className="bi bi-exclamation-triangle-fill mt-1" aria-hidden="true" />
                      <div>
                        <strong>Revisa tu postulación.</strong>
                        <span className="d-block small">
                          Hay {cantidadErrores} {cantidadErrores === 1 ? 'campo que requiere' : 'campos que requieren'}{' '}
                          atención antes de enviar.
                        </span>
                      </div>
                    </div>
                  )}

                  <section className="public-section" aria-labelledby="datos-personales-titulo">
                    <div className="public-section-head">
                      <span className="public-section-number">1</span>
                      <div>
                        <h3 id="datos-personales-titulo">Datos personales</h3>
                        <p>Ingresa tu identificación y datos de contacto.</p>
                      </div>
                      {datosPersonalesCompletos && (
                        <span className="public-section-done">
                          <i className="bi bi-check-circle-fill" aria-hidden="true" /> Completo
                        </span>
                      )}
                    </div>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label" htmlFor="fechaSolicitud">
                          Fecha de postulación
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="fechaSolicitud"
                          name="fechaSolicitud"
                          value={formulario.fechaSolicitud}
                          readOnly
                        />
                        <div className="form-text">Se registra automáticamente.</div>
                      </div>

                      <div className="col-md-8">
                        <label className="form-label" htmlFor="nombres">
                          Nombres completos <span className="public-required">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errores.nombres ? 'is-invalid' : ''}`}
                          id="nombres"
                          name="nombres"
                          value={formulario.nombres}
                          onChange={actualizarCampo}
                          placeholder="Ej. Camila Andrea"
                          autoComplete="given-name"
                          maxLength={50}
                          required
                        />
                        {errores.nombres && <div className="invalid-feedback">{errores.nombres}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" htmlFor="apellidoPaterno">
                          Apellido paterno <span className="public-required">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errores.apellidoPaterno ? 'is-invalid' : ''}`}
                          id="apellidoPaterno"
                          name="apellidoPaterno"
                          value={formulario.apellidoPaterno}
                          onChange={actualizarCampo}
                          placeholder="Ej. Contreras"
                          autoComplete="family-name"
                          maxLength={25}
                          required
                        />
                        {errores.apellidoPaterno && <div className="invalid-feedback">{errores.apellidoPaterno}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" htmlFor="apellidoMaterno">
                          Apellido materno <span className="public-required">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errores.apellidoMaterno ? 'is-invalid' : ''}`}
                          id="apellidoMaterno"
                          name="apellidoMaterno"
                          value={formulario.apellidoMaterno}
                          onChange={actualizarCampo}
                          placeholder="Ej. Muñoz"
                          autoComplete="additional-name"
                          maxLength={25}
                          required
                        />
                        {errores.apellidoMaterno && <div className="invalid-feedback">{errores.apellidoMaterno}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" htmlFor="correo">
                          Correo electrónico <span className="public-required">*</span>
                        </label>
                        <input
                          type="email"
                          className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
                          id="correo"
                          name="correo"
                          value={formulario.correo}
                          onChange={actualizarCampo}
                          placeholder="nombre.apellido@correo.cl"
                          autoComplete="email"
                          inputMode="email"
                          maxLength={50}
                          required
                        />
                        {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" htmlFor="telefono">
                          Teléfono móvil <span className="public-required">*</span>
                        </label>
                        <input
                          type="tel"
                          className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                          id="telefono"
                          name="telefono"
                          value={formulario.telefono}
                          onChange={actualizarCampo}
                          placeholder="+56 9 1234 5678"
                          autoComplete="tel"
                          inputMode="tel"
                          maxLength={15}
                          required
                        />
                        {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
                      </div>
                    </div>
                  </section>

                  <section className="public-section" aria-labelledby="vacante-titulo">
                    <div className="public-section-head">
                      <span className="public-section-number">2</span>
                      <div>
                        <h3 id="vacante-titulo">Cargo de interés</h3>
                        <p>Selecciona el área y la posición a la que quieres postular.</p>
                      </div>
                      {vacanteCompleta && (
                        <span className="public-section-done">
                          <i className="bi bi-check-circle-fill" aria-hidden="true" /> Completo
                        </span>
                      )}
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="idFamiliaCargo">
                          Familia de cargo <span className="public-required">*</span>
                        </label>
                        <select
                          className={`form-select ${errores.idFamiliaCargo ? 'is-invalid' : ''}`}
                          id="idFamiliaCargo"
                          name="idFamiliaCargo"
                          value={formulario.idFamiliaCargo}
                          onChange={seleccionarFamilia}
                          disabled={cargandoCatalogos || Boolean(errorCatalogos)}
                          required
                        >
                          <option value="">
                            {cargandoCatalogos ? 'Cargando familias...' : 'Seleccione una familia'}
                          </option>
                          {grupos.map((grupo) => (
                            <option key={grupo.id} value={grupo.id}>
                              {grupo.nombre}
                            </option>
                          ))}
                        </select>
                        {errores.idFamiliaCargo && <div className="invalid-feedback">{errores.idFamiliaCargo}</div>}
                        {errorCatalogos && <div className="text-danger small mt-1">{errorCatalogos}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" htmlFor="idCargo">
                          Cargo al que postula <span className="public-required">*</span>
                        </label>
                        <select
                          className={`form-select ${errores.idCargo ? 'is-invalid' : ''}`}
                          id="idCargo"
                          name="idCargo"
                          value={formulario.idCargo}
                          onChange={actualizarCampo}
                          disabled={!formulario.idFamiliaCargo || cargandoCatalogos || Boolean(errorCatalogos)}
                          required
                        >
                          <option value="">
                            {formulario.idFamiliaCargo ? 'Seleccione un cargo' : 'Elija primero la familia'}
                          </option>
                          {cargosFamiliaSeleccionada.map((cargo) => (
                            <option key={cargo.id} value={cargo.id}>
                              {cargo.nombre}
                            </option>
                          ))}
                        </select>
                        {errores.idCargo && <div className="invalid-feedback">{errores.idCargo}</div>}
                      </div>

                      {cargoSeleccionado && (
                        <div className="col-12">
                          <div className="public-selection-note">
                            <i className="bi bi-geo-alt" aria-hidden="true" />
                            <span>
                              <strong>{cargoSeleccionado.nombre}</strong>
                              {familiaCargoSeleccionada && <> · {familiaCargoSeleccionada.nombre}</>}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="col-12">
                        <div className="public-label-row">
                          <label className="form-label mb-0" htmlFor="comentarios">
                            Comentarios <span className="text-muted-aqua fw-normal">(opcional)</span>
                          </label>
                          <span className="public-counter">
                            {formulario.comentarios.length}/{LARGO_MAXIMO_COMENTARIOS}
                          </span>
                        </div>
                        <textarea
                          className="form-control"
                          id="comentarios"
                          name="comentarios"
                          rows={3}
                          maxLength={LARGO_MAXIMO_COMENTARIOS}
                          value={formulario.comentarios}
                          onChange={actualizarCampo}
                          placeholder="Cuéntanos brevemente tu experiencia o motivación por este cargo"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="public-section" aria-labelledby="curriculum-titulo">
                    <div className="public-section-head">
                      <span className="public-section-number">3</span>
                      <div>
                        <h3 id="curriculum-titulo">Currículum</h3>
                        <p>Adjunta tu CV en PDF o Word. Tamaño máximo: {TAMANO_MAXIMO_MB} MB.</p>
                      </div>
                      {curriculumCompleto && (
                        <span className="public-section-done">
                          <i className="bi bi-check-circle-fill" aria-hidden="true" /> Completo
                        </span>
                      )}
                    </div>

                    <div
                      className={`public-dropzone ${arrastrando ? 'is-dragover' : ''} ${
                        errores.cv ? 'is-invalid' : ''
                      }`}
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
                        if (evento.key === 'Enter' || evento.key === ' ') {
                          evento.preventDefault();
                          inputArchivoRef.current?.click();
                        }
                      }}
                      aria-label={cv ? 'Reemplazar currículum adjunto' : 'Adjuntar currículum'}
                    >
                      <span className="public-dropzone-icon">
                        <i className={`bi ${cv ? 'bi-file-earmark-check' : 'bi-cloud-arrow-up'}`} aria-hidden="true" />
                      </span>
                      {cv ? (
                        <>
                          <p className="public-dropzone-title text-break">{cv.name}</p>
                          <p className="public-dropzone-help">
                            {(cv.size / 1024).toFixed(0)} KB · Haz clic para reemplazar el archivo
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="public-dropzone-title">Arrastra y suelta tu currículum aquí</p>
                          <p className="public-dropzone-help">o haz clic para explorar en tu dispositivo</p>
                        </>
                      )}
                      <input
                        ref={inputArchivoRef}
                        type="file"
                        className="d-none"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={manejarArchivo}
                        aria-label="Adjuntar Curriculum Vitae en PDF o Word"
                        name="curriculumCv"
                      />
                    </div>
                    {errores.cv && <div className="text-danger small mt-2">{errores.cv}</div>}
                    {cv && (
                      <div className="public-file-actions">
                        <span>
                          <i className="bi bi-check-circle-fill text-success" aria-hidden="true" /> Archivo listo para
                          enviar
                        </span>
                        <button type="button" className="btn btn-link btn-sm text-muted p-0" onClick={quitarArchivo}>
                          Quitar archivo
                        </button>
                      </div>
                    )}
                  </section>

                  <section className="public-section" aria-labelledby="consentimiento-titulo">
                    <div className="public-section-head">
                      <span className="public-section-number">4</span>
                      <div>
                        <h3 id="consentimiento-titulo">Consentimiento informado</h3>
                        <p>Autorización obligatoria para el tratamiento de tus datos personales.</p>
                      </div>
                      {consentimientoCompleto && (
                        <span className="public-section-done">
                          <i className="bi bi-check-circle-fill" aria-hidden="true" /> Completo
                        </span>
                      )}
                    </div>

                    <div className={`public-consent ${errores.autorizacion ? 'is-invalid' : ''}`}>
                      <div className="form-check">
                        <input
                          className={`form-check-input ${errores.autorizacion ? 'is-invalid' : ''}`}
                          type="checkbox"
                          id="autorizacion"
                          name="autorizacion"
                          value="1"
                          checked={formulario.autorizacion}
                          onChange={actualizarAutorizacion}
                          required
                        />
                        <label className="form-check-label" htmlFor="autorizacion">
                          Autorizo expresamente a <strong>Empresas AquaChile S.A.</strong> para tratar y almacenar mis
                          datos personales y antecedentes laborales con fines de postulación, evaluación psicolaboral y
                          eventual contratación, conforme a la <strong>Ley N° 19.628</strong>.
                        </label>
                      </div>
                      {errores.autorizacion && (
                        <div className="text-danger small mt-2">{errores.autorizacion}</div>
                      )}
                    </div>
                  </section>

                  <div className="public-submit-bar">
                    <p>
                      <i className="bi bi-shield-check" aria-hidden="true" />
                      Tus datos se tratan de forma confidencial y segura.
                    </p>
                    <div className="d-flex flex-column flex-sm-row gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                        onClick={limpiarFormulario}
                      >
                        <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
                        Limpiar campos
                      </button>
                      <button
                        type="submit"
                        className="btn btn-aqua d-flex align-items-center justify-content-center gap-2 px-4"
                        disabled={enviando}
                      >
                        {enviando ? (
                          <>
                            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send-fill" aria-hidden="true" />
                            Enviar postulación
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <aside className="col-lg-4">
              <div className="public-aside">
                <div className="public-side-card">
                  <div className="public-side-card-head">
                    <span>
                      <i className="bi bi-clipboard-check" aria-hidden="true" /> Resumen de tu postulación
                    </span>
                    <span className={`public-status ${progreso === 100 ? 'is-complete' : ''}`}>
                      {progreso === 100 ? 'Listo' : `${progreso}%`}
                    </span>
                  </div>
                  <div className="public-summary-list">
                    <div>
                      <span>Postulante</span>
                      <strong>{nombreResumen || 'Sin completar'}</strong>
                    </div>
                    <div>
                      <span>Correo</span>
                      <strong>{formulario.correo || 'Sin completar'}</strong>
                    </div>
                    <div>
                      <span>Cargo</span>
                      <strong>{cargoSeleccionado?.nombre || 'Sin seleccionar'}</strong>
                    </div>
                    <div>
                      <span>Currículum</span>
                      <strong>{cv ? 'Adjunto' : 'Pendiente'}</strong>
                    </div>
                  </div>
                </div>

                <div className="public-side-card">
                  <div className="public-side-card-head">
                    <span>
                      <i className="bi bi-check2-square" aria-hidden="true" /> Antes de enviar
                    </span>
                  </div>
                  <ul className="public-checklist">
                    <li>Currículum en PDF o Word, máximo 5 MB.</li>
                    <li>Correo y teléfono actualizados.</li>
                    <li>Consentimiento de tratamiento de datos aceptado.</li>
                  </ul>
                </div>

                <div className="public-side-card public-side-help">
                  <span className="public-side-help-icon">
                    <i className="bi bi-people-fill" aria-hidden="true" />
                  </span>
                  <h3>¿Eres colaborador de AquaChile?</h3>
                  <p>Los movimientos internos de cargo se gestionan con el equipo de Personas.</p>
                  <Link to="/login" className="btn btn-soft btn-sm w-100">
                    <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true" />
                    Acceso al portal interno
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <footer className="public-footer">
        <div className="container d-flex flex-column flex-md-row justify-content-between gap-2">
          <span>&copy; {new Date().getFullYear()} AquaChile S.A. · AquaSeleccion</span>
          <span>Proceso confidencial · Uso exclusivo para postulaciones</span>
        </div>
      </footer>

      {resultado && (
        <ConfirmacionModal
          visible
          titulo={resultado.titulo}
          icono={resultado.tipo === 'exito' ? 'check-lg' : 'exclamation-triangle'}
          tinte={resultado.tipo === 'exito' ? 'bg-tint-success' : 'bg-tint-danger'}
          acciones={[
            {
              etiqueta: resultado.tipo === 'exito' ? 'Cerrar' : 'Volver al formulario',
              variante: 'btn-aqua',
              onClick: () => setResultado(null),
            },
          ]}
        >
          <p className="mb-0">{resultado.mensaje}</p>
        </ConfirmacionModal>
      )}
    </div>
  );
}
