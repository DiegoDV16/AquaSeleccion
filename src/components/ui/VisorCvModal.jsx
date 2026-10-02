import { nombreCompleto, inicialesCandidato } from '../../mock/candidatos.js';
import { formatearFecha } from '../../mock/solicitudes.js';
import { obtenerCargo } from '../../mock/cargos.js';

/**
 * VisorCvModal
 * Previsualizacion estatica del CV adjunto. En el MVP el PDF se representa con
 * una maqueta del documento; cuando exista el backend, este bloque se
 * reemplaza por un <iframe src={`/api/candidatos/${candidato.id}/cv`} /> o por
 * un enlace de descarga directa.
 */
export default function VisorCvModal({ candidato, visible, onCerrar }) {
  if (!candidato) return null;

  const cargo = obtenerCargo(candidato.cargo_id);
  const tieneCv = Boolean(candidato.cv_archivo);

  return (
    <>
      <div
        className={`modal fade ${visible ? 'show' : ''}`}
        id="visor-cv"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="visor-cv-titulo"
        style={{ display: visible ? 'block' : 'none' }}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="visor-cv-titulo">
                <i className="bi bi-file-earmark-pdf me-2 text-danger" aria-hidden="true" />
                {candidato.cv_archivo ?? 'Sin CV adjunto'}
              </h5>
              <button type="button" className="btn-close" onClick={onCerrar} aria-label="Cerrar" />
            </div>
            <div className="modal-body">
              <div className="d-flex flex-wrap gap-3 mb-3">
                <span className="aqua-avatar" style={{ width: 40, height: 40 }} aria-hidden="true">
                  {inicialesCandidato(candidato)}
                </span>
                <div>
                  <p className="mb-0 fw-semibold">{nombreCompleto(candidato)}</p>
                  <p className="mb-0 text-muted-aqua" style={{ fontSize: '0.8rem' }}>
                    {cargo ? cargo.nombre : 'Cargo no definido'} &middot; Postulado el{' '}
                    {formatearFecha(candidato.fecha_postulacion)}
                  </p>
                </div>
              </div>

              {tieneCv ? (
                <div className="border rounded p-4" style={{ backgroundColor: '#f8fafb' }}>
                  <div className="mx-auto border shadow-sm bg-white p-4" style={{ maxWidth: 620 }}>
                    <p className="text-uppercase text-center text-muted-aqua mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                      Curriculum Vitae
                    </p>
                    <h6 className="text-center mb-3">{nombreCompleto(candidato)}</h6>
                    <hr />
                    <p className="mb-1 fw-semibold" style={{ fontSize: '0.8rem' }}>
                      Datos de contacto
                    </p>
                    <p className="mb-3 text-muted-aqua" style={{ fontSize: '0.8rem' }}>
                      {candidato.correo}
                      <br />
                      {candidato.telefono}
                    </p>
                    <p className="mb-1 fw-semibold" style={{ fontSize: '0.8rem' }}>
                      Objetivo
                    </p>
                    <p className="mb-3 text-muted-aqua" style={{ fontSize: '0.8rem' }}>
                     Postular a {cargo ? cargo.nombre : 'cargo solicitado'} en AquaChile, con experiencia
                      en el sector salmonicultor.
                    </p>
                    <p className="mb-1 fw-semibold" style={{ fontSize: '0.8rem' }}>
                      Experiencia laboral
                    </p>
                    <ul className="text-muted-aqua" style={{ fontSize: '0.8rem' }}>
                      <li>Analista de operaciones - Salmones del Pacifico (2023 - 2026)</li>
                      <li>Operario de proceso - Pesquera Araucania (2021 - 2023)</li>
                    </ul>
                  </div>
                  <p className="text-center text-muted-aqua mt-3 mb-0" style={{ fontSize: '0.76rem' }}>
                    Vista simulada del documento ({candidato.cv_paginas} paginas &middot; {candidato.cv_tamano})
                  </p>
                </div>
              ) : (
                <div className="alert alert-warning d-flex align-items-center gap-2 mb-0" role="alert">
                  <i className="bi bi-exclamation-triangle" aria-hidden="true" />
                  <span>
                    Este postulante es interno y no tiene CV en formato PDF. El respaldo de su
                    postulacion es el legajo del colaborador en la intranet.
                  </span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-soft" onClick={onCerrar}>
                Cerrar
              </button>
              <button type="button" className="btn btn-aqua" disabled={!tieneCv}>
                <i className="bi bi-download me-1" aria-hidden="true" />
                Descargar CV
              </button>
            </div>
          </div>
        </div>
      </div>

      {visible && <div className="modal-backdrop fade show" />}
    </>
  );
}