import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import ResultadoBadge from '../../components/ui/ResultadoBadge.jsx';
import { StatCardCompacta } from '../../components/ui/StatCard.jsx';
import VisorCvModal from '../../components/ui/VisorCvModal.jsx';
import { useAuth } from '../../context/AuthContext.js';
import { formatearFecha } from '../../mock/solicitudes.js';
import { listarMisSolicitudes } from '../../services/solicitudesApi.js';

const PRIORIDAD = {
  alta: { nombre: 'Alta', clase: 'badge-estado-noapto' },
  normal: { nombre: 'Normal', clase: 'badge-estado-inactivo' },
  baja: { nombre: 'Baja', clase: 'badge-estado-inactivo' },
};

/** Solicitudes de evaluación asignadas al evaluador que inició sesión. */
export default function EvaluadorMisSolicitudes() {
  const { usuario } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [candidatoCv, setCandidatoCv] = useState(null);
  const [recarga, setRecarga] = useState(0);

  const cargarSolicitudes = useCallback(async () => {
    setCargando(true);
    setError('');

    const datos = await listarMisSolicitudes();

    if (!datos?.ok) {
      setError(datos?.mensaje ?? 'No se pudieron cargar tus solicitudes asignadas.');
      setSolicitudes([]);
    } else {
      setSolicitudes(datos.solicitudes ?? []);
    }

    setCargando(false);
  }, []);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes, recarga]);

  const filtradas = useMemo(
    () =>
      filtroEstado === 'todas'
        ? solicitudes
        : solicitudes.filter((solicitud) => solicitud.estado === filtroEstado),
    [solicitudes, filtroEstado],
  );

  const pendientes = solicitudes.filter((solicitud) => solicitud.estado === 'pendiente').length;
  const enProceso = solicitudes.filter((solicitud) => solicitud.estado === 'en_proceso').length;
  const finalizadas = solicitudes.filter((solicitud) => solicitud.estado === 'finalizada').length;

  return (
    <>
      <PageHeader
        etiqueta="Modulo Evaluador"
        titulo="Mis solicitudes"
        descripcion={`Solicitudes de evaluación asignadas a ${usuario?.nombre ?? 'tu usuario'}.`}
        acciones={
          <button type="button" className="btn btn-soft btn-sm" onClick={() => setRecarga((valor) => valor + 1)}>
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
            Actualizar
          </button>
        }
      />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCardCompacta titulo="Pendientes" valor={pendientes} icono="hourglass-split" tinte="bg-tint-warning" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCardCompacta titulo="En proceso" valor={enProceso} icono="arrow-repeat" tinte="bg-tint-primary" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCardCompacta titulo="Finalizadas" valor={finalizadas} icono="check-circle" tinte="bg-tint-success" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCardCompacta titulo="Total asignadas" valor={solicitudes.length} icono="inbox" tinte="bg-tint-info" />
        </div>
      </div>

      {cargando ? (
        <div className="aqua-card">
          <div className="card-body text-center py-5 text-muted-aqua">
            <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
            <p className="mb-0 small">Cargando tus solicitudes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="aqua-card">
          <div className="card-body text-center py-5">
            <i className="bi bi-exclamation-triangle fs-1 text-warning d-block mb-3" aria-hidden="true" />
            <p className="fw-semibold mb-1">No se pudieron cargar las solicitudes</p>
            <p className="text-muted-aqua small mb-3">{error}</p>
            <button type="button" className="btn btn-aqua btn-sm" onClick={() => setRecarga((valor) => valor + 1)}>
              <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
              Reintentar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="btn-group flex-wrap mb-3" role="group" aria-label="Filtrar mis solicitudes">
            {[
              { clave: 'todas', nombre: 'Todas', total: solicitudes.length },
              { clave: 'pendiente', nombre: 'Pendiente', total: pendientes },
              { clave: 'en_proceso', nombre: 'En proceso', total: enProceso },
              { clave: 'finalizada', nombre: 'Finalizada', total: finalizadas },
            ].map((item) => (
              <button
                key={item.clave}
                type="button"
                className={`btn btn-sm ${filtroEstado === item.clave ? 'btn-aqua' : 'btn-soft'}`}
                onClick={() => setFiltroEstado(item.clave)}
              >
                {item.nombre} ({item.total})
              </button>
            ))}
          </div>

          {filtradas.length === 0 ? (
            <div className="aqua-card">
              <div className="card-body text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted-aqua d-block mb-3" aria-hidden="true" />
                <p className="fw-semibold mb-1">No hay solicitudes en este estado</p>
                <p className="text-muted-aqua small mb-0">
                  Cambia el filtro o espera a que el Analista de reclutamiento asigne nuevas evaluaciones.
                </p>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {filtradas.map((solicitud) => {
                const candidato = solicitud.candidato;
                const codigo = `SOL-${String(solicitud.id).padStart(4, '0')}`;
                const prioridad = PRIORIDAD[solicitud.prioridad] ?? PRIORIDAD.normal;
                const resultado = solicitud.evaluacion?.resultado;

                return (
                  <div className="col-md-6 col-xl-4" key={solicitud.id}>
                    <article className="aqua-card h-100">
                      <div className="card-header d-flex justify-content-between align-items-center gap-2">
                        <span>{codigo}</span>
                        <EstadoBadge estado={solicitud.estado} />
                      </div>
                      <div className="card-body">
                        <p className="fw-semibold mb-1">{candidato?.nombreCompleto ?? 'Postulante sin nombre'}</p>
                        <p className="text-muted-aqua small mb-2">
                          {candidato?.cargo ?? 'Cargo no definido'}
                          {candidato?.familiaCargo ? ` · ${candidato.familiaCargo}` : ''}
                        </p>

                        <span className={`badge badge-estado ${prioridad.clase} mb-3`}>
                          Prioridad {prioridad.nombre}
                        </span>

                        <dl className="row mb-0 small">
                          <dt className="col-5 text-muted-aqua fw-semibold">Asignada</dt>
                          <dd className="col-7">{formatearFecha(solicitud.fechaAsignacion)}</dd>

                          <dt className="col-5 text-muted-aqua fw-semibold">Evaluación</dt>
                          <dd className="col-7">{formatearFecha(solicitud.evaluacion?.fechaEvaluacion)}</dd>

                          <dt className="col-5 text-muted-aqua fw-semibold">Resultado</dt>
                          <dd className="col-7 mb-0">
                            <ResultadoBadge resultado={resultado} />
                          </dd>
                        </dl>
                      </div>
                      <div className="card-footer bg-white d-flex gap-2">
                        <Link
                          to={`/evaluador/evaluar/${solicitud.id}`}
                          className={`btn btn-sm flex-grow-1 ${solicitud.estado === 'finalizada' ? 'btn-soft' : 'btn-aqua'}`}
                        >
                          <i className="bi bi-clipboard2-check me-1" aria-hidden="true" />
                          {solicitud.estado === 'finalizada' ? 'Ver evaluación' : 'Evaluar'}
                        </Link>
                        <button
                          type="button"
                          className="btn btn-soft btn-sm"
                          disabled={!candidato?.cvArchivo}
                          onClick={() => setCandidatoCv(candidato)}
                          title={candidato?.cvArchivo ? 'Previsualizar CV' : 'Sin CV adjunto'}
                        >
                          <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <VisorCvModal candidato={candidatoCv} visible={Boolean(candidatoCv)} onCerrar={() => setCandidatoCv(null)} />
    </>
  );
}
