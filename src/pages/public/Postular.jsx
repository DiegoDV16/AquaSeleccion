import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

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
  curriculumCv: '',
};

const TAMANO_MAXIMO_MB = 5;
const LARGO_MAXIMO_CURRICULUM = 255;
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

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: undefined }));
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formulario.correo)) nuevosErrores.correo = 'Ingresa un correo valido.';
    if (!/^\+?56?\s?9?\s?\d{4}\s?\d{4}$/.test(formulario.telefono.replace(/\s/g, '')) && formulario.telefono.replace(/\D/g, '').length < 9)
      nuevosErrores.telefono = 'Ingresa un telefono de contacto valido.';
    if (!formulario.idFamiliaCargo) nuevosErrores.idFamiliaCargo = 'Selecciona la familia de cargo.';
    if (!formulario.idCargo) nuevosErrores.idCargo = 'Selecciona el cargo al que postulas.';
    if (!cv) nuevosErrores.cv = 'Adjunta tu currículum en formato PDF o Word.';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function manejarEnvio(evento) {
    if (!validarFormulario()) evento.preventDefault();
  }

  const cargoSeleccionado = cargosFamiliaSeleccionada.find((cargo) => cargo.id === Number(formulario.idCargo));

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--aqua-surface)' }}>
      {/* Barra superior del portal publico */}
      <header className="aqua-public-header py-2">
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
            <Link to="/login" className="btn btn-outline-light btn-sm d-inline-flex align-items-center gap-2">
              <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
              <span>Acceso Funcionarios / Login</span>
            </Link>
          </div>
        </div>
      </header>

      <main
        className="min-vh-100 flex-grow-1 py-5 px-3 px-md-4"
        style={{ background: 'linear-gradient(135deg, #02233f 0%, #0d4668 100%)' }}
      >
        <div className="container">
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

              <form
                className="aqua-form d-flex flex-column gap-4"
                method="POST"
                action="http://localhost/AquaSeleccion/backend/config/c_candidato.php"
                encType="multipart/form-data"
                onSubmit={manejarEnvio}
                noValidate
              >
                {/* Stepper / status track */}
                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ backgroundColor: 'var(--aqua-surface-alt)' }}>
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
                      <label className="form-label" htmlFor="fechaSolicitud">
                        Fecha de solicitud
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="fechaSolicitud"
                        name="fechaSolicitud"
                        value={formulario.fechaSolicitud}
                        readOnly
                      />
                    </div>

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
                      <label className="form-label" htmlFor="apellidoPaterno">
                        Apellido paterno <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errores.apellidoPaterno ? 'is-invalid' : ''}`}
                        id="apellidoPaterno"
                        name="apellidoPaterno"
                        value={formulario.apellidoPaterno}
                        onChange={actualizarCampo}
                        placeholder="Ej. Contreras"
                        required
                      />
                      {errores.apellidoPaterno && <div className="invalid-feedback">{errores.apellidoPaterno}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="apellidoMaterno">
                        Apellido materno <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errores.apellidoMaterno ? 'is-invalid' : ''}`}
                        id="apellidoMaterno"
                        name="apellidoMaterno"
                        value={formulario.apellidoMaterno}
                        onChange={actualizarCampo}
                        placeholder="Ej. Muñoz"
                        required
                      />
                      {errores.apellidoMaterno && <div className="invalid-feedback">{errores.apellidoMaterno}</div>}
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
                      <label className="form-label" htmlFor="idFamiliaCargo">
                        Familia de cargo <span className="text-danger">*</span>
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
                        Cargo al que postula <span className="text-danger">*</span>
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
                        <option value="">{formulario.idFamiliaCargo ? 'Seleccione un cargo' : 'Elija primero la familia'}</option>
                        {cargosFamiliaSeleccionada.map((cargo) => (
                          <option key={cargo.id} value={cargo.id}>
                            {cargo.nombre}
                          </option>
                        ))}
                      </select>
                      {errores.idCargo && <div className="invalid-feedback">{errores.idCargo}</div>}
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
                            <strong>{cargoSeleccionado.nombre}</strong>
                            {familiaCargoSeleccionada && <> &middot; {familiaCargoSeleccionada.nombre}</>}
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
                      <p className="small text-muted-aqua mb-0">Adjunta tu Currículum Vitae en PDF o Word (.doc, .docx).</p>
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
                        <p className="fw-semibold mb-1">Arrastra y suelta tu currículum aquí</p>
                        <p className="text-muted-aqua mb-0" style={{ fontSize: '0.8rem' }}>
                          o haz clic para explorar en tu dispositivo (máximo {TAMANO_MAXIMO_MB} MB)
                        </p>
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
                  {errores.cv && <div className="text-danger mt-2" style={{ fontSize: '0.8rem' }}>{errores.cv}</div>}
                  {cv && (
                    <div className="d-flex align-items-center justify-content-between p-3 rounded-3 mt-2" style={{ backgroundColor: 'var(--aqua-surface-alt)' }}>
                      <div className="d-flex align-items-center gap-2">
                        <span className="rounded d-inline-flex align-items-center justify-content-center bg-tint-danger" style={{ width: 36, height: 36 }}>
                          <i className="bi bi-file-earmark" aria-hidden="true" />
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
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="autorizacion"
                        name="autorizacion"
                        value="1"
                        defaultChecked
                        required
                      />
                      <label className="form-check-label small" htmlFor="autorizacion">
                        Autorizo expresamente a <strong>Empresas AquaChile S.A.</strong> para tratar y almacenar mis
                        datos personales y antecedentes laborales con fines de postulación, evaluación psicométrica y
                        eventual contratación, conforme a la <strong>Ley N° 19.628</strong>.
                      </label>
                    </div>
                  </div>
                </section>

                {/* Envío */}
                <div className="pt-3 mt-3 border-top">
                  <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                      onClick={() => {
                        setFormulario({ ...ESTADO_INICIAL, fechaSolicitud: obtenerFechaLocal() });
                        setCv(null);
                        setErrores({});
                        if (inputArchivoRef.current) inputArchivoRef.current.value = '';
                      }}
                    >
                      <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
                      Limpiar campos
                    </button>
                    <button
                      type="submit"
                      className="btn btn-aqua d-flex align-items-center justify-content-center gap-2 px-4"
                    >
                      <i className="bi bi-send-fill" aria-hidden="true" />
                      <span>Enviar formulario</span>
                      <i className="bi bi-arrow-right" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Panel informativo */}
            <div className="aqua-form-card mb-5 overflow-hidden">
              <div className="p-4 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                <div className="d-flex align-items-start gap-3">
                  <span className="rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, backgroundColor: 'var(--aqua-surface-alt)' }}>
                    <i className="bi bi-people-fill text-aqua-primary" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="h6 fw-semibold mb-1">¿Eres colaborador(a) de AquaChile?</h3>
                    <p className="mb-0 text-muted-aqua small">Los movimientos internos de cargo se realizan por el equipo de Personas, no por este formulario público.</p>
                  </div>
                </div>
                <Link to="/login" className="btn btn-aqua d-inline-flex align-items-center justify-content-center gap-2 px-3">
                  <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
                  <span>Acceso al portal de colaboradores</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>

      <footer className="aqua-footer py-3" style={{ backgroundColor: '#fff', borderTop: '1px solid var(--aqua-border)' }}>
        <div className="container d-flex flex-column flex-md-row justify-content-between gap-2">
          <span>&copy; {new Date().getFullYear()} AquaChile S.A. &middot; AquaSeleccion</span>
          <span>
            <Link to="/login">Acceso colaboradores</Link> &middot; Soporte TI &middot; v0.1.0 (MVP)
          </span>
        </div>
      </footer>

    </div>
  );
}
