import { nombreCompleto } from '../../mock/candidatos.js';
import { obtenerCargo, obtenerFamilia } from '../../mock/cargos.js';
import { formatearFecha } from '../../mock/solicitudes.js';
import TipoPostulacionBadge from './TipoPostulacionBadge.jsx';

function iniciales(nombre = '') {
  return String(nombre)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase() || '?';
}

/**
 * Ficha resumida del postulante: identidad, contacto, postulación y CV.
 * Acepta candidatos del backend (cargo/familia resueltos) y los datos
 * simulados anteriores (cargo_id).
 */
export default function FichaPostulante({
  candidato,
  titulo = 'Datos del postulante',
  onCvPreview,
  onCvDownload,
  onCvTestDownload,
}) {
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
  const archivoCv = candidato.cvArchivo ?? candidato.cv_archivo;
  const extensionCv = archivoCv ? archivoCv.split('.').pop().toUpperCase() : null;

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
          <div className="ficha-identidad">
            <span className="ficha-avatar" aria-hidden="true">
              {iniciales(nombre)}
            </span>
            <div style={{ minWidth: 0 }}>
              <h6 className="mb-0 text-truncate" title={nombre}>
                {nombre}
              </h6>
            </div>
          </div>

          <section className="ficha-seccion">
            <div className="ficha-seccion-titulo">
              <i className="bi bi-person-lines-fill" aria-hidden="true" />
              Contacto
            </div>
            <div className="ficha-dato">
              <span>Correo</span>
              <span className="ficha-dato-valor" title={candidato.correo ?? ''}>
                {candidato.correo || '-'}
              </span>
            </div>
            <div className="ficha-dato">
              <span>Teléfono</span>
              <span className="ficha-dato-valor">{candidato.telefono || '-'}</span>
            </div>
          </section>

          <section className="ficha-seccion">
            <div className="ficha-seccion-titulo">
              <i className="bi bi-briefcase" aria-hidden="true" />
              Postulación
            </div>
            <div className="ficha-dato">
              <span>Familia de cargo</span>
              <span className="ficha-dato-valor">{nombreFamilia}</span>
            </div>
            <div className="ficha-dato">
              <span>Cargo evaluado</span>
              <span className="ficha-dato-valor">{nombreCargo}</span>
            </div>
            {candidato.cargo_actual && (
              <div className="ficha-dato">
                <span>Cargo actual</span>
                <span className="ficha-dato-valor">{candidato.cargo_actual}</span>
              </div>
            )}
            <div className="ficha-dato">
              <span>Fecha de postulación</span>
              <span className="ficha-dato-valor">{formatearFecha(fechaPostulacion)}</span>
            </div>
          </section>

          <section className="ficha-seccion ficha-seccion-cv">
            <div className="ficha-seccion-titulo">
              <i className="bi bi-file-earmark-text" aria-hidden="true" />
              Currículum
            </div>

            {archivoCv ? (
              <>
                <div className="d-flex align-items-center gap-2">
                  <span className="cv-file-icon" aria-hidden="true">
                    <i className="bi bi-file-earmark-pdf" />
                  </span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <span className="d-block small fw-semibold">Documento adjunto</span>
                    <span className="d-block text-muted-aqua" style={{ fontSize: '0.76rem' }}>
                      {extensionCv} · Disponible
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
              </>
            ) : (
              <p className="text-muted-aqua small mb-0">Sin currículum adjunto.</p>
            )}
          </section>
        </div>
      </div>

      {archivoCv && onCvTestDownload && (
        <button type="button" className="cv-prueba-link" onClick={onCvTestDownload}>
          CV de prueba
        </button>
      )}
    </>
  );
}
