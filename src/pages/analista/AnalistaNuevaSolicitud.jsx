import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.js';
import { listarCandidatos } from '../../services/candidatosApi.js';
import { crearSolicitud, listarEvaluadores } from '../../services/solicitudesApi.js';

const PRIORIDADES = [
  { clave: 'baja', nombre: 'Baja' },
  { clave: 'normal', nombre: 'Normal' },
  { clave: 'alta', nombre: 'Alta' },
];

function fechaHoyLocal() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');

  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

/**
 * AnalistaNuevaSolicitud
 * Crea una solicitud de evaluacion en MySQL y la asigna a un evaluador activo.
 * Una solicitud nueva queda en estado Pendiente. Se bloquea el registro si el
 * candidato ya tiene una solicitud pendiente o en proceso.
 */
export default function AnalistaNuevaSolicitud() {
  const { usuario } = useAuth();
  const [parametros] = useSearchParams();
  const candidatoParam = parametros.get('candidato') ?? '';

  const [candidatos, setCandidatos] = useState([]);
  const [evaluadores, setEvaluadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [errores, setErrores] = useState({});
  const [errorEnvio, setErrorEnvio] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);

  const [formulario, setFormulario] = useState({
    candidato_id: '',
    evaluador_id: '',
    prioridad: 'normal',
    fecha_asignacion: fechaHoyLocal(),
    observaciones: '',
  });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorCarga('');

    const [respuestaCandidatos, respuestaEvaluadores] = await Promise.all([
      listarCandidatos(),
      listarEvaluadores(),
    ]);

    if (!respuestaCandidatos?.ok) {
      setErrorCarga(respuestaCandidatos?.mensaje ?? 'No se pudieron cargar los candidatos.');
      setCargando(false);
      return;
    }

    if (!respuestaEvaluadores?.ok) {
      setErrorCarga(respuestaEvaluadores?.mensaje ?? 'No se pudieron cargar los evaluadores.');
      setCargando(false);
      return;
    }

    const listaCandidatos = respuestaCandidatos.candidatos ?? [];
    setCandidatos(listaCandidatos);
    setEvaluadores(respuestaEvaluadores.evaluadores ?? []);

    setFormulario((actual) => {
      if (actual.candidato_id) return actual;

      const preseleccionado = listaCandidatos.find(
        (candidato) => String(candidato.id) === candidatoParam && !candidato.tieneSolicitudActiva,
      );

      return preseleccionado ? { ...actual, candidato_id: String(preseleccionado.id) } : actual;
    });

    setCargando(false);
  }, [candidatoParam]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const candidatoSeleccionado = useMemo(
    () => candidatos.find((candidato) => candidato.id === Number(formulario.candidato_id)) ?? null,
    [candidatos, formulario.candidato_id],
  );

  const evaluadorSeleccionado = useMemo(
    () => evaluadores.find((evaluador) => evaluador.id === Number(formulario.evaluador_id)) ?? null,
    [evaluadores, formulario.evaluador_id],
  );

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: undefined }));
  }

  function validar() {
    const nuevosErrores = {};

    if (!formulario.candidato_id) {
      nuevosErrores.candidato_id = 'Selecciona el candidato a evaluar.';
    } else if (candidatoSeleccionado?.tieneSolicitudActiva) {
      nuevosErrores.candidato_id = 'El candidato ya tiene una solicitud activa.';
    }

    if (!formulario.evaluador_id) nuevosErrores.evaluador_id = 'Asigna un evaluador responsable.';
    if (!formulario.fecha_asignacion) nuevosErrores.fecha_asignacion = 'Ingresa la fecha de asignacion.';

    if (formulario.observaciones.length > 250) {
      nuevosErrores.observaciones = 'Maximo 250 caracteres.';
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();

    if (guardando) return;

    if (!validar()) return;

    setGuardando(true);
    setErrorEnvio('');

    const respuesta = await crearSolicitud({
      idCandidato: Number(formulario.candidato_id),
      idEvaluador: Number(formulario.evaluador_id),
      prioridad: formulario.prioridad,
      fechaAsignacion: formulario.fecha_asignacion,
      observaciones: formulario.observaciones.trim(),
    });

    if (!respuesta?.ok) {
      setErrorEnvio(respuesta?.mensaje ?? 'No se pudo crear la solicitud.');
      setGuardando(false);
      return;
    }

    setConfirmacion({
      id: respuesta.idSolicitud,
      candidato: candidatoSeleccionado?.nombreCompleto ?? 'Candidato',
      evaluador: evaluadorSeleccionado?.nombre ?? 'Evaluador',
      cargo: candidatoSeleccionado?.cargo ?? '-',
    });

    setFormulario((actual) => ({ ...actual, candidato_id: '', observaciones: '' }));
    setGuardando(false);

    await cargarDatos();
  }

  const sinCandidatos = !cargando && candidatos.length === 0;

  return (
    <>
      <PageHeader
        etiqueta="Modulo Analista"
        titulo="Nueva solicitud de evaluacion"
        descripcion="Vincula un candidato registrado con el profesional evaluador responsable."
        acciones={
          <Link to="/analista/solicitudes" className="btn btn-soft btn-sm">
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Volver a solicitudes
          </Link>
        }
      />

      {errorCarga && (
        <div className="alert alert-danger d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2" role="alert">
          <span>
            <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
            {errorCarga}
          </span>
          <button type="button" className="btn btn-soft btn-sm" onClick={cargarDatos}>
            Reintentar
          </button>
        </div>
      )}

      {sinCandidatos && (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-info-circle me-2" aria-hidden="true" />
          No hay candidatos registrados. Primero registra un candidato en el listado.
          <Link to="/analista/candidatos" className="alert-link ms-1">
            Ir a candidatos
          </Link>
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="aqua-card">
            <div className="card-header">
              <i className="bi bi-file-earmark-plus me-2" aria-hidden="true" />
              Datos de la solicitud
            </div>
            <div className="card-body">
              {cargando ? (
                <div className="text-center py-5 text-muted-aqua">
                  <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
                  <p className="mb-0 small">Cargando candidatos y evaluadores...</p>
                </div>
              ) : (
                <form className="aqua-form" onSubmit={manejarEnvio} noValidate>
                  {errorEnvio && (
                    <div className="alert alert-danger" role="alert">
                      <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
                      {errorEnvio}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label" htmlFor="candidato_id">
                      Candidato <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errores.candidato_id ? 'is-invalid' : ''}`}
                      id="candidato_id"
                      name="candidato_id"
                      value={formulario.candidato_id}
                      onChange={actualizarCampo}
                      required
                    >
                      <option value="">Selecciona un candidato registrado</option>
                      {candidatos.map((candidato) => (
                        <option
                          key={candidato.id}
                          value={candidato.id}
                          disabled={candidato.tieneSolicitudActiva}
                        >
                          {candidato.nombreCompleto} - {candidato.cargo}
                          {candidato.tieneSolicitudActiva ? ' (solicitud activa)' : ''}
                        </option>
                      ))}
                    </select>
                    {errores.candidato_id && <div className="invalid-feedback">{errores.candidato_id}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="evaluador_id">
                      Evaluador responsable <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errores.evaluador_id ? 'is-invalid' : ''}`}
                      id="evaluador_id"
                      name="evaluador_id"
                      value={formulario.evaluador_id}
                      onChange={actualizarCampo}
                      required
                    >
                      <option value="">Selecciona un profesional evaluador</option>
                      {evaluadores.map((evaluador) => (
                        <option key={evaluador.id} value={evaluador.id}>
                          {evaluador.nombre} - {evaluador.correo}
                        </option>
                      ))}
                    </select>
                    {errores.evaluador_id && <div className="invalid-feedback">{errores.evaluador_id}</div>}
                    <div className="form-text">
                      La solicitud queda en estado Pendiente hasta que el evaluador inicie el proceso.
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="fecha_asignacion">
                        Fecha de asignacion <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errores.fecha_asignacion ? 'is-invalid' : ''}`}
                        id="fecha_asignacion"
                        name="fecha_asignacion"
                        value={formulario.fecha_asignacion}
                        onChange={actualizarCampo}
                        required
                      />
                      {errores.fecha_asignacion && (
                        <div className="invalid-feedback">{errores.fecha_asignacion}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="prioridad">
                        Prioridad
                      </label>
                      <select
                        className="form-select"
                        id="prioridad"
                        name="prioridad"
                        value={formulario.prioridad}
                        onChange={actualizarCampo}
                      >
                        {PRIORIDADES.map((item) => (
                          <option key={item.clave} value={item.clave}>
                            {item.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label" htmlFor="observaciones">
                      Observaciones para el evaluador
                    </label>
                    <textarea
                      className={`form-control ${errores.observaciones ? 'is-invalid' : ''}`}
                      id="observaciones"
                      name="observaciones"
                      rows={4}
                      maxLength={250}
                      value={formulario.observaciones}
                      onChange={actualizarCampo}
                      placeholder="Antecedentes relevantes, condiciones del cargo o focos de la evaluacion"
                    />
                    {errores.observaciones ? (
                      <div className="invalid-feedback">{errores.observaciones}</div>
                    ) : (
                      <div className="form-text">{formulario.observaciones.length}/250 caracteres</div>
                    )}
                  </div>

                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <button type="submit" className="btn btn-aqua px-4" disabled={guardando || sinCandidatos}>
                      {guardando ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle me-1" aria-hidden="true" />
                          Crear solicitud
                        </>
                      )}
                    </button>
                    <Link to="/analista/solicitudes" className="btn btn-soft px-4">
                      <i className="bi bi-x-circle me-1" aria-hidden="true" />
                      Cancelar
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="aqua-card mb-3">
            <div className="card-header">
              <i className="bi bi-info-circle me-2" aria-hidden="true" />
              Resumen previo
            </div>
            <div className="card-body">
              {candidatoSeleccionado ? (
                <dl className="row mb-0 small">
                  <dt className="col-5 text-muted-aqua fw-semibold">Candidato</dt>
                  <dd className="col-7">{candidatoSeleccionado.nombreCompleto}</dd>
                  <dt className="col-5 text-muted-aqua fw-semibold">Cargo</dt>
                  <dd className="col-7">{candidatoSeleccionado.cargo}</dd>
                  <dt className="col-5 text-muted-aqua fw-semibold">Familia</dt>
                  <dd className="col-7">{candidatoSeleccionado.familiaCargo}</dd>
                  <dt className="col-5 text-muted-aqua fw-semibold">Origen</dt>
                  <dd className="col-7 text-capitalize">{candidatoSeleccionado.tipoPostulacion}</dd>
                  <dt className="col-5 text-muted-aqua fw-semibold">Postulado</dt>
                  <dd className="col-7 mb-0">
                    {candidatoSeleccionado.fechaPostulacion
                      ? candidatoSeleccionado.fechaPostulacion.split('-').reverse().join('/')
                      : '-'}
                  </dd>
                </dl>
              ) : (
                <p className="text-muted-aqua small mb-0">Selecciona un candidato para ver el resumen.</p>
              )}

              <hr />

              <p className="small mb-1 text-muted-aqua">Evaluador asignado</p>
              <p className="small fw-semibold mb-0">{evaluadorSeleccionado?.nombre ?? 'Sin asignar'}</p>

              <hr />

              <p className="small mb-1 text-muted-aqua">Registrado por</p>
              <p className="small fw-semibold mb-0">{usuario?.nombre ?? 'Analista'}</p>
            </div>
          </div>

          <div className="aqua-card">
            <div className="card-header">
              <i className="bi bi-lightbulb me-2" aria-hidden="true" />
              Reglas del proceso
            </div>
            <div className="card-body small text-muted-aqua">
              <p className="mb-2">
                <i className="bi bi-dot" aria-hidden="true" />
                La solicitud se guarda en MySQL y queda en estado <strong>Pendiente</strong>.
              </p>
              <p className="mb-2">
                <i className="bi bi-dot" aria-hidden="true" />
                Un candidato no puede tener dos solicitudes activas al mismo tiempo.
              </p>
              <p className="mb-0">
                <i className="bi bi-dot" aria-hidden="true" />
                El evaluador solo vera las solicitudes asignadas a su usuario.
              </p>
            </div>
          </div>
        </div>
      </div>

      {confirmacion && (
        <>
          <div
            className="modal fade show d-block"
            id="solicitud-creada"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="solicitud-creada-titulo"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center p-4">
                  <span
                    className="stat-icon bg-tint-success mx-auto mb-3"
                    style={{ width: 60, height: 60, fontSize: '1.8rem' }}
                    aria-hidden="true"
                  >
                    <i className="bi bi-check-lg" />
                  </span>
                  <h2 className="h5 fw-semibold mb-2" id="solicitud-creada-titulo">
                    Solicitud SOL-{String(confirmacion.id).padStart(4, '0')} creada
                  </h2>
                  <p className="text-muted-aqua small mb-0">
                    <strong>{confirmacion.candidato}</strong> fue asignado a{' '}
                    <strong>{confirmacion.evaluador}</strong> para el cargo de {confirmacion.cargo}.
                  </p>
                </div>
                <div className="modal-footer justify-content-center border-0 pt-0">
                  <button type="button" className="btn btn-soft" onClick={() => setConfirmacion(null)}>
                    Crear otra
                  </button>
                  <Link to="/analista/solicitudes" className="btn btn-aqua" onClick={() => setConfirmacion(null)}>
                    Ver solicitudes
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </>
  );
}
