import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import ResultadoBadge from '../../components/ui/ResultadoBadge.jsx';
import TipoPostulacionBadge from '../../components/ui/TipoPostulacionBadge.jsx';
import VisorCvModal from '../../components/ui/VisorCvModal.jsx';
import { ESTADOS_SOLICITUD, SOLICITUDES, formatearFecha } from '../../mock/solicitudes.js';
import { obtenerCandidato, nombreCompleto } from '../../mock/candidatos.js';
import { obtenerUsuario } from '../../mock/usuarios.js';
import { obtenerCargo } from '../../mock/cargos.js';

const PRIORIDAD = {
  alta: { nombre: 'Alta', clase: 'badge-estado-noapto' },
  normal: { nombre: 'Normal', clase: 'badge-estado-inactivo' },
  baja: { nombre: 'Baja', clase: 'badge-estado-inactivo' },
};

/** Tabla general de solicitudes con filtros estaticos por estado. */
export default function AnalistaSolicitudes() {
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [candidatoCv, setCandidatoCv] = useState(null);

  const solicitudes = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return SOLICITUDES.filter((solicitud) => {
      const candidato = obtenerCandidato(solicitud.candidato_id);
      const coincideEstado = filtroEstado === 'todas' || solicitud.estado === filtroEstado;
      const coincideTexto =
        texto === '' ||
        solicitud.id.toLowerCase().includes(texto) ||
        nombreCompleto(candidato).toLowerCase().includes(texto);
      return coincideEstado && coincideTexto;
    });
  }, [filtroEstado, busqueda]);

  const resumen = useMemo(
    () =>
      ESTADOS_SOLICITUD.map((estado) => ({
        ...estado,
        total: SOLICITUDES.filter((solicitud) => solicitud.estado === estado.clave).length,
      })),
    [],
  );

  return (
    <>
      <PageHeader
        etiqueta="Modulo Analista"
        titulo="Solicitudes de evaluación"
        descripcion="Vínculo entre candidatos y evaluadores responsables del proceso."
        acciones={
          <Link to="/analista/nueva-solicitud" className="btn btn-aqua btn-sm">
            <i className="bi bi-file-earmark-plus me-1" aria-hidden="true" />
            Nueva solicitud
          </Link>
        }
      />

      {/* Filtros rapidos */}
      <div className="row g-2 mb-3">
        <div className="col-12">
          <div className="btn-group flex-wrap" role="group" aria-label="Filtrar solicitudes por estado">
            <button
              type="button"
              className={`btn btn-sm ${filtroEstado === 'todas' ? 'btn-aqua' : 'btn-soft'}`}
              onClick={() => setFiltroEstado('todas')}
            >
              Todas ({SOLICITUDES.length})
            </button>
            {resumen.map((estado) => (
              <button
                key={estado.clave}
                type="button"
                className={`btn btn-sm ${filtroEstado === estado.clave ? 'btn-aqua' : 'btn-soft'}`}
                onClick={() => setFiltroEstado(estado.clave)}
              >
                {estado.nombre} ({estado.total})
              </button>
            ))}
          </div>
        </div>
        <div className="col-md-8 col-lg-6">
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
              placeholder="Buscar por ID de solicitud o candidato"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="aqua-card">
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
              {solicitudes.map((solicitud) => {
                const candidato = obtenerCandidato(solicitud.candidato_id);
                const evaluador = obtenerUsuario(solicitud.evaluador_id);
                const cargo = obtenerCargo(solicitud.cargo_id);
                const prioridad = PRIORIDAD[solicitud.prioridad] ?? PRIORIDAD.normal;
                return (
                  <tr key={solicitud.id}>
                    <td className="fw-semibold text-nowrap">{solicitud.id}</td>
                    <td>
                      <span className="fw-semibold">{nombreCompleto(candidato)}</span>
                      <span className="d-block text-muted-aqua" style={{ fontSize: '0.78rem' }}>
                        Creada el {formatearFecha(solicitud.fecha_creacion)}
                      </span>
                    </td>
                    <td>
                      <TipoPostulacionBadge tipo={candidato?.tipo_postulacion ?? 'externa'} />
                    </td>
                    <td className="text-muted-aqua">{cargo ? cargo.nombre : '-'}</td>
                    <td className="text-muted-aqua">{evaluador ? evaluador.nombre : 'Sin asignar'}</td>
                    <td>
                      <span className={`badge badge-estado ${prioridad.clase}`}>{prioridad.nombre}</span>
                    </td>
                    <td>
                      <EstadoBadge estado={solicitud.estado} />
                    </td>
                    <td>
                      <ResultadoBadge resultado={solicitud.resultado} />
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-soft"
                          onClick={() => setCandidatoCv(candidato)}
                          title="Ver CV del candidato"
                        >
                          <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                        </button>
                        <Link
                          to={`/evaluador/evaluar/${solicitud.id}`}
                          className="btn btn-soft"
                          title="Abrir formulario de evaluacion"
                        >
                          <i className="bi bi-clipboard2-check" aria-hidden="true" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {solicitudes.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted-aqua py-4">
                    No hay solicitudes que coincidan con el estado seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VisorCvModal candidato={candidatoCv} visible={Boolean(candidatoCv)} onCerrar={() => setCandidatoCv(null)} />
    </>
  );
}