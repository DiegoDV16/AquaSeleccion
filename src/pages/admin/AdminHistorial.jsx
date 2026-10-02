import { useMemo, useState } from 'react';

import PageHeader from '../../components/ui/PageHeader.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import TipoPostulacionBadge from '../../components/ui/TipoPostulacionBadge.jsx';
import { HISTORIAL_SOLICITUDES, filtrarHistorial } from '../../mock/historialSolicitudes.js';
import { ESTADOS_SOLICITUD } from '../../mock/solicitudes.js';
import { TIPOS_GESTION } from '../../mock/historialSolicitudes.js';

/**
 * AdminHistorial
 * Trazabilidad de la tabla `historialsolicitudes`: cada fila es un movimiento
 * del ciclo de vida de una solicitud, con el usuario que lo ejecuto.
 */
export default function AdminHistorial() {
  const [filtros, setFiltros] = useState({ tipoGestion: 'todas', estado: 'todas', texto: '' });

  const movimientos = useMemo(() => filtrarHistorial(filtros), [filtros]);

  function actualizarFiltro(campo, valor) {
    setFiltros((actual) => ({ ...actual, [campo]: valor }));
  }

  return (
    <>
      <PageHeader
        etiqueta="Modulo Administrador"
        titulo="Historial de solicitudes"
        descripcion="Trazabilidad de movimientos sobre las solicitudes de evaluacion psicologica."
        acciones={
          <button type="button" className="btn btn-soft btn-sm" disabled title="Disponible con el controlador PHP">
            <i className="bi bi-download me-1" aria-hidden="true" />
            Exportar CSV
          </button>
        }
      />

      <div className="aqua-card">
        <div className="card-header">
          <div className="row g-2">
            <div className="col-lg-5">
              <label className="visually-hidden" htmlFor="busqueda-historial">
                Buscar en el historial
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white" aria-hidden="true">
                  <i className="bi bi-search" />
                </span>
                <input
                  type="search"
                  className="form-control"
                  id="busqueda-historial"
                  placeholder="Buscar por ID de solicitud o candidato"
                  value={filtros.texto}
                  onChange={(evento) => actualizarFiltro('texto', evento.target.value)}
                />
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <label className="visually-hidden" htmlFor="filtro-tipo">
                Tipo de gestion
              </label>
              <select
                className="form-select form-select-sm"
                id="filtro-tipo"
                value={filtros.tipoGestion}
                onChange={(evento) => actualizarFiltro('tipoGestion', evento.target.value)}
              >
                <option value="todas">Interna y externa</option>
                {TIPOS_GESTION.map((tipo) => (
                  <option key={tipo.clave} value={tipo.clave}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-6 col-lg-3">
              <label className="visually-hidden" htmlFor="filtro-estado-historial">
                Estado
              </label>
              <select
                className="form-select form-select-sm"
                id="filtro-estado-historial"
                value={filtros.estado}
                onChange={(evento) => actualizarFiltro('estado', evento.target.value)}
              >
                <option value="todos">Todos los estados</option>
                {ESTADOS_SOLICITUD.map((estado) => (
                  <option key={estado.clave} value={estado.clave}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-lg-1 d-flex align-items-center justify-content-lg-end text-muted-aqua">
              <small>{movimientos.length}</small>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table aqua-table mb-0">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">ID solicitud</th>
                <th scope="col">Candidato</th>
                <th scope="col">Tipo de gestión</th>
                <th scope="col">Movimiento</th>
                <th scope="col">Usuario</th>
                <th scope="col">Estado</th>
                <th scope="col">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((movimiento) => (
                <tr key={movimiento.id}>
                  <td className="text-muted-aqua">{movimiento.id}</td>
                  <td className="fw-semibold">{movimiento.solicitud_id}</td>
                  <td>{movimiento.candidato}</td>
                  <td>
                    <TipoPostulacionBadge tipo={movimiento.tipo_gestion} />
                  </td>
                  <td>
                    <span className="d-block">{movimiento.accion}</span>
                    <span className="d-block text-muted-aqua" style={{ fontSize: '0.76rem' }}>
                      {movimiento.detalle}
                    </span>
                  </td>
                  <td className="text-muted-aqua">{movimiento.usuario_accion}</td>
                  <td>
                    <EstadoBadge estado={movimiento.estado} />
                  </td>
                  <td className="text-muted-aqua small text-nowrap">{movimiento.fecha_movimiento}</td>
                </tr>
              ))}
              {movimientos.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted-aqua py-4">
                    No hay movimientos que coincidan con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white small text-muted-aqua">
          Mostrando {movimientos.length} de {HISTORIAL_SOLICITUDES.length} movimientos registrados.
        </div>
      </div>
    </>
  );
}