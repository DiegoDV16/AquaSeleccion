import { formatearFecha } from '../../mock/solicitudes.js';
import { obtenerCargo } from '../../mock/cargos.js';

const BASE = import.meta.env.BASE_URL;

/** Nombre completo compatible con candidatos del backend y con los mocks. */
function nombreDe(candidato) {
  if (candidato.nombreCompleto) return candidato.nombreCompleto;

  return `${candidato.nombres ?? ''} ${candidato.apellidoPaterno ?? candidato.apellido_paterno ?? ''} ${
    candidato.apellidoMaterno ?? candidato.apellido_materno ?? ''
  }`
    .replace(/\s+/g, ' ')
    .trim();
}

function inicialesDe(candidato) {
  const nombres = candidato.nombres ?? '';
  const apellido = candidato.apellidoPaterno ?? candidato.apellido_paterno ?? '';
  const iniciales = `${nombres.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

  return iniciales || '??';
}

/** Convierte la ruta guardada en MySQL (`uploads/cv/...`) en URL publica. */
function urlCv(ruta) {
  if (/^https?:\/\//i.test(ruta)) return ruta;

  const limpia = ruta.replace(/^\/+/, '').replace(/^backend\//, '');

  return `${BASE}backend/${limpia}`;
}

/** Los mocks guardan solo el nombre del archivo; el backend guarda una ruta. */
function esCvAlmacenado(ruta) {
  return typeof ruta === 'string' && ruta.includes('/');
}

/**
 * VisorCvModal
 * Previsualiza el curriculum adjunto. Si el candidato viene del backend, el
 * PDF almacenado se muestra en un iframe; los datos simulados conservan la
 * maqueta anterior. La descarga sigue deshabilitada en la interfaz.
 */
export default function VisorCvModal({ candidato, visible, onCerrar }) {
  if (!candidato) return null;

  const nombre = nombreDe(candidato);
  const nombreCargo = candidato.cargo ?? obtenerCargo(candidato.cargo_id)?.nombre ?? 'Cargo no definido';
  const fechaPostulacion = candidato.fechaPostulacion ?? candidato.fecha_postulacion;
  const archivoCv = candidato.cvArchivo ?? candidato.cv_archivo;
  const tieneCv = Boolean(archivoCv);
  const cvAlmacenado = tieneCv && esCvAlmacenado(archivoCv);
  const esPdf = /\.pdf$/i.test(archivoCv ?? '');
  const tituloCv = archivoCv ? archivoCv.split('/').pop() : 'Sin CV adjunto';

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
                {tituloCv}
              </h5>
              <button type="button" className="btn-close" onClick={onCerrar} aria-label="Cerrar" />
            </div>
            <div className="modal-body">
              <div className="d-flex flex-wrap gap-3 mb-3">
                <span className="aqua-avatar" style={{ width: 40, height: 40 }} aria-hidden="true">
                  {inicialesDe(candidato)}
                </span>
                <div>
                  <p className="mb-0 fw-semibold">{nombre}</p>
                  <p className="mb-0 text-muted-aqua" style={{ fontSize: '0.8rem' }}>
                    {nombreCargo} &middot; Postulado el {formatearFecha(fechaPostulacion)}
                  </p>
                </div>
              </div>

              {cvAlmacenado && esPdf ? (
                <>
                  <iframe
                    src={urlCv(archivoCv)}
                    title={`Curriculum de ${nombre}`}
                    className="w-100 rounded border"
                    style={{ height: '65vh', backgroundColor: '#f8fafb' }}
                  />
                  <p className="text-center text-muted-aqua mt-3 mb-0" style={{ fontSize: '0.76rem' }}>
                    Vista previa del documento almacenado en el servidor. La descarga esta deshabilitada.
                  </p>
                </>
              ) : cvAlmacenado ? (
                <div className="alert alert-info d-flex align-items-center gap-2 mb-0" role="status">
                  <i className="bi bi-file-earmark-word" aria-hidden="true" />
                  <span className="small">
                    El curriculum se almaceno como documento Word. La previsualizacion integrada solo esta
                    disponible para archivos PDF.
                  </span>
                </div>
              ) : tieneCv ? (
                <div className="border rounded p-4" style={{ backgroundColor: '#f8fafb' }}>
                  <div className="mx-auto border shadow-sm bg-white p-4" style={{ maxWidth: 620 }}>
                    <p
                      className="text-uppercase text-center text-muted-aqua mb-1"
                      style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}
                    >
                      Curriculum Vitae
                    </p>
                    <h6 className="text-center mb-3">{nombre}</h6>
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
                      Postular a {nombreCargo} en AquaChile, con experiencia en el sector salmonicultor.
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
                    Vista simulada del documento
                    {candidato.cv_paginas ? ` (${candidato.cv_paginas} paginas)` : ''}
                    {candidato.cv_tamano ? ` \u00b7 ${candidato.cv_tamano}` : ''}
                  </p>
                </div>
              ) : (
                <div className="alert alert-warning d-flex align-items-center gap-2 mb-0" role="alert">
                  <i className="bi bi-exclamation-triangle" aria-hidden="true" />
                  <span>
                    Este postulante no tiene CV adjunto. En las postulaciones internas el respaldo es el
                    legajo del colaborador en la intranet.
                  </span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-soft" onClick={onCerrar}>
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-aqua"
                disabled
                title="La descarga esta deshabilitada en la version actual"
              >
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
