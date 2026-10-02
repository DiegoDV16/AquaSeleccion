import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import ResultadoBadge from '../../components/ui/ResultadoBadge.jsx';
import { StatCardCompacta } from '../../components/ui/StatCard.jsx';
import { useAuth } from '../../context/AuthContext.js';
import { obtenerCandidato, nombreCompleto } from '../../mock/candidatos.js';
import { obtenerCargo } from '../../mock/cargos.js';
import { formatearFecha, solicitudesDeEvaluador } from '../../mock/solicitudes.js';

/** Solicitudes asignadas al evaluador activo (contexto de rol). */
export default function EvaluadorMisSolicitudes() {
  const { usuario } = useAuth();
  const [filtroEstado, setFiltroEstado] = useState('todas');

  const identificador = usuario?.id ?? 7;

  const solicitudes = useMemo(() => {
    const propias = solicitudesDeEvaluador(identificador);
    return filtroEstado === 'todas' ? propias : propias.filter((solicitud) => solicitud.estado === filtroEstado);
  }, [identificador, filtroEstado]);

  const todas = useMemo(() => solicitudesDeEvaluador(identificador), [identificador]);
  const pendientes = todas.filter((solicitud) => solicitud.estado === 'pendiente').length;
  const enProceso = todas.filter((solicitud) => solicitud.estado === 'en_proceso').length;
  const finalizadas = todas.filter((solicitud) => solicitud.estado === 'finalizada').length;

  return (
    <>
      <PageHeader
        etiqueta="Modulo Evaluador"
        titulo="Mis solicitudes"
        descripcion={`Solicitudes de evaluación asignadas a ${usuario?.nombre ?? 'el evaluador activo'}.`}
        acciones={
          <span className="badge badge-estado badge-estado-proceso">
            <i className="bi bi-person-badge me-1" aria-hidden="true" />
            Evaluador responsable
          </span>
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
          <StatCardCompacta titulo="Total asignadas" valor={todas.length} icono="inbox" tinte="bg-tint-info" />
        </div>
      </div>

      <div className="btn-group flex-wrap mb-3" role="group" aria-label="Filtrar mis solicitudes">
        {[
          { clave: 'todas', nombre: 'Todas', total: todas.length },
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

      {solicitudes.length === 0 ? (
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
          {solicitudes.map((solicitud) => {
            const candidato = obtenerCandidato(solicitud.candidato_id);
            const cargo = obtenerCargo(solicitud.cargo_id);
            return (
              <div className="col-md-6 col-xl-4" key={solicitud.id}>
                <article className="aqua-card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <span>{solicitud.id}</span>
                    <EstadoBadge estado={solicitud.estado} />
                  </div>
                  <div className="card-body">
                    <p className="fw-semibold mb-1">{nombreCompleto(candidato)}</p>
                    <p className="text-muted-aqua small mb-3">{cargo ? cargo.nombre : 'Cargo no definido'}</p>

                    <dl className="row mb-0 small">
                      <dt className="col-5 text-muted-aqua fw-semibold">Asignada</dt>
                      <dd className="col-7">{formatearFecha(solicitud.fecha_asignacion)}</dd>

                      <dt className="col-5 text-muted-aqua fw-semibold">Evaluación</dt>
                      <dd className="col-7">{formatearFecha(solicitud.fecha_evaluacion)}</dd>

                      <dt className="col-5 text-muted-aqua fw-semibold">Resultado</dt>
                      <dd className="col-7 mb-0">
                        <ResultadoBadge resultado={solicitud.resultado} />
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
                    {candidato?.cv_archivo && (
                      <button type="button" className="btn btn-soft btn-sm" disabled title="Disponible en el formulario de evaluación">
                        <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}