import { useMemo, useState } from 'react';

import PageHeader from '../../components/ui/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.js';
import { cargosPorFamilia } from '../../mock/cargos.js';
import { obtenerUsuario, usuariosElegiblesInternos } from '../../mock/usuarios.js';

const ESTADO_INICIAL = {
  usuario_id: '',
  familia_id: '',
  cargo_id: '',
  fecha_postulacion: '2026-09-29',
  observaciones: '',
};

/**
 * AdminPostularInterno
 * El administrador registra la postulacion de un colaborador ya existente en el
 * sistema. Persistencia prevista: POST /postulacionesInternas.
 */
export default function AdminPostularInterno() {
  const { usuario } = useAuth();
  const grupos = useMemo(() => cargosPorFamilia(), []);
  const colaboradores = useMemo(() => usuariosElegiblesInternos(), []);

  const [formulario, setFormulario] = useState(ESTADO_INICIAL);
  const [errores, setErrores] = useState({});
  const [registros, setRegistros] = useState([]);
  const [confirmacion, setConfirmacion] = useState(null);

  const cargosDisponibles = useMemo(() => {
    const grupo = grupos.find((item) => item.id === Number(formulario.familia_id));
    return grupo ? grupo.cargos : [];
  }, [grupos, formulario.familia_id]);

  const colaboradorSeleccionado = obtenerUsuario(formulario.usuario_id);
  const cargoSeleccionado = cargosDisponibles.find((cargo) => cargo.id === Number(formulario.cargo_id));

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: undefined }));
  }

  function seleccionarFamilia(evento) {
    setFormulario((actual) => ({ ...actual, familia_id: evento.target.value, cargo_id: '' }));
    setErrores((actual) => ({ ...actual, familia_id: undefined, cargo_id: undefined }));
  }

  function validar() {
    const nuevosErrores = {};
    if (!formulario.usuario_id) nuevosErrores.usuario_id = 'Selecciona el colaborador a postular.';
    if (!formulario.familia_id) nuevosErrores.familia_id = 'Selecciona la familia de cargo.';
    if (!formulario.cargo_id) nuevosErrores.cargo_id = 'Selecciona el cargo destino.';
    if (!formulario.fecha_postulacion) nuevosErrores.fecha_postulacion = 'Ingresa la fecha de postulacion.';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    if (!validar()) return;

    const registro = {
      id: `INT-${String(registros.length + 1).padStart(3, '0')}`,
      colaborador: colaboradorSeleccionado.nombre,
      cargo: cargoSeleccionado.nombre,
      fecha: formulario.fecha_postulacion,
      registradoPor: usuario?.nombre ?? 'Administrador',
    };

    setRegistros((actual) => [registro, ...actual]);
    setConfirmacion(registro);
    setFormulario(ESTADO_INICIAL);
  }

  return (
    <>
      <PageHeader
        etiqueta="Modulo Administrador"
        titulo="Postulación interna"
        descripcion="Registra la postulación de un colaborador de AquaChile a una vacante disponible."
        acciones={
          <span className="badge badge-estado badge-estado-pendiente">
            <i className="bi bi-info-circle me-1" aria-hidden="true" />
            Maquetado sin persistencia
          </span>
        }
      />

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="aqua-card">
            <div className="card-header">
              <i className="bi bi-person-plus me-2" aria-hidden="true" />
              Nuevo movimiento interno
            </div>
            <div className="card-body">
              <form className="aqua-form" onSubmit={manejarEnvio} noValidate>
                <div className="mb-3">
                  <label className="form-label" htmlFor="usuario_id">
                    Colaborador del sistema <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errores.usuario_id ? 'is-invalid' : ''}`}
                    id="usuario_id"
                    name="usuario_id"
                    value={formulario.usuario_id}
                    onChange={actualizarCampo}
                    required
                  >
                    <option value="">Seleccione un empleado registrado</option>
                    {colaboradores.map((colaborador) => (
                      <option key={colaborador.id} value={colaborador.id}>
                        {colaborador.nombre} &middot; {colaborador.cargo} ({colaborador.unidad})
                      </option>
                    ))}
                  </select>
                  {errores.usuario_id && <div className="invalid-feedback">{errores.usuario_id}</div>}
                </div>

                <div className="row g-3 mb-3">
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
                      Cargo destino <span className="text-danger">*</span>
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
                      <option value="">
                        {formulario.familia_id ? 'Seleccione un cargo' : 'Elija primero la familia'}
                      </option>
                      {cargosDisponibles.map((cargo) => (
                        <option key={cargo.id} value={cargo.id}>
                          {cargo.nombre} ({cargo.vacantes} vacantes)
                        </option>
                      ))}
                    </select>
                    {errores.cargo_id && <div className="invalid-feedback">{errores.cargo_id}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="fecha_postulacion">
                    Fecha de postulación <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-control ${errores.fecha_postulacion ? 'is-invalid' : ''}`}
                    id="fecha_postulacion"
                    name="fecha_postulacion"
                    value={formulario.fecha_postulacion}
                    onChange={actualizarCampo}
                    required
                  />
                  {errores.fecha_postulacion && <div className="invalid-feedback">{errores.fecha_postulacion}</div>}
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="observaciones">
                    Observaciones iniciales
                  </label>
                  <textarea
                    className="form-control"
                    id="observaciones"
                    name="observaciones"
                    rows={4}
                    value={formulario.observaciones}
                    onChange={actualizarCampo}
                    placeholder="Contexto del movimiento, acuerdo con el colaborador o motivo del ascenso"
                  />
                  <div className="form-text">
                    Quedará registrada en la trazabilidad de la solicitud.
                  </div>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button type="submit" className="btn btn-aqua px-4">
                    <i className="bi bi-check2-circle me-1" aria-hidden="true" />
                    Registrar postulación interna
                  </button>
                  <button
                    type="button"
                    className="btn btn-soft px-4"
                    onClick={() => {
                      setFormulario(ESTADO_INICIAL);
                      setErrores({});
                    }}
                  >
                    <i className="bi bi-arrow-counterclockwise me-1" aria-hidden="true" />
                    Limpiar
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
              Resumen de la seleccion
            </div>
            <div className="card-body">
              {colaboradorSeleccionado ? (
                <>
                  <p className="fw-semibold mb-1">{colaboradorSeleccionado.nombre}</p>
                  <p className="text-muted-aqua small mb-3">
                    {colaboradorSeleccionado.cargo} &middot; {colaboradorSeleccionado.unidad}
                  </p>
                </>
              ) : (
                <p className="text-muted-aqua small mb-0">Selecciona un colaborador para ver su ficha.</p>
              )}

              <hr />

              <p className="small mb-1 text-muted-aqua">Cargo destino</p>
              <p className="small fw-semibold mb-2">{cargoSeleccionado ? cargoSeleccionado.nombre : 'Sin definir'}</p>

              <p className="small mb-1 text-muted-aqua">Jornada</p>
              <p className="small fw-semibold mb-0">{cargoSeleccionado ? cargoSeleccionado.jornada : '-'}</p>
            </div>
          </div>

          <div className="aqua-card">
            <div className="card-header">
              <i className="bi bi-list-check me-2" aria-hidden="true" />
              Movimientos registrados en esta sesion
            </div>
            <div className="card-body">
              {registros.length === 0 ? (
                <p className="text-muted-aqua small mb-0">
                  Todavia no registras movimientos internos en esta sesion.
                </p>
              ) : (
                <ul className="list-unstyled mb-0 d-grid gap-2">
                  {registros.map((registro) => (
                    <li className="border rounded p-2" key={registro.id}>
                      <p className="mb-1 fw-semibold small">{registro.colaborador}</p>
                      <p className="mb-1 text-muted-aqua" style={{ fontSize: '0.78rem' }}>
                        {registro.cargo}
                      </p>
                      <p className="mb-0 text-muted-aqua fst-italic" style={{ fontSize: '0.74rem' }}>
                        {registro.id} &middot; {registro.fecha} &middot; por {registro.registradoPor}
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
          <div className="modal fade show d-block" id="postulacion-interna-ok" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="postulacion-interna-ok-titulo">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center p-4">
                  <span className="stat-icon bg-tint-success mx-auto mb-3" style={{ width: 60, height: 60, fontSize: '1.8rem' }} aria-hidden="true">
                    <i className="bi bi-check-lg" />
                  </span>
                  <h2 className="h5 fw-semibold mb-2" id="postulacion-interna-ok-titulo">
                    Postulación interna registrada
                  </h2>
                  <p className="text-muted-aqua small mb-0">
                    <strong>{confirmacion.colaborador}</strong> quedó postulado a{' '}
                    <strong>{confirmacion.cargo}</strong>. El Analista de reclutamiento puede generar la
                    solicitud de evaluación desde su módulo.
                  </p>
                </div>
                <div className="modal-footer justify-content-center border-0 pt-0">
                  <button type="button" className="btn btn-soft" onClick={() => setConfirmacion(null)}>
                    Registrar otra
                  </button>
                  <button type="button" className="btn btn-aqua" onClick={() => setConfirmacion(null)}>
                    Entendido
                  </button>
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