import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import ResultadoBadge from '../../components/ui/ResultadoBadge.jsx';
import TipoPostulacionBadge from '../../components/ui/TipoPostulacionBadge.jsx';
import VisorCvModal from '../../components/ui/VisorCvModal.jsx';
import { ESTADOS_SOLICITUD, formatearFecha } from '../../mock/solicitudes.js';
import { listarSolicitudes } from '../../services/solicitudesApi.js';
import { filtrarSolicitudes } from './filtros.js';

const PRIORIDAD = {
  alta: { nombre: 'Alta', clase: 'badge-estado-noapto' },
  normal: { nombre: 'Normal', clase: 'badge-estado-inactivo' },
  baja: { nombre: 'Baja', clase: 'badge-estado-inactivo' },
};

const FILTROS_INICIALES = {
  estado: 'todas',
  texto: '',
  idCargo: 'todos',
  idEvaluador: 'todos',
  fechaDesde: '',
};

/**
 * AnalistaSolicitudes
 * Listado de solicitudes registradas en MySQL con filtros por estado, texto,
 * cargo, evaluador y fecha. El detalle abre la vista de solo lectura.
 */
export default function AnalistaSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [candidatoCv, setCandidatoCv] = useState(null);

  const cargarSolicitudes = useCallback(async () => {
    setCargando(true);
    setError('');

    const datos = await listarSolicitudes();

    if (!datos?.ok) {
      setError(datos?.mensaje ?? 'No se pudieron cargar las solicitudes.');
      setSolicitudes([]);
    } else {
      setSolicitudes(datos.solicitudes ?? []);
    }

    setCargando(false);
  }, []);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  const cargos = useMemo(() => {
    const mapa = new Map();

    solicitudes.forEach((solicitud) => {
      if (solicitud.candidato) {
        mapa.set(solicitud.candidato.idCargo, solicitud.candidato.cargo);
      }
    });

    return [...mapa.entries()]
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [solicitudes]);

  const evaluadores = useMemo(() => {
    const mapa = new Map();

    solicitudes.forEach((solicitud) => {
      if (solicitud.evaluador) {
        mapa.set(solicitud.evaluador.id, solicitud.evaluador.nombre);
      }
    });

    return [...mapa.entries()]
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [solicitudes]);

  const resumen = useMemo(
    () =>
      ESTADOS_SOLICITUD.map((estado) => ({
        ...estado,
        total: solicitudes.filter((solicitud) => solicitud.estado === estado.clave).length,
      })),
    [solicitudes],
  );

  const visibles = useMemo(() => filtrarSolicitudes(solicitudes, filtros), [solicitudes, filtros]);

  function actualizarFiltro(campo, valor) {
    setFiltros((actual) => ({ ...actual, [campo]: valor }));
  }

  const pendientes = solicitudes.filter((solicitud) => solicitud.estado === 'pendiente').length;
  const enProceso = solicitudes.filter((solicitud) => solicitud.estado === 'en_proceso').length;

  return (
    <>
      <PageHeader
        etiqueta="Modulo Analista"
        titulo="Solicitudes de evaluacion"
        descripcion={`${solicitudes.length} solicitudes registradas (${pendientes} pendientes y ${enProceso} en proceso)`}
        acciones={
          <Link to="/analista/nueva-solicitud" className="btn btn-aqua btn-sm">
            <i className="bi bi-file-earmark-plus me-1" aria-hidden="true" />
            Nueva solicitud
          </Link>
        }
      />

      <div className="row g-2 mb-3">
        <div className="col-12">
          <div className="btn-group flex-wrap" role="group" aria-label="Filtrar solicitudes por estado">
            <button
              type="button"
              className={`btn btn-sm ${filtros.estado === 'todas' ? 'btn-aqua' : 'btn-soft'}`}
              onClick={() => actualizarFiltro('estado', 'todas')}
            >
              Todas ({solicitudes.length})
            </button>
            {resumen.map((estado) => (
              <button
                key={estado.clave}
                type="button"
                className={`btn btn-sm ${filtros.estado === estado.clave ? 'btn-aqua' : 'btn-soft'}`}
                onClick={() => actualizarFiltro('estado', estado.clave)}
              >
                {estado.nombre} ({estado.total})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="aqua-card">
        <div className="card-header">
          <div className="row g-2">
            <div className="col-lg-4">
              <label className="visually-hidden" htmlFor="busqueda-solicitudes">
                Buscar solicitudes
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white" aria-hidden="true">
                  <i className="bi bi-search" />
                </span>
                <input
                  type="search"
                  className="form-control"
                  id="busqueda-solicitudes"
                  placeholder="Buscar por ID, candidato o correo"
                  value={filtros.texto}
                  onChange={(evento) => actualizarFiltro('texto', evento.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <label className="visually-hidden" htmlFor="filtro-cargo">
                Filtrar por cargo
              </label>
              <select
                className="form-select form-select-sm"
                id="filtro-cargo"
                value={filtros.idCargo}
                onChange={(evento) => actualizarFiltro('idCargo', evento.target.value)}
              >
                <option value="todos">Todos los cargos</option>
                {cargos.map((cargo) => (
                  <option key={cargo.id} value={cargo.id}>
                    {cargo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-6 col-lg-3">
              <label className="visually-hidden" htmlFor="filtro-evaluador">
                Filtrar por evaluador
              </label>
              <select
                className="form-select form-select-sm"
                id="filtro-evaluador"
                value={filtros.idEvaluador}
                onChange={(evento) => actualizarFiltro('idEvaluador', evento.target.value)}
              >
                <option value="todos">Todos los evaluadores</option>
                {evaluadores.map((evaluador) => (
                  <option key={evaluador.id} value={evaluador.id}>
                    {evaluador.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-6 col-lg-2">
              <label className="visually-hidden" htmlFor="filtro-fecha">
                Filtrar desde la fecha
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                id="filtro-fecha"
                value={filtros.fechaDesde}
                onChange={(evento) => actualizarFiltro('fechaDesde', evento.target.value)}
                title="Solicitudes desde esta fecha"
              />
            </div>

            <div className="col-12 d-flex justify-content-between align-items-center text-muted-aqua">
              <small>{visibles.length} resultados</small>
              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none p-0"
                onClick={() => setFiltros(FILTROS_INICIALES)}
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="card-body text-center py-5 text-muted-aqua">
            <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
            <p className="mb-0 small">Cargando solicitudes...</p>
          </div>
        ) : error ? (
          <div className="card-body">
            <div
              className="alert alert-danger d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-0"
              role="alert"
            >
              <span>
                <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
                {error}
              </span>
              <button type="button" className="btn btn-soft btn-sm" onClick={cargarSolicitudes}>
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table aqua-table mb-0">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Candidato</th>
                  <th scope="col">Origen</th>
                  <th scope="col">Cargo</th>
                  <th scope="col">Evaluador</th>
                  <th scope="col">Prioridad</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Resultado</th>
                  <th scope="col" className="text-end">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((solicitud) => {
                  const candidato = solicitud.candidato ?? {};
                  const prioridad = PRIORIDAD[solicitud.prioridad] ?? PRIORIDAD.normal;

                  return (
                    <tr key={solicitud.id}>
                      <td className="fw-semibold text-nowrap">
                        SOL-{String(solicitud.id).padStart(4, '0')}
                      </td>
                      <td>
                        <span className="fw-semibold">{candidato.nombreCompleto}</span>
                        <span className="d-block text-muted-aqua" style={{ fontSize: '0.78rem' }}>
                          Creada el {formatearFecha(solicitud.fechaSolicitud)}
                        </span>
                      </td>
                      <td>
                        <TipoPostulacionBadge tipo={candidato.tipoPostulacion} />
                      </td>
                      <td className="text-muted-aqua">
                        <span className="d-block">{candidato.cargo}</span>
                        <span className="d-block" style={{ fontSize: '0.76rem' }}>
                          {candidato.familiaCargo}
                        </span>
                      </td>
                      <td className="text-muted-aqua">{solicitud.evaluador?.nombre ?? 'Sin asignar'}</td>
                      <td>
                        <span className={`badge badge-estado ${prioridad.clase}`}>{prioridad.nombre}</span>
                      </td>
                      <td>
                        <EstadoBadge estado={solicitud.estado} />
                      </td>
                      <td>
                        <ResultadoBadge resultado={solicitud.evaluacion?.resultado} />
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-soft"
                            onClick={() => setCandidatoCv(candidato)}
                            disabled={!candidato.cvArchivo}
                            title={candidato.cvArchivo ? 'Ver CV del candidato' : 'Postulacion sin CV adjunto'}
                          >
                            <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                          </button>
                          <Link
                            to={`/analista/solicitudes/${solicitud.id}`}
                            className="btn btn-soft"
                            title="Ver detalle de la solicitud"
                          >
                            <i className="bi bi-eye" aria-hidden="true" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center text-muted-aqua py-4">
                      No hay solicitudes que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <VisorCvModal candidato={candidatoCv} visible={Boolean(candidatoCv)} onCerrar={() => setCandidatoCv(null)} />
    </>
  );
}
