import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import { useAuth } from '../../context/AuthContext.js';
import { CANDIDATOS, nombreCompleto } from '../../mock/candidatos.js';
import { obtenerCargo } from '../../mock/cargos.js';
import { usuariosEvaluadores } from '../../mock/usuarios.js';
import { SOLICITUDES, formatearFecha } from '../../mock/solicitudes.js';

const PRIORIDADES = [
  { clave: 'baja', nombre: 'Baja' },
  { clave: 'normal', nombre: 'Normal' },
  { clave: 'alta', nombre: 'Alta' },
];

/**
 * AnalistaNuevaSolicitud
 * Crea la solicitud de evaluacion psicologica: vincula un candidato (externo o
 * interno) con un evaluador responsable. Persistencia prevista: POST /solicitudes.
 */
export default function AnalistaNuevaSolicitud() {
  const { usuario } = useAuth();
  const navegar = useNavigate();
  const evaluadores = useMemo(() => usuariosEvaluadores(), []);

  const [formulario, setFormulario] = useState({
    candidato_id: '',
    evaluador_id: '',
    prioridad: 'normal',
    fecha_asignacion: '2026-09-29',
    observaciones: '',
  });
  const [errores, setErrores] = useState({});
  const [creadas, setCreadas] = useState([]);
  const [confirmacion, setConfirmacion] = useState(null);

  const candidatoSeleccionado = CANDIDATOS.find((candidato) => candidato.id === Number(formulario.candidato_id));
  const evaluadorSeleccionado = evaluadores.find(
    (evaluador) => evaluador.id === Number(formulario.evaluador_id),
  );

  const candidatosConSolicitud = useMemo(
    () => new Set(SOLICITUDES.map((solicitud) => solicitud.candidato_id)),
    [],
  );

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: undefined }));
  }

  function validar() {
    const nuevosErrores = {};
    if (!formulario.candidato_id) nuevosErrores.candidato_id = 'Selecciona el candidato a evaluar.';
    if (!formulario.evaluador_id) nuevosErrores.evaluador_id = 'Asigna un evaluador responsable.';
    if (!formulario.fecha_asignacion) nuevosErrores.fecha_asignacion = 'Ingresa la fecha de asignacion.';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    if (!validar()) return;

    const siguienteNumero = SOLICITUDES.length + creadas.length + 1;
    const registro = {
      id: `SOL-${String(siguienteNumero).padStart(4, '0')}`,
      candidato: nombreCompleto(candidatoSeleccionado),
      cargo: obtenerCargo(candidatoSeleccionado.cargo_id)?.nombre ?? '-',
      evaluador: evaluadorSeleccionado.nombre,
      fecha: formulario.fecha_asignacion,
      prioridad: formulario.prioridad,
    };

    setCreadas((actual) => [registro, ...actual]);
    setConfirmacion(registro);
    setFormulario((actual) => ({ ...actual, candidato_id: '', observaciones: '' }));
  }

  return (
    <>
      <PageHeader
        etiqueta="Modulo Analista"
        titulo="Nueva solicitud de evaluación"
        descripcion="Vincula un candidato registrado con el profesional evaluador responsable."
        acciones={
          <Link to="/analista/solicitudes" className="btn btn-soft btn-sm">
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Volver a solicitudes
          </Link>
        }
      />

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="aqua-card">
            <div className="card-header">
              <i className="bi bi-file-earmark-plus me-2" aria-hidden="true" />
              Datos de la solicitud
            </div>
            <div className="card-body">
              <form className="aqua-form" onSubmit={manejarEnvio} noValidate>
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
                    {CANDIDATOS.map((candidato) => (
                      <option key={candidato.id} value={candidato.id}>
                        {nombreCompleto(candidato)} - {obtenerCargo(candidato.cargo_id)?.nombre ?? 'sin cargo'}{' '}
                        {candidatosConSolicitud.has(candidato.id) ? '(ya evaluado)' : ''}
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
                        {evaluador.nombre} - {evaluador.cargo}
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
                      Fecha de asignación <span className="text-danger">*</span>
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
                    {errores.fecha_asignacion && <div className="invalid-feedback">{errores.fecha_asignacion}</div>}
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
                    className="form-control"
                    id="observaciones"
                    name="observaciones"
                    rows={4}
                    value={formulario.observaciones}
                    onChange={actualizarCampo}
                    placeholder="Antecedentes relevantes, condiciones del cargo o focos de la evaluación"
                  />
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button type="submit" className="btn btn-aqua px-4">
                    <i className="bi bi-check2-circle me-1" aria-hidden="true" />
                    Crear solicitud
                  </button>
                  <button type="button" className="btn btn-soft px-4" onClick={() => navegar('/analista/solicitudes')}>
                    <i className="bi bi-x-circle me-1" aria-hidden="true" />
                    Cancelar
                  </button>
                </div>
              </form>
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
                  <dd className="col-7">{nombreCompleto(candidatoSeleccionado)}</dd>
                  <dt className="col-5 text-muted-aqua fw-semibold">Cargo</dt>
                  <dd className="col-7">{obtenerCargo(candidatoSeleccionado.cargo_id)?.nombre ?? '-'}</dd>
                  <dt className="col-5 text-muted-aqua fw-semibold">Origen</dt>
                  <dd className="col-7 text-capitalize">{candidatoSeleccionado.tipo_postulacion}</dd>
                  <dt className="col-5 text-muted-aqua fw-semibold">Postulado</dt>
                  <dd className="col-7">{formatearFecha(candidatoSeleccionado.fecha_postulacion)}</dd>
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
              <i className="bi bi-clock-history me-2" aria-hidden="true" />
              Solicitudes creadas en esta sesión
            </div>
            <div className="card-body">
              {creadas.length === 0 ? (
                <p className="text-muted-aqua small mb-0">Aún no has creado solicitudes en esta sesión.</p>
              ) : (
                <ul className="list-unstyled mb-0 d-grid gap-2">
                  {creadas.map((registro) => (
                    <li className="border rounded p-2" key={registro.id}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <p className="mb-0 fw-semibold small">{registro.id}</p>
                        <EstadoBadge estado="pendiente" />
                      </div>
                      <p className="mb-1 text-muted-aqua" style={{ fontSize: '0.78rem' }}>
                        {registro.candidato}
                      </p>
                      <p className="mb-0 text-muted-aqua fst-italic" style={{ fontSize: '0.74rem' }}>
                        {registro.cargo} &middot; {registro.evaluador}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
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
                  <span className="stat-icon bg-tint-success mx-auto mb-3" style={{ width: 60, height: 60, fontSize: '1.8rem' }} aria-hidden="true">
                    <i className="bi bi-check-lg" />
                  </span>
                  <h2 className="h5 fw-semibold mb-2" id="solicitud-creada-titulo">
                    Solicitud {confirmacion.id} creada
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