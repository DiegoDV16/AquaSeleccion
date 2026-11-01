import { useEffect, useMemo, useRef, useState } from 'react';

import PageHeader from '../../components/ui/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.js';

const ESTADO_INICIAL = {
  fechaSolicitud: '',
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correo: '',
  telefono: '',
  idFamiliaCargo: '',
  idCargo: '',
  observaciones: '',
};

const TAMANO_MAXIMO_MB = 5;
const LARGO_MAXIMO_CURRICULUM = 255;
const LARGO_MAXIMO_OBSERVACIONES = 500;
const EXTENSIONES_CV_PERMITIDAS = ['pdf', 'doc', 'docx'];

function obtenerFechaLocal() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

/**
 * AdminPostularInterno
 * El administrador registra manualmente la postulacion interna de un trabajador.
 * El formulario envia los datos por POST y el backend guarda el candidato
 * asociado al usuario administrador de la sesion.
 */
export default function AdminPostularInterno() {
  const { usuario } = useAuth();
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
  const cargoSeleccionado = cargosFamiliaSeleccionada.find((cargo) => cargo.id === Number(formulario.idCargo));

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
      setErrores((actual) => ({ ...actual, cv: 'Adjunta el currículum del trabajador en PDF o Word.' }));
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
    setErrores((actual) => ({ ...actual, cv: undefined }));
  }

  function validarFormulario() {
    const nuevosErrores = {};
    if (!formulario.nombres.trim()) nuevosErrores.nombres = 'Ingresa los nombres.';
    if (!formulario.apellidoPaterno.trim()) nuevosErrores.apellidoPaterno = 'Ingresa el apellido paterno.';
    if (!formulario.apellidoMaterno.trim()) nuevosErrores.apellidoMaterno = 'Ingresa el apellido materno.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formulario.correo)) nuevosErrores.correo = 'Ingresa un correo válido.';
    if (
      !/^\+?56?\s?9?\s?\d{4}\s?\d{4}$/.test(formulario.telefono.replace(/\s/g, ''))
      && formulario.telefono.replace(/\D/g, '').length < 9
    ) {
      nuevosErrores.telefono = 'Ingresa un teléfono de contacto válido.';
    }
    if (!formulario.idFamiliaCargo) nuevosErrores.idFamiliaCargo = 'Selecciona la familia de cargo.';
    if (!formulario.idCargo) nuevosErrores.idCargo = 'Selecciona el cargo destino.';
    if (formulario.observaciones.length > LARGO_MAXIMO_OBSERVACIONES) {
      nuevosErrores.observaciones = `Las observaciones no pueden superar los ${LARGO_MAXIMO_OBSERVACIONES} caracteres.`;
    }
    if (!cv) nuevosErrores.cv = 'Adjunta el currículum del trabajador en PDF o Word.';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function manejarEnvio(evento) {
    if (!validarFormulario()) evento.preventDefault();
  }

  function limpiarFormulario() {
    setFormulario({ ...ESTADO_INICIAL, fechaSolicitud: obtenerFechaLocal() });
    setCv(null);
    setErrores({});
    if (inputArchivoRef.current) inputArchivoRef.current.value = '';
  }

  return (
    <>
      <PageHeader
        etiqueta="Módulo Administrador"
        titulo="Postulación interna"
        descripcion="Registra la postulación de un trabajador de AquaChile a un nuevo cargo."
      />

      <div className="row g-4 align-items-start">
        <div className="col-lg-8">
          <div className="aqua-card">
            <div className="card-header">
              <i className="bi bi-person-plus me-2" aria-hidden="true" />
              Datos de la postulación interna
            </div>
            <div className="card-body p-3 p-md-4">
              <form
                className="aqua-form interna-form d-flex flex-column"
                method="POST"
                action="http://localhost/AquaSeleccion/backend/config/c_candidato.php"
                encType="multipart/form-data"
                onSubmit={manejarEnvio}
                noValidate
              >
                <input type="hidden" name="idUsuario" value={usuario?.id ?? ''} />
                <section className="aqua-form-section">
                  <div className="interna-section-head">
                    <span className="interna-section-icon">
                      <i className="bi bi-person" aria-hidden="true" />
                    </span>
                    <div>
                      <h3>Datos del trabajador</h3>
                      <p>Ingresa los datos personales del trabajador que postula.</p>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="fechaSolicitud">Fecha de solicitud</label>
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
                        placeholder="nombre.apellido@aquachile.cl"
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

                <section className="aqua-form-section">
                  <div className="interna-section-head">
                    <span className="interna-section-icon">
                      <i className="bi bi-briefcase" aria-hidden="true" />
                    </span>
                    <div>
                      <h3>Cargo destino</h3>
                      <p>Selecciona el área y el cargo al que postula el trabajador.</p>
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
                          <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
                        ))}
                      </select>
                      {errores.idFamiliaCargo && <div className="invalid-feedback">{errores.idFamiliaCargo}</div>}
                      {errorCatalogos && <div className="text-danger small mt-1">{errorCatalogos}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="idCargo">
                        Cargo destino <span className="text-danger">*</span>
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
                          <option key={cargo.id} value={cargo.id}>{cargo.nombre}</option>
                        ))}
                      </select>
                      {errores.idCargo && <div className="invalid-feedback">{errores.idCargo}</div>}
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

                <section className="aqua-form-section">
                  <div className="interna-section-head">
                    <span className="interna-section-icon">
                      <i className="bi bi-chat-left-text" aria-hidden="true" />
                    </span>
                    <div>
                      <h3>Observaciones</h3>
                      <p>Agrega antecedentes o comentarios sobre esta postulación.</p>
                    </div>
                  </div>

                  <label className="form-label" htmlFor="observaciones">Observaciones</label>
                  <textarea
                    className={`form-control ${errores.observaciones ? 'is-invalid' : ''}`}
                    id="observaciones"
                    name="observaciones"
                    rows={4}
                    maxLength={LARGO_MAXIMO_OBSERVACIONES}
                    value={formulario.observaciones}
                    onChange={actualizarCampo}
                    placeholder="Ej. El trabajador cuenta con experiencia previa en el cargo, solicita turno diurno, etc."
                  />
                  <div className="d-flex justify-content-between gap-2 mt-1">
                    <div className="form-text">Campo opcional, máximo {LARGO_MAXIMO_OBSERVACIONES} caracteres.</div>
                    <div className="interna-counter">
                      {formulario.observaciones.length}/{LARGO_MAXIMO_OBSERVACIONES}
                    </div>
                  </div>
                  {errores.observaciones && <div className="invalid-feedback d-block">{errores.observaciones}</div>}
                </section>

                <section className="aqua-form-section">
                  <div className="interna-section-head">
                    <span className="interna-section-icon">
                      <i className="bi bi-cloud-arrow-up" aria-hidden="true" />
                    </span>
                    <div>
                      <h3>Currículum</h3>
                      <p>Adjunta el currículum en PDF o Word (.doc, .docx).</p>
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
                        <p className="fw-semibold mb-1">Arrastra y suelta el currículum aquí</p>
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
                      aria-label="Adjuntar currículum en PDF o Word"
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

                <div className="interna-footer">
                  <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-end gap-2">
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
                    >
                      <i className="bi bi-send-fill" aria-hidden="true" />
                      <span>Registrar postulación interna</span>
                      <i className="bi bi-arrow-right" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4 interna-aside">
          <div className="aqua-card interna-aside-card">
            <div className="card-header">
              <i className="bi bi-clipboard-check me-2" aria-hidden="true" />
              Resumen del registro
            </div>
            <div className="card-body">
              <div className="interna-responsable">
                <span className="interna-avatar">
                  <i className="bi bi-person-badge" aria-hidden="true" />
                </span>
                <div>
                  <div className="text-uppercase small text-muted-aqua fw-semibold" style={{ letterSpacing: '0.05em' }}>
                    Responsable
                  </div>
                  <div className="fw-semibold">{usuario?.nombre ?? 'Administrador'}</div>
                </div>
              </div>

              <hr className="my-3" />

              <div className="small d-grid gap-2">
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-muted-aqua">Tipo</span>
                  <span className="fw-semibold text-end">Postulación interna</span>
                </div>
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-muted-aqua">Registro</span>
                  <span className="fw-semibold text-end">Candidato</span>
                </div>
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-muted-aqua">Cargo destino</span>
                  <span className="fw-semibold text-end">{cargoSeleccionado?.nombre ?? 'Sin definir'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center gap-3">
                  <span className="text-muted-aqua">Currículum</span>
                  <span className={`badge-estado ${cv ? 'badge-estado-activo' : 'badge-estado-pendiente'}`}>
                    {cv ? 'Adjunto' : 'Pendiente'}
                  </span>
                </div>
              </div>

              <hr className="my-3" />

              <h4 className="h6 fw-semibold mb-2">Consideraciones</h4>
              <ul className="interna-list">
                <li>
                  <i className="bi bi-check-circle" aria-hidden="true" />
                  <span>Completa los datos personales del trabajador que postula.</span>
                </li>
                <li>
                  <i className="bi bi-check-circle" aria-hidden="true" />
                  <span>Selecciona la familia y el cargo destino.</span>
                </li>
                <li>
                  <i className="bi bi-check-circle" aria-hidden="true" />
                  <span>El currículum es obligatorio y debe ser PDF o Word.</span>
                </li>
                <li>
                  <i className="bi bi-check-circle" aria-hidden="true" />
                  <span>El registro se guardará como candidato en la base de datos.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
