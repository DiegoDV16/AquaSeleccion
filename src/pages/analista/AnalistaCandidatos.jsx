import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import TipoPostulacionBadge from '../../components/ui/TipoPostulacionBadge.jsx';
import VisorCvModal from '../../components/ui/VisorCvModal.jsx';
import { CANDIDATOS } from '../../mock/candidatos.js';
import { obtenerCargo } from '../../mock/cargos.js';
import { formatearFecha } from '../../mock/solicitudes.js';

const ESTADO_CANDIDATO = {
  pendiente: { nombre: 'Pendiente', clase: 'badge-estado-pendiente' },
  en_proceso: { nombre: 'En proceso', clase: 'badge-estado-proceso' },
  apto: { nombre: 'Apto', clase: 'badge-estado-apto' },
  no_apto: { nombre: 'No apto', clase: 'badge-estado-noapto' },
};

/** Listado de candidatos registrados: detalle y previsualizacion del CV. */
export default function AnalistaCandidatos() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [candidatoCv, setCandidatoCv] = useState(null);
  const [detalle, setDetalle] = useState(null);

  const candidatos = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return CANDIDATOS.filter((candidato) => {
      const coincideTexto =
        texto === '' ||
        `${candidato.nombres} ${candidato.apellido_paterno} ${candidato.apellido_materno ?? ''}`
          .toLowerCase()
          .includes(texto) ||
        candidato.correo.toLowerCase().includes(texto);
      const coincideTipo = filtroTipo === 'todas' || candidato.tipo_postulacion === filtroTipo;
      return coincideTexto && coincideTipo;
    });
  }, [busqueda, filtroTipo]);

  return (
    <>
      <PageHeader
        etiqueta="Modulo Analista"
        titulo="Candidatos registrados"
        descripcion={`${CANDIDATOS.length} postulaciones en el sistema - internas y externas`}
        acciones={
          <Link to="/analista/nueva-solicitud" className="btn btn-aqua btn-sm">
            <i className="bi bi-file-earmark-plus me-1" aria-hidden="true" />
            Nueva solicitud de evaluación
          </Link>
        }
      />

      <div className="aqua-card">
        <div className="card-header">
          <div className="row g-2">
            <div className="col-lg-6">
              <label className="visually-hidden" htmlFor="busqueda-candidatos">
                Buscar candidatos
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white" aria-hidden="true">
                  <i className="bi bi-search" />
                </span>
                <input
                  type="search"
                  className="form-control"
                  id="busqueda-candidatos"
                  placeholder="Buscar por nombre o correo"
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                />
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <label className="visually-hidden" htmlFor="filtro-origen">
                Filtrar por origen
              </label>
              <select
                className="form-select form-select-sm"
                id="filtro-origen"
                value={filtroTipo}
                onChange={(evento) => setFiltroTipo(evento.target.value)}
              >
                <option value="todas">Internas y externas</option>
                <option value="externa">Solo externas</option>
                <option value="interna">Solo internas</option>
              </select>
            </div>
            <div className="col-lg-3 d-flex align-items-center justify-content-lg-end text-muted-aqua">
              <small>{candidatos.length} resultados</small>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table aqua-table mb-0">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Candidato</th>
                <th scope="col">Origen</th>
                <th scope="col">Cargo postulado</th>
                <th scope="col">Postulación</th>
                <th scope="col">Estado</th>
                <th scope="col">CV</th>
                <th scope="col" className="text-end">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {candidatos.map((candidato) => {
                const cargo = obtenerCargo(candidato.cargo_id);
                const estado = ESTADO_CANDIDATO[candidato.estado] ?? ESTADO_CANDIDATO.pendiente;
                return (
                  <tr key={candidato.id}>
                    <td className="text-muted-aqua">{candidato.id}</td>
                    <td>
                      <span className="fw-semibold">
                        {candidato.nombres} {candidato.apellido_paterno}
                      </span>
                      <span className="d-block text-muted-aqua" style={{ fontSize: '0.78rem' }}>
                        {candidato.correo} &middot; {candidato.telefono ?? 'sin teléfono'}
                      </span>
                    </td>
                    <td>
                      <TipoPostulacionBadge tipo={candidato.tipo_postulacion} />
                    </td>
                    <td className="text-muted-aqua">{cargo ? cargo.nombre : '-'}</td>
                    <td className="text-muted-aqua small text-nowrap">{formatearFecha(candidato.fecha_postulacion)}</td>
                    <td>
                      <span className={`badge badge-estado ${estado.clase}`}>{estado.nombre}</span>
                    </td>
                    <td className="small text-muted-aqua">{candidato.cv_archivo ?? 'No aplica'}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-soft"
                          onClick={() => setDetalle(candidato)}
                          title="Ver detalle"
                        >
                          <i className="bi bi-eye" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-soft"
                          onClick={() => setCandidatoCv(candidato)}
                          title={candidato.cv_archivo ? 'Previsualizar CV' : 'Postulación interna sin CV'}
                        >
                          <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                        </button>
                        <button type="button" className="btn btn-soft" title="Descargar CV" disabled={!candidato.cv_archivo}>
                          <i className="bi bi-download" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {candidatos.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted-aqua py-4">
                    No hay candidatos que coincidan con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalle del candidato */}
      {detalle && (
        <>
          <div
            className="modal fade show d-block"
            id="detalle-candidato"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalle-candidato-titulo"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="detalle-candidato-titulo">
                    <i className="bi bi-person-vcard me-2" aria-hidden="true" />
                    {detalle.nombres} {detalle.apellido_paterno} {detalle.apellido_materno}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setDetalle(null)} aria-label="Cerrar" />
                </div>
                <div className="modal-body">
                  <div className="row g-3 small">
                    <div className="col-md-6">
                      <p className="text-muted-aqua mb-1">Correo</p>
                      <p className="mb-3">{detalle.correo}</p>
                      <p className="text-muted-aqua mb-1">Teléfono</p>
                      <p className="mb-3">{detalle.telefono ?? '-'}</p>
                      <p className="text-muted-aqua mb-1">Origen de la postulación</p>
                      <p className="mb-3">
                        <TipoPostulacionBadge tipo={detalle.tipo_postulacion} />
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted-aqua mb-1">Cargo postulado</p>
                      <p className="mb-3">{obtenerCargo(detalle.cargo_id)?.nombre ?? '-'}</p>
                      {detalle.cargo_actual && (
                        <>
                          <p className="text-muted-aqua mb-1">Cargo actual</p>
                          <p className="mb-3">{detalle.cargo_actual}</p>
                        </>
                      )}
                      <p className="text-muted-aqua mb-1">Etapa del proceso</p>
                      <p className="mb-0">
                        <EstadoBadge
                          estado={
                            detalle.estado === 'pendiente'
                              ? 'pendiente'
                              : detalle.estado === 'en_proceso'
                                ? 'en_proceso'
                                : 'finalizada'
                          }
                        />
                      </p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-soft" onClick={() => setDetalle(null)}>
                    Cerrar
                  </button>
                  <button
                    type="button"
                    className="btn btn-aqua"
                    onClick={() => {
                      setDetalle(null);
                      setCandidatoCv(detalle);
                    }}
                  >
                    <i className="bi bi-file-earmark-pdf me-1" aria-hidden="true" />
                    Ver CV
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      <VisorCvModal candidato={candidatoCv} visible={Boolean(candidatoCv)} onCerrar={() => setCandidatoCv(null)} />
    </>
  );
}