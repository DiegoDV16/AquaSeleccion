import EstadoBadge from './EstadoBadge.jsx';
import TipoPostulacionBadge from './TipoPostulacionBadge.jsx';

function formatearFechaHora(valor) {
  if (!valor) return '-';

  const [fecha, hora = ''] = String(valor).split(' ');
  const [anio, mes, dia] = fecha.split('-');

  return `${dia}/${mes}/${anio}${hora ? ` ${hora.slice(0, 5)}` : ''}`;
}

/**
 * DetalleMovimientoModal
 * Muestra toda la informacion disponible de un movimiento del historial.
 */
export default function DetalleMovimientoModal({ movimiento, visible, onCerrar }) {
  if (!visible || !movimiento) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-movimiento-titulo"
        style={{ zIndex: 1070 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="detalle-movimiento-titulo">
                <i className="bi bi-clock-history me-2" aria-hidden="true" />
                Detalle del movimiento
              </h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar} />
            </div>

            <div className="modal-body">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span className="badge rounded-pill bg-tint-primary">Movimiento #{movimiento.id}</span>
                <TipoPostulacionBadge tipo={movimiento.tipoGestion} />
                <EstadoBadge estado={movimiento.estado} />
              </div>

              <section className="ficha-seccion mt-0">
                <div className="ficha-seccion-titulo">
                  <i className="bi bi-activity" aria-hidden="true" />
                  Acción registrada
                </div>
                <div className="ficha-dato">
                  <span>Acción</span>
                  <span className="ficha-dato-valor">{movimiento.accion}</span>
                </div>
                <div className="ficha-dato">
                  <span>Detalle</span>
                  <span className="ficha-dato-valor">
                    {movimiento.detalle || 'Sin detalle adicional.'}
                  </span>
                </div>
              </section>

              <section className="ficha-seccion mt-3">
                <div className="ficha-seccion-titulo">
                  <i className="bi bi-file-earmark-text" aria-hidden="true" />
                  Solicitud y candidato
                </div>
                <div className="ficha-dato">
                  <span>Solicitud</span>
                  <span className="ficha-dato-valor">{movimiento.solicitud}</span>
                </div>
                <div className="ficha-dato">
                  <span>Candidato</span>
                  <span className="ficha-dato-valor">{movimiento.candidato}</span>
                </div>
                <div className="ficha-dato">
                  <span>Cargo</span>
                  <span className="ficha-dato-valor">{movimiento.cargo || 'Sin cargo'}</span>
                </div>
                <div className="ficha-dato">
                  <span>ID del cargo</span>
                  <span className="ficha-dato-valor">{movimiento.idCargo ?? 'Sin ID'}</span>
                </div>
                <div className="ficha-dato">
                  <span>Tipo de gestión</span>
                  <span className="ficha-dato-valor">
                    {movimiento.tipoGestion === 'interna' ? 'Interna' : 'Externa'}
                  </span>
                </div>
              </section>

              <section className="ficha-seccion mt-3">
                <div className="ficha-seccion-titulo">
                  <i className="bi bi-person-badge" aria-hidden="true" />
                  Responsable y fecha
                </div>
                <div className="ficha-dato">
                  <span>Usuario</span>
                  <span className="ficha-dato-valor">{movimiento.usuario}</span>
                </div>
                <div className="ficha-dato">
                  <span>Fecha del movimiento</span>
                  <span className="ficha-dato-valor">{formatearFechaHora(movimiento.fecha)}</span>
                </div>
              </section>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-aqua btn-sm" onClick={onCerrar}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1065 }} />
    </>
  );
}
