import { Link } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import { useAuth } from '../../context/AuthContext.js';
import { ACTIVIDAD_RECIENTE, TOP_CARGOS, distribucionPorEstado, distribucionPorFamilia, metricasDashboard } from '../../mock/metricas.js';
import { SOLICITUDES } from '../../mock/solicitudes.js';
import { obtenerCandidato, nombreCompleto } from '../../mock/candidatos.js';
import { obtenerUsuario } from '../../mock/usuarios.js';
import { obtenerCargo } from '../../mock/cargos.js';

/** Dashboard del modulo Administrador: resumen operativo del proceso. */
export default function AdminDashboard() {
  const { usuario } = useAuth();
  const metricas = metricasDashboard();
  const porEstado = distribucionPorEstado();
  const porFamilia = distribucionPorFamilia();

  const solicitudesRecientes = SOLICITUDES.slice(0, 5);
  const totalSolicitudes = SOLICITUDES.length;

  /** Ancho porcentual de cada barra de distribucion, respecto al mayor valor. */
  function anchoBarra(total, referencia) {
    return `${Math.round((total / referencia) * 100)}%`;
  }

  const maxFamilia = Math.max(...porFamilia.map((familia) => familia.total), 1);
  const maxDemanda = Math.max(...TOP_CARGOS.map((item) => item.postulaciones), 1);

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

        {/* Distribucion de solicitudes por estado */}
        <div className="col-lg-4">
          <div className="aqua-card h-100">
            <div className="card-header">
              <i className="bi bi-pie-chart me-2" aria-hidden="true" />
              Solicitudes por estado
            </div>
            <div className="card-body">
              {porEstado.map((item) => (
                <div className="dist-row" key={item.clave}>
                  <div className="dist-head">
                    <span className="dist-name">{item.nombre}</span>
                    <span className="dist-value">{item.total}</span>
                  </div>
                  <div
                    className="dist-bar"
                    role="progressbar"
                    aria-label={`${item.nombre}: ${item.total} solicitudes`}
                    aria-valuenow={item.total}
                    aria-valuemin={0}
                    aria-valuemax={totalSolicitudes}
                  >
                    <span style={{ width: anchoBarra(item.total, totalSolicitudes), backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
              <p className="text-muted-aqua mb-0 mt-3" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-info-circle me-1" aria-hidden="true" />
                {totalSolicitudes} solicitudes en total dentro del proceso simulado.
              </p>
            </div>
          </div>
        </div>

        {/* Postulaciones por familia de cargo */}
        <div className="col-lg-4">
          <div className="aqua-card h-100">
            <div className="card-header">
              <i className="bi bi-diagram-3 me-2" aria-hidden="true" />
              Postulaciones por familia
            </div>
            <div className="card-body">
              {porFamilia.map((familia) => (
                <div className="dist-row" key={familia.clave}>
                  <div className="dist-head">
                    <span className="dist-name">{familia.nombre}</span>
                    <span className="dist-value">{familia.total}</span>
                  </div>
                  <div
                    className="dist-bar"
                    role="progressbar"
                    aria-label={`${familia.nombre}: ${familia.total} postulaciones`}
                    aria-valuenow={familia.total}
                    aria-valuemin={0}
                    aria-valuemax={maxFamilia}
                  >
                    <span
                      style={{
                        width: anchoBarra(familia.total, maxFamilia),
                        backgroundColor: 'var(--aqua-solid-info)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cargos con mayor demanda */}
        <div className="col-lg-4">
          <div className="aqua-card h-100">
            <div className="card-header">
              <i className="bi bi-graph-up-arrow me-2" aria-hidden="true" />
              Cargos con mayor demanda
            </div>
            <div className="card-body">
              {TOP_CARGOS.map((item) => {
                const cobertura = Math.min(100, Math.round((item.postulaciones / item.vacantes) * 100));
                return (
                  <div className="dist-row" key={item.cargo}>
                    <div className="dist-head">
                      <span className="dist-name">{item.cargo}</span>
                      <span className={`badge-estado ${cobertura >= 100 ? 'badge-estado-apto' : 'badge-estado-pendiente'}`}>
                        {item.postulaciones}/{item.vacantes}
                      </span>
                    </div>
                    <div
                      className="dist-bar"
                      role="progressbar"
                      aria-label={`Postulaciones para ${item.cargo}`}
                      aria-valuenow={item.postulaciones}
                      aria-valuemin={0}
                      aria-valuemax={item.vacantes}
                    >
                      <span
                        style={{
                          width: anchoBarra(item.postulaciones, maxDemanda),
                          backgroundColor:
                            cobertura >= 100 ? 'var(--aqua-solid-success)' : 'var(--aqua-solid-primary)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}