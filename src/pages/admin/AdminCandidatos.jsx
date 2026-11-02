import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import TipoPostulacionBadge from '../../components/ui/TipoPostulacionBadge.jsx';
import VisorCvModal from '../../components/ui/VisorCvModal.jsx';
import PostulacionInternaModal from '../../components/candidatos/PostulacionInternaModal.jsx';
import { formatearFecha } from '../../mock/solicitudes.js';
import { listarCandidatos } from '../../services/candidatosApi.js';

const ESTADOS_CANDIDATO = {
  pendiente: { nombre: 'Pendiente', clase: 'badge-estado-pendiente' },
  en_proceso: { nombre: 'En proceso', clase: 'badge-estado-proceso' },
  apto: { nombre: 'Apto', clase: 'badge-estado-apto' },
  no_apto: { nombre: 'No apto', clase: 'badge-estado-noapto' },
  con_observaciones: { nombre: 'Con observaciones', clase: 'badge-estado-observaciones' },
};

/**
 * AdminCandidatos
 * Vista de solo lectura de los candidatos registrados. El Administrador puede
 * revisar la ficha y previsualizar o descargar el CV con el mismo visor del
 * modulo Analista.
 */
export default function AdminCandidatos() {
  const [candidatos, setCandidatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [candidatoCv, setCandidatoCv] = useState(null);
  const [mostrarPostulacion, setMostrarPostulacion] = useState(false);
  const [parametros, setParametros] = useSearchParams();

  const cargarCandidatos = useCallback(async () => {
    setCargando(true);
    setError('');

    const datos = await listarCandidatos();

    if (!datos?.ok) {
      setError(datos?.mensaje ?? 'No se pudieron cargar los candidatos.');
      setCandidatos([]);
    } else {
      setCandidatos(datos.candidatos ?? []);
    }

    setCargando(false);
  }, []);

  useEffect(() => {
    cargarCandidatos();
  }, [cargarCandidatos]);

  useEffect(() => {
    if (parametros.get('nueva') !== '1') return;

    setMostrarPostulacion(true);
    const siguientes = new URLSearchParams(parametros);
    siguientes.delete('nueva');
    setParametros(siguientes, { replace: true });
  }, [parametros, setParametros]);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return candidatos.filter((candidato) => {
      const coincideTexto =
        texto === '' ||
        String(candidato.nombreCompleto ?? '').toLowerCase().includes(texto) ||
        String(candidato.correo ?? '').toLowerCase().includes(texto) ||
        String(candidato.telefono ?? '').toLowerCase().includes(texto);
      const coincideTipo = filtroTipo === 'todas' || candidato.tipoPostulacion === filtroTipo;

      return coincideTexto && coincideTipo;
    });
  }, [candidatos, busqueda, filtroTipo]);

  const totalExternas = candidatos.filter((candidato) => candidato.tipoPostulacion === 'externa').length;
  const totalInternas = candidatos.filter((candidato) => candidato.tipoPostulacion === 'interna').length;

  return (
    <>
      <PageHeader
        etiqueta="Modulo Administrador"
        titulo="Candidatos registrados"
        descripcion={`${candidatos.length} postulaciones en el sistema (${totalExternas} externas y ${totalInternas} internas)`}
        acciones={
          <button
            type="button"
            className="btn btn-aqua btn-sm"
            onClick={() => setMostrarPostulacion(true)}
          >
            <i className="bi bi-person-plus me-1" aria-hidden="true" />
            Nueva postulación interna
          </button>
        }
      />

      <div className="aqua-card">
        <div className="card-header">
          <div className="row g-2">
            <div className="col-lg-6">
              <label className="visually-hidden" htmlFor="busqueda-candidatos-admin">
                Buscar candidatos
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white" aria-hidden="true">
                  <i className="bi bi-search" />
                </span>
                <input
                  type="search"
                  className="form-control"
                  id="busqueda-candidatos-admin"
                  placeholder="Buscar por nombre, correo o telefono"
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                />
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <label className="visually-hidden" htmlFor="filtro-origen-admin">
                Filtrar por origen
              </label>
              <select
                className="form-select form-select-sm"
                id="filtro-origen-admin"
                value={filtroTipo}
                onChange={(evento) => setFiltroTipo(evento.target.value)}
              >
                <option value="todas">Internas y externas</option>
                <option value="externa">Solo externas</option>
                <option value="interna">Solo internas</option>
              </select>
            </div>
            <div className="col-lg-3 d-flex align-items-center justify-content-lg-end text-muted-aqua">
              <small>{visibles.length} resultados</small>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="card-body text-center py-5 text-muted-aqua">
            <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
            <p className="mb-0 small">Cargando candidatos...</p>
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
              <button type="button" className="btn btn-soft btn-sm" onClick={cargarCandidatos}>
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table aqua-table mb-0">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Candidato</th>
                  <th scope="col">Origen</th>
                  <th scope="col">Cargo postulado</th>
                  <th scope="col">Postulacion</th>
                  <th scope="col">Estado</th>
                  <th scope="col">CV</th>
                  <th scope="col" className="text-end">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((candidato) => {
                  const estado = ESTADOS_CANDIDATO[candidato.estado] ?? ESTADOS_CANDIDATO.pendiente;

                  return (
                    <tr key={candidato.id}>
                      <td className="text-muted-aqua">{candidato.id}</td>
                      <td>
                        <span className="fw-semibold">{candidato.nombreCompleto}</span>
                        <span className="d-block text-muted-aqua" style={{ fontSize: '0.78rem' }}>
                          {candidato.correo} &middot; {candidato.telefono ?? 'sin telefono'}
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
                      <td className="text-muted-aqua small text-nowrap">
                        {formatearFecha(candidato.fechaPostulacion)}
                      </td>
                      <td>
                        <span className={`badge badge-estado ${estado.clase}`}>{estado.nombre}</span>
                      </td>
                      <td className="small text-muted-aqua text-truncate" style={{ maxWidth: 140 }}>
                        {candidato.cvArchivo ? candidato.cvArchivo.split('/').pop() : 'No aplica'}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-soft"
                            onClick={() => setCandidatoCv(candidato)}
                            disabled={!candidato.cvArchivo}
                            title={candidato.cvArchivo ? 'Previsualizar y descargar CV' : 'Sin CV adjunto'}
                          >
                            <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted-aqua py-4">
                      No hay candidatos que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <VisorCvModal candidato={candidatoCv} visible={Boolean(candidatoCv)} onCerrar={() => setCandidatoCv(null)} />

      {mostrarPostulacion && (
        <PostulacionInternaModal
          visible
          onCerrar={() => setMostrarPostulacion(false)}
          onGuardado={cargarCandidatos}
        />
      )}
    </>
  );
}
