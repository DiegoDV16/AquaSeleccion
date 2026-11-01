import { useEffect, useMemo, useRef, useState } from 'react';

import ConfirmacionModal from '../../components/ui/ConfirmacionModal.jsx';
import { crearCandidato } from '../../services/candidatosApi.js';
import { listarFamiliasCargos } from '../../services/catalogosApi.js';

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function fechaHoyLocal() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');

  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

const FORMULARIO_INICIAL = {
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correo: '',
  telefono: '',
  idFamiliaCargo: '',
  idCargo: '',
  observaciones: '',
  fecha_registro: fechaHoyLocal(),
};

/**
 * PostulacionInternaModal
 * Modal de alta de postulacion interna para el Administrador. Replica el
 * formulario del modulo Analista: fecha del sistema readonly, CV opcional y
 * guardado real en MySQL.
 */
export default function PostulacionInternaModal({ visible, onCerrar, onGuardado }) {
  const [formulario, setFormulario] = useState({ ...FORMULARIO_INICIAL, fecha_registro: fechaHoyLocal() });
  const [familias, setFamilias] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [errorCatalogos, setErrorCatalogos] = useState('');
  const [errores, setErrores] = useState({});
  const [errorFormulario, setErrorFormulario] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cv, setCv] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const inputCvRef = useRef(null);

  function cargarCatalogos() {
    setCargandoCatalogos(true);
    setErrorCatalogos('');

    listarFamiliasCargos()
      .then((datos) => {
        if (!datos?.ok) {
          setErrorCatalogos(datos?.mensaje ?? 'No se pudieron cargar las familias y cargos.');
          return;
        }

        setFamilias(datos.familias ?? []);
      })
      .finally(() => setCargandoCatalogos(false));
  }

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargosDisponibles = useMemo(() => {
    const familia = familias.find((item) => item.id === Number(formulario.idFamiliaCargo));

    return familia?.cargos ?? [];
  }, [familias, formulario.idFamiliaCargo]);

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

  function validarArchivoCv(archivo) {
    if (!archivo) return '';

    const extension = archivo.name.split('.').pop()?.toLowerCase();

    if (!['pdf', 'doc', 'docx'].includes(extension)) {
      return 'El curriculum debe ser un PDF o un documento Word (.doc o .docx).';
    }

    if (archivo.size > 5 * 1024 * 1024) {
      return 'El curriculum supera el tamano maximo de 5 MB.';
    }

    if (archivo.name.length > 255) {
      return 'El nombre del archivo no puede superar los 255 caracteres.';
    }

    return '';
  }

  function manejarArchivo(evento) {
    const archivo = evento.target.files?.[0] ?? null;

    setCv(archivo);
    setErrores((actual) => ({
      ...actual,
      cv: archivo ? validarArchivoCv(archivo) || undefined : undefined,
    }));
  }

  function quitarArchivo() {
    setCv(null);
    setErrores((actual) => ({ ...actual, cv: undefined }));
    if (inputCvRef.current) inputCvRef.current.value = '';
  }

  function validarFormulario() {
    const nuevosErrores = {};
    const nombres = formulario.nombres.trim();
    const apellidoPaterno = formulario.apellidoPaterno.trim();
    const apellidoMaterno = formulario.apellidoMaterno.trim();
    const correo = formulario.correo.trim();
    const telefono = formulario.telefono.trim();

    if (!nombres) nuevosErrores.nombres = 'Ingresa los nombres del colaborador.';
    else if (nombres.length > 50) nuevosErrores.nombres = 'Maximo 50 caracteres.';

    if (!apellidoPaterno) nuevosErrores.apellidoPaterno = 'Ingresa el apellido paterno.';
    else if (apellidoPaterno.length > 25) nuevosErrores.apellidoPaterno = 'Maximo 25 caracteres.';

    if (!apellidoMaterno) nuevosErrores.apellidoMaterno = 'Ingresa el apellido materno.';
    else if (apellidoMaterno.length > 25) nuevosErrores.apellidoMaterno = 'Maximo 25 caracteres.';

    if (!correo || !CORREO_VALIDO.test(correo)) nuevosErrores.correo = 'Ingresa un correo valido.';
    else if (correo.length > 50) nuevosErrores.correo = 'Maximo 50 caracteres.';

    if (!telefono) nuevosErrores.telefono = 'Ingresa un telefono de contacto.';
    else if (telefono.length > 15) nuevosErrores.telefono = 'Maximo 15 caracteres.';

    if (!formulario.idFamiliaCargo) nuevosErrores.idFamiliaCargo = 'Selecciona la familia de cargo.';
    if (!formulario.idCargo) nuevosErrores.idCargo = 'Selecciona el cargo al que postula.';

    if (formulario.observaciones.length > 500) {
      nuevosErrores.observaciones = 'Maximo 500 caracteres.';
    }

    if (cv) {
      const mensajeCv = validarArchivoCv(cv);

      if (mensajeCv) nuevosErrores.cv = mensajeCv;
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  }

  async function guardar(evento) {
    evento.preventDefault();

    if (guardando || !validarFormulario()) return;

    setGuardando(true);
    setErrorFormulario('');

    const datos = {
      nombres: formulario.nombres.trim(),
      apellidoPaterno: formulario.apellidoPaterno.trim(),
      apellidoMaterno: formulario.apellidoMaterno.trim(),
      correo: formulario.correo.trim(),
      telefono: formulario.telefono.trim(),
      idFamiliaCargo: Number(formulario.idFamiliaCargo),
      idCargo: Number(formulario.idCargo),
      observaciones: formulario.observaciones.trim(),
      curriculumCv: cv,
    };

    const nombre = `${datos.nombres} ${datos.apellidoPaterno}`.trim();
    const cargo =
      cargosDisponibles.find((item) => item.id === datos.idCargo)?.nombre ?? 'el cargo seleccionado';

    try {
      const respuesta = await crearCandidato(datos);

      if (!respuesta?.ok) {
        setErrorFormulario(respuesta?.mensaje ?? 'No se pudo registrar la postulacion interna.');
        return;
      }

      onGuardado?.();
      setConfirmacion({ nombre, cargo, conCv: Boolean(cv) });
    } catch {
      setErrorFormulario('No se pudo registrar la postulacion interna.');
    } finally {
      setGuardando(false);
    }
  }

  function registrarOtra() {
    setConfirmacion(null);
    setFormulario({ ...FORMULARIO_INICIAL, fecha_registro: fechaHoyLocal() });
    setErrores({});
    setErrorFormulario('');
    setCv(null);
    if (inputCvRef.current) inputCvRef.current.value = '';
  }

  function cerrar() {
    setConfirmacion(null);
    onCerrar?.();
  }

  if (!visible) return null;

  if (confirmacion) {
    return (
      <ConfirmacionModal
        visible
        titulo="Postulación interna registrada"
        acciones={[
          { etiqueta: 'Registrar otra', icono: 'person-plus', onClick: registrarOtra },
          { etiqueta: 'Cerrar', variante: 'btn-aqua', onClick: cerrar },
        ]}
      >
        <strong>{confirmacion.nombre}</strong> quedó registrado como postulación interna para el cargo{' '}
        <strong>{confirmacion.cargo}</strong>.{confirmacion.conCv ? ' Se adjuntó el currículum.' : ''}
      </ConfirmacionModal>
    );
  }

  return (
    <>
      <div
        className="modal fade show d-block"
        id="postulacion-interna-admin"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="postulacion-interna-admin-titulo"
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable" style={{ maxHeight: '90vh' }}>
          <div className="modal-content" style={{ maxHeight: '90vh' }}>
            <div className="modal-header">
              <h5 className="modal-title" id="postulacion-interna-admin-titulo">
                <i className="bi bi-person-plus me-2" aria-hidden="true" />
                Registrar postulación interna
              </h5>
              <span className="badge rounded-pill bg-tint-success ms-2">Interna</span>
              <button type="button" className="btn-close" onClick={cerrar} aria-label="Cerrar" />
            </div>

            <form className="aqua-form analista-form" onSubmit={guardar} noValidate>
              <div className="modal-body p-3 p-md-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                {errorFormulario && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
                    {errorFormulario}
                  </div>
                )}

                <div className="alert alert-info d-flex align-items-center gap-2" role="status">
                  <i className="bi bi-info-circle" aria-hidden="true" />
                  <span className="small">
                    La postulación quedará registrada como interna y vinculada al administrador que la crea.
                  </span>
                </div>

                {cargandoCatalogos ? (
                  <div className="text-center py-5 text-muted-aqua">
                    <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
                    <p className="mb-0 small">Cargando familias y cargos...</p>
                  </div>
                ) : (
                  <>
                    {errorCatalogos && (
                      <div className="alert alert-warning d-flex justify-content-between align-items-center" role="alert">
                        <span>{errorCatalogos}</span>
                        <button type="button" className="btn btn-soft btn-sm" onClick={cargarCatalogos}>
                          Reintentar
                        </button>
                      </div>
                    )}

                    <section className="aqua-form-section">
                      <div className="analista-section-head">
                        <span className="analista-section-icon">
                          <i className="bi bi-person" aria-hidden="true" />
                        </span>
                        <div>
                          <h3>Datos del colaborador</h3>
                          <p>Ingresa los datos personales del colaborador que postula.</p>
                        </div>
                      </div>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label" htmlFor="admin-nombres">
                            Nombres <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errores.nombres ? 'is-invalid' : ''}`}
                            id="admin-nombres"
                            name="nombres"
                            maxLength={50}
                            value={formulario.nombres}
                            onChange={actualizarCampo}
                            required
                          />
                          {errores.nombres && <div className="invalid-feedback">{errores.nombres}</div>}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label" htmlFor="admin-apellidoPaterno">
                            Apellido paterno <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errores.apellidoPaterno ? 'is-invalid' : ''}`}
                            id="admin-apellidoPaterno"
                            name="apellidoPaterno"
                            maxLength={25}
                            value={formulario.apellidoPaterno}
                            onChange={actualizarCampo}
                            required
                          />
                          {errores.apellidoPaterno && (
                            <div className="invalid-feedback">{errores.apellidoPaterno}</div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label" htmlFor="admin-apellidoMaterno">
                            Apellido materno <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errores.apellidoMaterno ? 'is-invalid' : ''}`}
                            id="admin-apellidoMaterno"
                            name="apellidoMaterno"
                            maxLength={25}
                            value={formulario.apellidoMaterno}
                            onChange={actualizarCampo}
                            required
                          />
                          {errores.apellidoMaterno && (
                            <div className="invalid-feedback">{errores.apellidoMaterno}</div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label" htmlFor="admin-correo">
                            Correo electronico <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
                            id="admin-correo"
                            name="correo"
                            maxLength={50}
                            value={formulario.correo}
                            onChange={actualizarCampo}
                            required
                          />
                          {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label" htmlFor="admin-telefono">
                            Telefono <span className="text-danger">*</span>
                          </label>
                          <input
                            type="tel"
                            className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                            id="admin-telefono"
                            name="telefono"
                            maxLength={15}
                            value={formulario.telefono}
                            onChange={actualizarCampo}
                            placeholder="+56 9 1234 5678"
                            required
                          />
                          {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label" htmlFor="admin-fecha_registro">
                            Fecha de registro
                          </label>
                          <input
                            type="date"
                            className="form-control bg-light"
                            id="admin-fecha_registro"
                            name="fecha_registro"
                            value={formulario.fecha_registro}
                            readOnly
                            aria-readonly="true"
                            title="Fecha del sistema, no editable"
                          />
                          <div className="form-text">Se registra automaticamente con la fecha del sistema.</div>
                        </div>
                      </div>
                    </section>

                    <section className="aqua-form-section">
                      <div className="analista-section-head">
                        <span className="analista-section-icon">
                          <i className="bi bi-briefcase" aria-hidden="true" />
                        </span>
                        <div>
                          <h3>Cargo de interés</h3>
                          <p>Selecciona la familia y el cargo al que postula el colaborador.</p>
                        </div>
                      </div>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label" htmlFor="admin-idFamiliaCargo">
                            Familia de cargo <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${errores.idFamiliaCargo ? 'is-invalid' : ''}`}
                            id="admin-idFamiliaCargo"
                            name="idFamiliaCargo"
                            value={formulario.idFamiliaCargo}
                            onChange={seleccionarFamilia}
                            required
                          >
                            <option value="">Seleccione una familia</option>
                            {familias.map((familia) => (
                              <option key={familia.id} value={familia.id}>
                                {familia.nombre}
                              </option>
                            ))}
                          </select>
                          {errores.idFamiliaCargo && (
                            <div className="invalid-feedback">{errores.idFamiliaCargo}</div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label" htmlFor="admin-idCargo">
                            Cargo al que postula <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${errores.idCargo ? 'is-invalid' : ''}`}
                            id="admin-idCargo"
                            name="idCargo"
                            value={formulario.idCargo}
                            onChange={actualizarCampo}
                            disabled={!formulario.idFamiliaCargo}
                            required
                          >
                            <option value="">
                              {formulario.idFamiliaCargo ? 'Seleccione un cargo' : 'Elija primero la familia'}
                            </option>
                            {cargosDisponibles.map((cargo) => (
                              <option key={cargo.id} value={cargo.id}>
                                {cargo.nombre}
                              </option>
                            ))}
                          </select>
                          {errores.idCargo && <div className="invalid-feedback">{errores.idCargo}</div>}
                        </div>
                      </div>
                    </section>

                    <section className="aqua-form-section">
                      <div className="analista-section-head">
                        <span className="analista-section-icon">
                          <i className="bi bi-file-earmark-arrow-up" aria-hidden="true" />
                        </span>
                        <div>
                          <h3>Currículum</h3>
                          <p>Adjunta el CV en PDF o Word. Es opcional y no puede superar los 5 MB.</p>
                        </div>
                      </div>

                      <label className="form-label" htmlFor="admin-curriculumCv">
                        Currículum del colaborador
                      </label>
                      <input
                        ref={inputCvRef}
                        type="file"
                        className={`form-control ${errores.cv ? 'is-invalid' : ''}`}
                        id="admin-curriculumCv"
                        name="curriculumCv"
                        accept=".pdf,.doc,.docx"
                        onChange={manejarArchivo}
                      />
                      {errores.cv && <div className="invalid-feedback d-block">{errores.cv}</div>}
                      {cv && (
                        <div className="d-flex align-items-center justify-content-between gap-2 border rounded-3 p-2 mt-2">
                          <span className="small text-truncate">
                            <i className="bi bi-file-earmark-text me-1" aria-hidden="true" />
                            {cv.name} ({Math.round(cv.size / 1024)} KB)
                          </span>
                          <button
                            type="button"
                            className="btn btn-link btn-sm text-danger p-0"
                            onClick={quitarArchivo}
                            title="Quitar archivo"
                          >
                            <i className="bi bi-x-lg" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                      <div className="form-text">Formatos permitidos: PDF, DOC o DOCX. Máximo 5 MB.</div>
                    </section>

                    <section className="aqua-form-section">
                      <div className="analista-section-head">
                        <span className="analista-section-icon">
                          <i className="bi bi-chat-left-text" aria-hidden="true" />
                        </span>
                        <div>
                          <h3>Observaciones</h3>
                          <p>Antecedentes o contexto que el evaluador debe conocer.</p>
                        </div>
                      </div>

                      <label className="visually-hidden" htmlFor="admin-observaciones">
                        Observaciones
                      </label>
                      <textarea
                        className={`form-control ${errores.observaciones ? 'is-invalid' : ''}`}
                        id="admin-observaciones"
                        name="observaciones"
                        rows={3}
                        maxLength={500}
                        value={formulario.observaciones}
                        onChange={actualizarCampo}
                        placeholder="Antecedentes del colaborador o contexto de la postulación (opcional)"
                      />
                      {errores.observaciones ? (
                        <div className="invalid-feedback">{errores.observaciones}</div>
                      ) : (
                        <div className="form-text">{formulario.observaciones.length}/500 caracteres</div>
                      )}
                    </section>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-soft" onClick={cerrar} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-aqua" disabled={guardando || cargandoCatalogos}>
                  {guardando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-1" aria-hidden="true" />
                      Registrar postulación
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
