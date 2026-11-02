import { nombreCompleto } from '../../mock/candidatos.js';
import { obtenerCargo, obtenerFamilia } from '../../mock/cargos.js';
import { formatearFecha } from '../../mock/solicitudes.js';
import TipoPostulacionBadge from './TipoPostulacionBadge.jsx';

/**
 * Ficha resumida del postulante: identidad, contacto y cargo evaluado.
 * Acepta tanto candidatos del backend (cargo/familia ya resueltos) como los
 * datos simulados anteriores (cargo_id).
 */
export default function FichaPostulante({ candidato, titulo = 'Datos del postulante', onCvPreview, onCvDownload, onCvTestDownload }) {
  if (!candidato) {
    return (
      <div className="alert alert-warning mb-0" role="alert">
        No se encontro informacion del postulante asociado a la solicitud.
      </div>
    );
  }

  const cargoSimulado = obtenerCargo(candidato.cargo_id);
  const nombreCargo = candidato.cargo ?? (cargoSimulado ? cargoSimulado.nombre : '-');
  const nombreFamilia =
    candidato.familiaCargo ??
    (cargoSimulado ? (obtenerFamilia(cargoSimulado.familia_id)?.nombre ?? '-') : '-');
  const nombre = candidato.nombreCompleto ?? nombreCompleto(candidato);
  const fechaPostulacion = candidato.fechaPostulacion ?? candidato.fecha_postulacion;

  return (
    <>
    <div className="aqua-card ficha-postulante">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>
          <i className="bi bi-person-vcard me-2" aria-hidden="true" />
          {titulo}
        </span>
        <TipoPostulacionBadge tipo={candidato.tipoPostulacion ?? candidato.tipo_postulacion} />
      </div>
      <div className="card-body">
        <dl className="row mb-0 small">
          <dt className="col-sm-5 text-muted-aqua fw-semibold">Nombre completo</dt>
          <dd className="col-sm-7">{nombre}</dd>

          <dt className="col-sm-5 text-muted-aqua fw-semibold">Correo</dt>
          <dd className="col-sm-7">{candidato.correo}</dd>

          <dt className="col-sm-5 text-muted-aqua fw-semibold">Telefono</dt>
          <dd className="col-sm-7">{candidato.telefono ?? '-'}</dd>

          <dt className="col-sm-5 text-muted-aqua fw-semibold">Familia de cargo</dt>
          <dd className="col-sm-7">{nombreFamilia}</dd>

          <dt className="col-sm-5 text-muted-aqua fw-semibold">Cargo evaluado</dt>
          <dd className="col-sm-7">{nombreCargo}</dd>

          {candidato.cargo_actual && (
            <>
              <dt className="col-sm-5 text-muted-aqua fw-semibold">Cargo actual</dt>
              <dd className="col-sm-7">{candidato.cargo_actual}</dd>
            </>
          )}

          <dt className="col-sm-5 text-muted-aqua fw-semibold">Fecha de postulacion</dt>
          <dd className="col-sm-7 mb-0">{formatearFecha(fechaPostulacion)}</dd>
        </dl>

        {candidato.cv_archivo || candidato.cvArchivo ? (
          <div className="cv-postulante border-top mt-3 pt-3">
            <div className="d-flex align-items-center gap-2">
              <span className="cv-file-icon" aria-hidden="true">
                <i className="bi bi-file-earmark-pdf" />
              </span>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <span className="d-block small fw-semibold">Currículum Vitae</span>
                <span className="d-block text-muted-aqua text-truncate" style={{ fontSize: '0.76rem' }}>
                  Documento adjunto ·{' '}
                  {(candidato.cv_archivo || candidato.cvArchivo).split('.').pop().toUpperCase()}
                </span>
              </div>
              {onCvPreview && (
                <button type="button" className="btn btn-soft btn-sm" onClick={onCvPreview}>
                  <i className="bi bi-eye me-1" aria-hidden="true" />
                  Ver
                </button>
              )}
            </div>
            {onCvDownload && (
              <button type="button" className="btn btn-aqua btn-sm w-100 mt-2" onClick={onCvDownload}>
                <i className="bi bi-download me-1" aria-hidden="true" />
                Descargar CV
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
    {(candidato.cv_archivo || candidato.cvArchivo) && onCvTestDownload && (
      <button
        type="button"
        className="cv-prueba-link"
        onClick={onCvTestDownload}
      >
        CV de prueba
      </button>
    )}
    </>
  );
}
