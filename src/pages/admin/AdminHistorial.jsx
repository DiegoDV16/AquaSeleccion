import { useEffect, useState } from 'react';

import PageHeader from '../../components/ui/PageHeader.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import TipoPostulacionBadge from '../../components/ui/TipoPostulacionBadge.jsx';
import { ESTADOS_SOLICITUD } from '../../mock/solicitudes.js';
import { TIPOS_GESTION } from '../../mock/historialSolicitudes.js';
import { listarHistorial } from '../../services/historialApi.js';

function formatearFechaHora(valor) {
  if (!valor) return '-';

  const [fecha, hora = ''] = String(valor).split(' ');
  const [anio, mes, dia] = fecha.split('-');

  return `${dia}/${mes}/${anio}${hora ? ` ${hora.slice(0, 5)}` : ''}`;
}

function escaparCsv(valor) {
  let texto = String(valor ?? '');

  if (/^[=+\-@]/.test(texto)) {
    texto = `'${texto}`;
  }

  return `"${texto.replace(/"/g, '""')}"`;
}

function fechaArchivo() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');

  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

/**
 * AdminHistorial
 * Trazabilidad real de los movimientos del ciclo de vida de las solicitudes.
 */
export default function AdminHistorial() {
  const [filtros, setFiltros] = useState({
    tipoGestion: 'todas',
    estado: 'todos',
    texto: '',
    mes: '',
  });
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;

    setCargando(true);
    setError('');

    listarHistorial(filtros)
      .then((datos) => {
        if (!vigente) return;

        if (!datos?.ok) {
          setError(datos?.mensaje ?? 'No se pudo cargar el historial.');
          setMovimientos([]);
        } else {
          setMovimientos(datos.movimientos ?? []);
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [filtros, recarga]);

  function actualizarFiltro(campo, valor) {
    setFiltros((actual) => ({ ...actual, [campo]: valor }));
  }

  function exportarCsv() {
    if (movimientos.length === 0) return;

    const columnas = [
      'ID',
      'Solicitud',
      'Candidato',
      'Tipo de gestión',
      'Acción',
      'Detalle',
      'Usuario',
      'Estado',
      'Fecha',
    ];

    const filas = movimientos.map((movimiento) => [
      movimiento.id,
      movimiento.solicitud,
      movimiento.candidato,
      movimiento.tipoGestion,
      movimiento.accion,
      movimiento.detalle,
      movimiento.usuario,
      movimiento.estado,
      formatearFechaHora(movimiento.fecha),
    ]);

    const contenido = [columnas, ...filas]
      .map((fila) => fila.map(escaparCsv).join(';'))
      .join('\r\n');

    const blob = new Blob(['\uFEFF', contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `historial-solicitudes-${fechaArchivo()}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <>
      <PageHeader
        etiqueta="Modulo Administrador"
        titulo="Historial de solicitudes"
        descripcion="Trazabilidad de movimientos sobre las solicitudes de evaluación psicológica."
        acciones={
          <button
            type="button"
            className="btn btn-aqua btn-sm"
            onClick={exportarCsv}
            disabled={cargando || movimientos.length === 0}
            title={
              movimientos.length > 0
                ? `Exportar ${movimientos.length} movimientos filtrados`
                : 'No hay movimientos para exportar'
            }
          >
            <i className="bi bi-download me-1" aria-hidden="true" />
            Exportar CSV
          </button>
        }
      />

      <div className="aqua-card">
        <div className="card-header">
          <div className="row g-2">
            <div className="col-lg-4">
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
            <div className="col-sm-6 col-lg-2">
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
            <div className="col-sm-6 col-lg-2">
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
            <div className="col-sm-6 col-lg-3">
              <label className="visually-hidden" htmlFor="filtro-mes-historial">
                Mes del movimiento
              </label>
              <div className="input-group input-group-sm">
                <input
                  type="month"
                  className="form-control"
                  id="filtro-mes-historial"
                  value={filtros.mes}
                  onChange={(evento) => actualizarFiltro('mes', evento.target.value)}
                  title="Filtrar por mes"
                />
                {filtros.mes && (
                  <button
                    type="button"
                    className="btn btn-soft"
                    onClick={() => actualizarFiltro('mes', '')}
                    aria-label="Limpiar filtro de mes"
                    title="Limpiar mes"
                  >
                    <i className="bi bi-x-lg" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            <div className="col-sm-6 col-lg-1 d-flex align-items-center justify-content-lg-end text-muted-aqua">
              <small>{movimientos.length}</small>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="card-body text-center py-5 text-muted-aqua">
            <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
            <p className="mb-0 small">Cargando movimientos...</p>
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
              <button
                type="button"
                className="btn btn-soft btn-sm"
                onClick={() => setRecarga((valor) => valor + 1)}
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table aqua-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Solicitud</th>
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
                      <td className="fw-semibold text-nowrap">{movimiento.solicitud}</td>
                      <td>{movimiento.candidato}</td>
                      <td>
                        <TipoPostulacionBadge tipo={movimiento.tipoGestion} />
                      </td>
                      <td>
                        <span className="d-block">{movimiento.accion}</span>
                        <span className="d-block text-muted-aqua" style={{ fontSize: '0.76rem' }}>
                          {movimiento.detalle}
                        </span>
                      </td>
                      <td className="text-muted-aqua">{movimiento.usuario}</td>
                      <td>
                        <EstadoBadge estado={movimiento.estado} />
                      </td>
                      <td className="text-muted-aqua small text-nowrap">
                        {formatearFechaHora(movimiento.fecha)}
                      </td>
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
              Mostrando {movimientos.length} movimientos.
            </div>
          </>
        )}
      </div>
    </>
  );
}
