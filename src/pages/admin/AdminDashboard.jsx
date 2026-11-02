import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import { useAuth } from '../../context/AuthContext.js';
import { formatearFecha } from '../../mock/solicitudes.js';
import { obtenerResumenAdmin } from '../../services/adminApi.js';

const COLORES_ESTADO = {
  pendiente: 'var(--aqua-solid-warning)',
  en_proceso: 'var(--aqua-solid-primary)',
  finalizada: 'var(--aqua-solid-success)',
};

/** Dashboard del modulo Administrador con datos reales de MySQL. */
export default function AdminDashboard() {
  const { usuario } = useAuth();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);

  const cargarResumen = useCallback(async () => {
    setCargando(true);
    setError('');

    const respuesta = await obtenerResumenAdmin();

    if (!respuesta?.ok) {
      setError(respuesta?.mensaje ?? 'No se pudo cargar el resumen del panel.');
      setDatos(null);
    } else {
      setDatos(respuesta);
    }

    setCargando(false);
  }, []);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen, recarga]);

  if (cargando) {
    return (
      <>
        <PageHeader
          etiqueta="Modulo Administrador"
          titulo="Panel general de reclutamiento"
          descripcion="Cargando indicadores desde la base de datos..."
        />
        <div className="aqua-card">
          <div className="card-body text-center py-5 text-muted-aqua">
            <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
            <p className="mb-0 small">Cargando resumen del panel...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !datos) {
    return (
      <>
        <PageHeader
          etiqueta="Modulo Administrador"
          titulo="Panel general de reclutamiento"
          descripcion="No se pudo cargar el resumen operativo."
        />
        <div className="aqua-card">
          <div className="card-body text-center py-5">
            <i className="bi bi-exclamation-triangle fs-1 text-warning d-block mb-3" aria-hidden="true" />
            <p className="fw-semibold mb-1">Panel no disponible</p>
            <p className="text-muted-aqua small mb-3">{error || 'No se pudo obtener la informacion.'}</p>
            <button type="button" className="btn btn-aqua btn-sm" onClick={() => setRecarga((valor) => valor + 1)}>
              <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
              Reintentar
            </button>
          </div>
        </div>
      </>
    );
  }

  const resumen = datos.resumen ?? {};
  const recientes = datos.recientes ?? [];
  const actividad = datos.actividad ?? [];
  const totalSolicitudes = Number(resumen.solicitudes_total ?? 0);
  const totalCandidatos = Number(resumen.total_candidatos ?? 0);

  const porEstado = (datos.porEstado ?? []).map((item) => ({
    ...item,
    total: Number(item.total ?? 0),
  }));

  const porFamilia = (datos.porFamilia ?? []).map((item) => ({
    ...item,
    total: Number(item.total ?? 0),
  }));

  const topCargos = (datos.topCargos ?? []).map((item) => ({
    ...item,
    postulaciones: Number(item.postulaciones ?? 0),
  }));

  const metricas = [
    {
      clave: 'externas',
      titulo: 'Postulaciones externas',
      valor: resumen.externas ?? 0,
      pie: 'Registradas en el sistema',
      variacion: `${resumen.internas ?? 0} internas`,
      icono: 'envelope-paper',
      acento: 'var(--aqua-solid-primary)',
      tinte: 'bg-tint-primary',
    },
    {
      clave: 'internas',
      titulo: 'Postulaciones internas',
      valor: resumen.internas ?? 0,
      pie: 'Registradas en el sistema',
      variacion: `${resumen.externas ?? 0} externas`,
      icono: 'building',
      acento: 'var(--aqua-solid-info)',
      tinte: 'bg-tint-info',
    },
    {
      clave: 'proceso',
      titulo: 'Evaluaciones en proceso',
      valor: resumen.en_proceso ?? 0,
      pie: 'Con evaluación iniciada',
      variacion: `${resumen.pendientes ?? 0} pendientes`,
      icono: 'arrow-repeat',
      acento: 'var(--aqua-solid-warning)',
      tinte: 'bg-tint-warning',
    },
    {
      clave: 'finalizadas',
      titulo: 'Evaluaciones finalizadas',
      valor: resumen.finalizadas ?? 0,
      pie: 'Procesos cerrados',
      variacion: `${resumen.aptos ?? 0} con resultado apto`,
      icono: 'check-circle',
      acento: 'var(--aqua-solid-success)',
      tinte: 'bg-tint-success',
    },
    {
      clave: 'usuarios',
      titulo: 'Usuarios activos',
      valor: resumen.usuarios_activos ?? 0,
      pie: `${resumen.usuarios_total ?? 0} usuarios registrados`,
      variacion: 'Con acceso al sistema',
      icono: 'person-gear',
      acento: 'var(--aqua-solid-primary)',
      tinte: 'bg-tint-primary',
    },
    {
      clave: 'aprobacion',
      titulo: 'Tasa de aprobación',
      valor: `${resumen.tasa_aprobacion ?? 0}%`,
      pie: 'Sobre evaluaciones finalizadas',
      variacion: `${resumen.finalizadas ?? 0} evaluaciones`,
      icono: 'percent',
      acento: 'var(--aqua-solid-secondary)',
      tinte: 'bg-tint-info',
    },
  ];

  function anchoBarra(total, referencia) {
    if (!referencia || referencia <= 0) return '0%';
    return `${Math.round((total / referencia) * 100)}%`;
  }

  const maxFamilia = Math.max(...porFamilia.map((familia) => familia.total), 1);
  const maxCargo = Math.max(...topCargos.map((item) => item.postulaciones), 1);

  return (
    <>
      <PageHeader
        etiqueta="Modulo Administrador"
        titulo="Panel general de reclutamiento"
        descripcion={`Sesion activa: ${usuario?.nombre ?? 'Administrador'} · ${totalSolicitudes} solicitudes y ${totalCandidatos} candidatos registrados.`}
        acciones={
          <>
            <button type="button" className="btn btn-soft btn-sm" onClick={() => setRecarga((valor) => valor + 1)}>
              <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
              Actualizar
            </button>
            <Link to="/admin/candidatos?nueva=1" className="btn btn-aqua btn-sm">
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

      <div className="row g-3 mb-4">
        {metricas.map((metrica) => (
          <div className="col-sm-6 col-xl-4" key={metrica.clave}>
            <StatCard {...metrica} />
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="aqua-card dashboard-recent-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-file-earmark-text me-2" aria-hidden="true" />
                Solicitudes recientes
              </span>
              <span className="text-muted-aqua" style={{ fontSize: '0.78rem' }}>
                Ultimas {recientes.length} de {totalSolicitudes}
              </span>
            </div>
            <div className="card-body">
              {recientes.length === 0 ? (
                <div className="text-center py-4 text-muted-aqua">
                  <i className="bi bi-inbox fs-3 d-block mb-2" aria-hidden="true" />
                  <p className="small mb-0">No hay solicitudes registradas.</p>
                </div>
              ) : (
                <div className="dashboard-request-list">
                  {recientes.map((solicitud) => {
                    const candidato = solicitud.candidato ?? {};
                    const codigo = `SOL-${String(solicitud.id).padStart(4, '0')}`;

                    return (
                      <article className="dashboard-request-item" key={solicitud.id}>
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div style={{ minWidth: 0 }}>
                            <span className="dashboard-code">{codigo}</span>
                            <h6 className="mb-1 text-truncate" title={candidato.nombreCompleto ?? ''}>
                              {candidato.nombreCompleto ?? 'Sin nombre'}
                            </h6>
                            <p className="text-muted-aqua small mb-0 text-truncate">
                              {candidato.cargo ?? '-'}
                            </p>
                          </div>
                          <div className="d-flex flex-column align-items-end gap-2">
                            <EstadoBadge estado={solicitud.estado} />
                            <Link
                              to="/admin/candidatos"
                              className="btn btn-soft btn-sm"
                              aria-label={`Ver candidatos de ${codigo}`}
                              title="Ver candidatos"
                            >
                              <i className="bi bi-eye" aria-hidden="true" />
                            </Link>
                          </div>
                        </div>

                        <div className="dashboard-request-meta">
                          <span className="text-truncate">
                            <i className="bi bi-person-badge me-1" aria-hidden="true" />
                            {solicitud.evaluador?.nombre ?? 'Sin evaluador asignado'}
                          </span>
                          <span>
                            <i className="bi bi-calendar3 me-1" aria-hidden="true" />
                            {formatearFecha(solicitud.fechaSolicitud)}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="dashboard-panel-footer">
                <span>Mostrando {recientes.length} de {totalSolicitudes}</span>
                <Link to="/admin/candidatos" className="btn btn-soft btn-sm">
                  Ver candidatos
                  <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="aqua-card h-100 dashboard-panel-card">
            <div className="card-header">
              <i className="bi bi-activity me-2" aria-hidden="true" />
              Actividad reciente
            </div>
            <div className="card-body">
              {actividad.length === 0 ? (
                <div className="text-center py-4 text-muted-aqua">
                  <i className="bi bi-inbox fs-3 d-block mb-2" aria-hidden="true" />
                  <p className="small mb-0">Aun no hay movimientos registrados.</p>
                </div>
              ) : (
                <div className="dashboard-activity-list">
                  {actividad.map((evento) => (
                    <article className="dashboard-activity-item" key={evento.id}>
                      <span
                        className={`stat-icon ${evento.tinte}`}
                        style={{ width: 32, height: 32, flexBasis: 32, fontSize: '0.85rem' }}
                        aria-hidden="true"
                      >
                        <i className={`bi bi-${evento.icono}`} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p className="mb-1 fw-semibold small">{evento.titulo}</p>
                        <p className="mb-1 text-muted-aqua" style={{ fontSize: '0.8rem' }}>
                          {evento.detalle}
                        </p>
                        <p className="mb-0 text-muted-aqua fst-italic" style={{ fontSize: '0.74rem' }}>
                          {formatearFecha(evento.fecha)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="aqua-card h-100 dashboard-panel-card">
            <div className="card-header">
              <i className="bi bi-pie-chart me-2" aria-hidden="true" />
              Solicitudes por estado
            </div>
            <div className="card-body">
              {porEstado.map((item) => (
                <div className="dist-row dashboard-dist-item" key={item.clave}>
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
                    aria-valuemax={Math.max(totalSolicitudes, 1)}
                  >
                    <span
                      style={{
                        width: anchoBarra(item.total, totalSolicitudes),
                        backgroundColor: COLORES_ESTADO[item.clave],
                      }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-muted-aqua mb-0 mt-3" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-info-circle me-1" aria-hidden="true" />
                {totalSolicitudes} solicitudes registradas en el sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="aqua-card h-100 dashboard-panel-card">
            <div className="card-header">
              <i className="bi bi-diagram-3 me-2" aria-hidden="true" />
              Postulaciones por familia
            </div>
            <div className="card-body">
              {porFamilia.length === 0 ? (
                <p className="text-muted-aqua small mb-0">Sin postulaciones registradas.</p>
              ) : (
                porFamilia.map((familia) => (
                  <div className="dist-row dashboard-dist-item" key={familia.clave}>
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
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="aqua-card h-100 dashboard-panel-card">
            <div className="card-header">
              <i className="bi bi-graph-up-arrow me-2" aria-hidden="true" />
              Cargos con mayor demanda
            </div>
            <div className="card-body">
              {topCargos.length === 0 ? (
                <p className="text-muted-aqua small mb-0">Sin postulaciones registradas.</p>
              ) : (
                topCargos.map((item) => (
                  <div className="dist-row dashboard-dist-item" key={item.clave}>
                    <div className="dist-head">
                      <span className="dist-name">{item.nombre}</span>
                      <span className="badge-estado badge-estado-inactivo">{item.postulaciones}</span>
                    </div>
                    <div
                      className="dist-bar"
                      role="progressbar"
                      aria-label={`${item.postulaciones} postulaciones para ${item.nombre}`}
                      aria-valuenow={item.postulaciones}
                      aria-valuemin={0}
                      aria-valuemax={maxCargo}
                    >
                      <span
                        style={{
                          width: anchoBarra(item.postulaciones, maxCargo),
                          backgroundColor: 'var(--aqua-solid-primary)',
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
