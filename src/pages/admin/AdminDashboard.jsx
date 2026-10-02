import { Link } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import { useAuth } from '../../context/AuthContext.js';
import { ACTIVIDAD_RECIENTE, TOP_CARGOS, metricasDashboard } from '../../mock/metricas.js';
import { SOLICITUDES } from '../../mock/solicitudes.js';
import { obtenerCandidato, nombreCompleto } from '../../mock/candidatos.js';
import { obtenerUsuario } from '../../mock/usuarios.js';
import { obtenerCargo } from '../../mock/cargos.js';

/** Dashboard del modulo Administrador: resumen operativo del proceso. */
export default function AdminDashboard() {
  const { usuario } = useAuth();
  const metricas = metricasDashboard();

  const solicitudesRecientes = SOLICITUDES.slice(0, 5);

  return (
    <>
      <PageHeader
        etiqueta="Modulo Administrador"
        titulo={`Panel general de reclutamiento`}
        descripcion={`Sesion activa: ${usuario?.nombre ?? 'Administrador'} - datos simulados de demostracion`}
        acciones={
          <>
            <Link to="/admin/postular-interno" className="btn btn-aqua btn-sm">
              <i className="bi bi-person-plus me-1" aria-hidden="true" />
              Nueva postulación interna
            </Link>
            <Link to="/admin/historial" className="btn btn-soft btn-sm">
              <i className="bi bi-clock-history me-1" aria-hidden="true" />
              Ver historial
            </Link>
          </>
        }
      />

      {/* Metricas */}
      <div className="row g-3 mb-4">
        {metricas.map((metrica) => (
          <div className="col-sm-6 col-xl-4" key={metrica.clave}>
            <StatCard {...metrica} />
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Solicitudes recientes */}
        <div className="col-lg-8">
          <div className="aqua-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-file-earmark-text me-2" aria-hidden="true" />
                Solicitudes recientes
              </span>
              <span className="text-muted-aqua" style={{ fontSize: '0.78rem' }}>
                Ultimas {solicitudesRecientes.length} de {SOLICITUDES.length}
              </span>
            </div>
            <div className="table-responsive">
              <table className="table aqua-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Candidato</th>
                    <th scope="col">Cargo</th>
                    <th scope="col">Evaluador</th>
                    <th scope="col">Estado</th>
                    <th scope="col" className="text-end">
                      Accion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesRecientes.map((solicitud) => {
                    const candidato = obtenerCandidato(solicitud.candidato_id);
                    const evaluador = obtenerUsuario(solicitud.evaluador_id);
                    const cargo = obtenerCargo(solicitud.cargo_id);
                    return (
                      <tr key={solicitud.id}>
                        <td className="fw-semibold">{solicitud.id}</td>
                        <td>{nombreCompleto(candidato)}</td>
                        <td className="text-muted-aqua">{cargo ? cargo.nombre : '-'}</td>
                        <td className="text-muted-aqua">{evaluador ? evaluador.nombre : 'Sin asignar'}</td>
                        <td>
                          <EstadoBadge estado={solicitud.estado} />
                        </td>
                        <td className="text-end">
                          <Link
                            to="/analista/solicitudes"
                            className="btn btn-soft btn-sm"
                            aria-label={`Ver solicitud ${solicitud.id}`}
                          >
                            <i className="bi bi-eye" aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="col-lg-4">
          <div className="aqua-card h-100">
            <div className="card-header">
              <i className="bi bi-activity me-2" aria-hidden="true" />
              Actividad reciente
            </div>
            <div className="card-body">
              <div className="aqua-timeline">
                {ACTIVIDAD_RECIENTE.map((actividad) => (
                  <div className="aqua-timeline-item" key={actividad.id}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className={`stat-icon ${actividad.tinte}`} style={{ width: 30, height: 30, flexBasis: 30, fontSize: '0.85rem' }} aria-hidden="true">
                        <i className={`bi bi-${actividad.icono}`} />
                      </span>
                      <p className="mb-0 fw-semibold small">{actividad.titulo}</p>
                    </div>
                    <p className="mb-0 text-muted-aqua" style={{ fontSize: '0.8rem' }}>
                      {actividad.detalle}
                    </p>
                    <p className="mb-0 text-muted-aqua fst-italic" style={{ fontSize: '0.74rem' }}>
                      {actividad.fecha}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top cargos */}
        <div className="col-12">
          <div className="aqua-card">
            <div className="card-header">
              <i className="bi bi-graph-up-arrow me-2" aria-hidden="true" />
              Cargos con mayor demanda
            </div>
            <div className="table-responsive">
              <table className="table aqua-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">Cargo</th>
                    <th scope="col" style={{ width: '38%' }}>
                      Postulaciones
                    </th>
                    <th scope="col">Vacantes</th>
                    <th scope="col" style={{ width: '22%' }}>
                      Cobertura
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_CARGOS.map((item) => {
                    const cobertura = Math.min(100, Math.round((item.postulaciones / item.vacantes) * 100));
                    return (
                      <tr key={item.cargo}>
                        <td>{item.cargo}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: 6 }} role="progressbar" aria-label={`Postulaciones para ${item.cargo}`} aria-valuenow={item.postulaciones} aria-valuemin={0} aria-valuemax={item.vacantes}>
                              <div
                                className={`progress-bar ${cobertura >= 100 ? 'bg-success' : 'bg-aqua-primary'}`}
                                style={{ width: `${cobertura}%` }}
                              />
                            </div>
                            <span className="text-muted-aqua small">{item.postulaciones}</span>
                          </div>
                        </td>
                        <td className="text-muted-aqua">{item.vacantes}</td>
                        <td>
                          <span className={`badge-estado ${cobertura >= 100 ? 'badge-estado-apto' : 'badge-estado-pendiente'}`}>
                            {cobertura}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}