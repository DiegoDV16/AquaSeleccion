/**
 * ConfirmacionModal
 * Modal reutilizable para confirmar el resultado de una operacion exitosa
 * (crear, editar o eliminar). Mantiene el mismo lenguaje visual del modal de
 * "Solicitud creada" y evita dejar mensajes sueltos dentro de los formularios.
 */
export default function ConfirmacionModal({
  visible,
  titulo,
  children,
  acciones = [],
  icono = 'check-lg',
  tinte = 'bg-tint-success',
}) {
  if (!visible) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmacion-modal-titulo"
        style={{ zIndex: 1070 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center p-4">
              <span
                className={`stat-icon ${tinte} d-flex align-items-center justify-content-center mx-auto mb-3`}
                style={{ width: 60, height: 60, fontSize: '1.8rem' }}
                aria-hidden="true"
              >
                <i className={`bi bi-${icono}`} />
              </span>
              <h2 className="h5 fw-semibold mb-2" id="confirmacion-modal-titulo">
                {titulo}
              </h2>
              <div className="text-muted-aqua small">{children}</div>
            </div>

            {acciones.length > 0 && (
              <div className="modal-footer justify-content-center border-0 pt-0">
                {acciones.map((accion, indice) => (
                  <button
                    key={`${accion.etiqueta}-${indice}`}
                    type="button"
                    className={`btn ${accion.variante ?? 'btn-soft'}`}
                    onClick={accion.onClick}
                  >
                    {accion.icono && <i className={`bi bi-${accion.icono} me-1`} aria-hidden="true" />}
                    {accion.etiqueta}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1065 }} />
    </>
  );
}
