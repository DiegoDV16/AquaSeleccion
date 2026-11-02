import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import TipoPostulacionBadge from '../../components/ui/TipoPostulacionBadge.jsx';
import { useAuth } from '../../context/AuthContext.js';
import { formatearFecha } from '../../mock/solicitudes.js';
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

function iniciales(candidato) {
  const nombres = candidato?.nombres ?? '';
  const apellido = candidato?.apellidoPaterno ?? '';

  return `${nombres.charAt(0)}${apellido.charAt(0)}`.toUpperCase() || '??';
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

    const listaCandidatos = (respuestaCandidatos.candidatos ?? []).filter(
      (candidato) => !['apto', 'no_apto'].includes(candidato.estado),
    );
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

  const sinCandidatos = !cargando && !errorCarga && candidatos.length === 0;

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
        <div
          className="alert alert-danger d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2"
          role="alert"
        >
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
        <div className="alert alert-warning d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2" role="alert">
          <span>
            <i className="bi bi-info-circle me-2" aria-hidden="true" />
            No hay candidatos disponibles para una nueva evaluación. Los candidatos aprobados o rechazados
            se excluyen automáticamente.
          </span>
          <Link to="/analista/candidatos" className="btn btn-soft btn-sm">
            Ir a candidatos
          </Link>
        </div>
      )}

      <div className="row g-4 align-items-start">
        <div className="col-lg-8">
          <div className="aqua-card">
            <div className="card-header">
              <i className="bi bi-file-earmark-plus me-2" aria-hidden="true" />
              Datos de la solicitud
            </div>
            <div className="card-body p-3 p-md-4">
              {cargando ? (
                <div className="text-center py-5 text-muted-aqua">
                  <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
                  <p className="mb-0 small">Cargando candidatos y evaluadores...</p>
                </div>
              ) : (
                <form className="aqua-form analista-form d-flex flex-column" onSubmit={manejarEnvio} noValidate>
                  {errorEnvio && (
                    <div className="alert alert-danger" role="alert">
                      <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
                      {errorEnvio}
                    </div>
                  )}

                  <section className="aqua-form-section">
                    <div className="analista-section-head">
                      <span className="analista-section-icon">
                        <i className="bi bi-person-check" aria-hidden="true" />
                      </span>
                      <div>
                        <h3>Candidato y evaluador</h3>
                        <p>Selecciona a quien se evaluara y quien sera el responsable del proceso.</p>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-12">
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
                        <div className="form-text">
                          Solo aparecen candidatos disponibles. No se listan los ya aprobados o rechazados.
                        </div>
                      </div>

                      <div className="col-12">
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
                          Solo se listan evaluadores activos. La solicitud queda Pendiente hasta que inicie el
                          proceso.
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="aqua-form-section">
                    <div className="analista-section-head">
                      <span className="analista-section-icon">
                        <i className="bi bi-calendar2-week" aria-hidden="true" />
                      </span>
                      <div>
                        <h3>Programacion</h3>
                        <p>Define la fecha de asignacion y la prioridad del proceso.</p>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="fecha_asignacion">
                          Fecha de asignacion <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control bg-light"
                          id="fecha_asignacion"
                          name="fecha_asignacion"
                          value={formulario.fecha_asignacion}
                          readOnly
                          aria-readonly="true"
                          title="Fecha del sistema, no editable"
                          required
                        />
                        <div className="form-text">Se registra automaticamente con la fecha del sistema.</div>
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
                        <div className="form-text">Alta prioridad se muestra destacada en el listado.</div>
                      </div>
                    </div>
                  </section>

                  <section className="aqua-form-section">
                    <div className="analista-section-head">
                      <span className="analista-section-icon">
                        <i className="bi bi-chat-left-text" aria-hidden="true" />
                      </span>
                      <div>
                        <h3>Observaciones</h3>
                        <p>Antecedentes o focos que el evaluador debe conocer antes de comenzar.</p>
                      </div>
                    </div>

                    <label className="visually-hidden" htmlFor="observaciones">
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
                      placeholder="Ej. Experiencia previa en planta, condiciones del turno o competencias a profundizar."
                    />
                    {errores.observaciones ? (
                      <div className="invalid-feedback">{errores.observaciones}</div>
                    ) : (
                      <div className="d-flex justify-content-between mt-1 analista-counter">
                        <span>Opcional para el analista.</span>
                        <span>{formulario.observaciones.length}/250 caracteres</span>
                      </div>
                    )}
                  </section>

                  <div className="analista-footer d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <p className="text-muted-aqua small mb-0">
                      <i className="bi bi-shield-check me-1" aria-hidden="true" />
                      La solicitud quedará asignada al evaluador seleccionado.
                    </p>
                    <div className="d-flex flex-column-reverse flex-sm-row gap-2">
                      <Link to="/analista/solicitudes" className="btn btn-soft px-4">
                        <i className="bi bi-x-circle me-1" aria-hidden="true" />
                        Cancelar
                      </Link>
                      <button
                        type="submit"
                        className="btn btn-aqua px-4"
                        disabled={guardando || sinCandidatos}
                      >
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
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="aqua-card analista-aside-card mb-3">
            <div className="card-header">
              <i className="bi bi-clipboard-check me-2" aria-hidden="true" />
              Resumen previo
            </div>
            <div className="card-body">
              {candidatoSeleccionado ? (
                <>
                  <div className="d-flex align-items-center gap-2 border rounded-3 p-3 mb-3 bg-tint-primary">
                    <span className="analista-avatar">{iniciales(candidatoSeleccionado)}</span>
                    <div className="overflow-hidden">
                      <p className="fw-semibold mb-0 small text-truncate">
                        {candidatoSeleccionado.nombreCompleto}
                      </p>
                      <p className="text-muted-aqua mb-0 text-truncate" style={{ fontSize: '0.76rem' }}>
                        {candidatoSeleccionado.correo}
                      </p>
                    </div>
                  </div>

                  <ul className="list-unstyled mb-0 small">
                    <li className="d-flex justify-content-between gap-3 py-2 border-bottom">
                      <span className="text-muted-aqua">Cargo</span>
                      <span className="text-end fw-semibold">{candidatoSeleccionado.cargo}</span>
                    </li>
                    <li className="d-flex justify-content-between gap-3 py-2 border-bottom">
                      <span className="text-muted-aqua">Familia</span>
                      <span className="text-end fw-semibold">{candidatoSeleccionado.familiaCargo}</span>
                    </li>
                    <li className="d-flex justify-content-between align-items-center gap-3 py-2 border-bottom">
                      <span className="text-muted-aqua">Origen</span>
                      <TipoPostulacionBadge tipo={candidatoSeleccionado.tipoPostulacion} />
                    </li>
                    <li className="d-flex justify-content-between gap-3 py-2">
                      <span className="text-muted-aqua">Postulacion</span>
                      <span className="text-end fw-semibold">
                        {formatearFecha(candidatoSeleccionado.fechaPostulacion)}
                      </span>
                    </li>
                  </ul>
                </>
              ) : (
                <div className="border rounded-3 p-4 text-center text-muted-aqua bg-light">
                  <span className="analista-avatar d-flex mx-auto mb-2">
                    <i className="bi bi-person-plus" aria-hidden="true" />
                  </span>
                  <p className="small mb-0">Selecciona un candidato para ver su ficha resumida.</p>
                </div>
              )}

              <div className="border rounded-3 p-3 mt-3">
                <p
                  className="text-muted-aqua text-uppercase fw-semibold mb-2"
                  style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}
                >
                  Evaluador asignado
                </p>
                <div className="analista-responsable">
                  <span className="analista-avatar">
                    <i className="bi bi-person-badge" aria-hidden="true" />
                  </span>
                  <div className="overflow-hidden">
                    <p className="fw-semibold mb-0 small text-truncate">
                      {evaluadorSeleccionado?.nombre ?? 'Sin asignar'}
                    </p>
                    <p className="text-muted-aqua mb-0 text-truncate" style={{ fontSize: '0.76rem' }}>
                      {evaluadorSeleccionado?.correo ?? 'Selecciona un evaluador'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-3 p-3 mt-2 d-flex align-items-center gap-2">
                <span className="analista-avatar" style={{ width: 34, height: 34, flexBasis: 34, fontSize: '0.9rem' }}>
                  <i className="bi bi-person-gear" aria-hidden="true" />
                </span>
                <div>
                  <p
                    className="text-muted-aqua text-uppercase fw-semibold mb-1"
                    style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}
                  >
                    Registrado por
                  </p>
                  <p className="fw-semibold mb-0 small">{usuario?.nombre ?? 'Analista'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="aqua-card analista-aside-card">
            <div className="card-header">
              <i className="bi bi-lightbulb me-2" aria-hidden="true" />
              Reglas del proceso
            </div>
            <div className="card-body">
              <ul className="list-unstyled d-grid gap-2 mb-0 small text-muted-aqua">
                <li className="d-flex gap-2">
                  <i className="bi bi-check2-circle text-success mt-1" aria-hidden="true" />
                  <span>La solicitud quedará disponible para el evaluador responsable.</span>
                </li>
                <li className="d-flex gap-2">
                  <i className="bi bi-check2-circle text-success mt-1" aria-hidden="true" />
                  <span>Un candidato no puede tener dos solicitudes activas al mismo tiempo.</span>
                </li>
                <li className="d-flex gap-2">
                  <i className="bi bi-check2-circle text-success mt-1" aria-hidden="true" />
                  <span>El evaluador solo vera las solicitudes asignadas a su usuario.</span>
                </li>
              </ul>
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
