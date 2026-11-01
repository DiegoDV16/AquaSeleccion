import { useEffect, useState } from 'react';

import { formatearFecha } from '../../mock/solicitudes.js';
import { obtenerCargo } from '../../mock/cargos.js';
import { previsualizarCv } from '../../services/candidatosApi.js';

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
 * Previsualiza el curriculum adjunto. Los PDF se muestran en un iframe y los
 * DOCX se convierten a HTML en el backend. Los datos simulados conservan la
 * maqueta anterior. La descarga sigue deshabilitada.
 */
export default function VisorCvModal({ candidato, visible, onCerrar }) {
  const [cargandoWord, setCargandoWord] = useState(false);
  const [htmlWord, setHtmlWord] = useState('');
  const [errorWord, setErrorWord] = useState('');
  const [mensajeDescarga, setMensajeDescarga] = useState(false);

  const archivoCv = candidato?.cvArchivo ?? candidato?.cv_archivo ?? null;
  const idCandidato = candidato?.id ?? null;
  const cvAlmacenado = esCvAlmacenado(archivoCv);
  const esPdf = /\.pdf$/i.test(archivoCv ?? '');
  const esWord = /\.docx?$/i.test(archivoCv ?? '');

  useEffect(() => {
    if (!visible || !cvAlmacenado || esPdf || !idCandidato) {
      return undefined;
    }

    let vigente = true;

    setCargandoWord(true);
    setHtmlWord('');
    setErrorWord('');

    previsualizarCv(idCandidato)
      .then((datos) => {
        if (!vigente) return;

        if (!datos?.ok) {
          setErrorWord(datos?.mensaje ?? 'No se pudo previsualizar el documento.');
          return;
        }

        if (datos.tipo === 'html') {
          setHtmlWord(datos.html ?? '');
          return;
        }

        if (datos.tipo === 'pdf') {
          setErrorWord('El documento se convirtio a PDF, pero el visor no esta disponible.');
          return;
        }

        setErrorWord(datos.mensaje ?? 'El formato del documento no se puede previsualizar.');
      })
      .finally(() => {
        if (vigente) setCargandoWord(false);
      });

    return () => {
      vigente = false;
    };
  }, [visible, cvAlmacenado, esPdf, idCandidato, archivoCv]);

  if (!candidato) return null;

  const nombre = nombreDe(candidato);
  const nombreCargo = candidato.cargo ?? obtenerCargo(candidato.cargo_id)?.nombre ?? 'Cargo no definido';
  const fechaPostulacion = candidato.fechaPostulacion ?? candidato.fecha_postulacion;
  const tieneCv = Boolean(archivoCv);
  const puedeDescargar = cvAlmacenado && Boolean(idCandidato);
  const urlDescarga = puedeDescargar
    ? `${BASE}backend/api/candidatos/descargar_cv.php?idCandidato=${encodeURIComponent(idCandidato)}`
    : undefined;
  const extensionCv = archivoCv ? archivoCv.split('.').pop() : '';
  const nombreDescarga = puedeDescargar ? `CV_${idCandidato}.${extensionCv}` : 'el archivo';
  const tituloCv = archivoCv ? archivoCv.split('/').pop() : 'Sin CV adjunto';

  function manejarClickDescarga(evento) {
    if (!puedeDescargar) {
      evento.preventDefault();
      return;
    }

    setMensajeDescarga(true);
  }

  function cerrarVisor() {
    setMensajeDescarga(false);
    onCerrar();
  }

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
                <i
                  className={`bi ${
                    esPdf ? 'bi-file-earmark-pdf text-danger' : 'bi-file-earmark-word text-primary'
                  } me-2`}
                  aria-hidden="true"
                />
                {tituloCv}
              </h5>
              <button type="button" className="btn-close" onClick={cerrarVisor} aria-label="Cerrar" />
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
              ) : cvAlmacenado && esWord ? (
                cargandoWord || (!htmlWord && !errorWord) ? (
                  <div className="text-center py-5 text-muted-aqua">
                    <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
                    <p className="mb-0 small">Generando vista previa del documento Word...</p>
                  </div>
                ) : errorWord ? (
                  <div className="alert alert-warning d-flex align-items-center gap-2 mb-0" role="alert">
                    <i className="bi bi-exclamation-triangle" aria-hidden="true" />
                    <span className="small">{errorWord}</span>
                  </div>
                ) : htmlWord ? (
                  <>
                    <div className="cv-word-preview">
                      <div
                        className="word-page"
                        dangerouslySetInnerHTML={{ __html: htmlWord }}
                      />
                    </div>
                    <p className="text-center text-muted-aqua mt-3 mb-0" style={{ fontSize: '0.76rem' }}>
                      Vista previa del documento Word almacenado en el servidor. La descarga esta deshabilitada.
                    </p>
                  </>
                ) : (
                  <div className="alert alert-info mb-0" role="status">
                    No fue posible generar la vista previa del documento.
                  </div>
                )
              ) : cvAlmacenado ? (
                <div className="alert alert-info d-flex align-items-center gap-2 mb-0" role="status">
                  <i className="bi bi-file-earmark" aria-hidden="true" />
                  <span className="small">
                    Este formato de curriculum no se puede previsualizar en la interfaz.
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
              <button type="button" className="btn btn-soft" onClick={cerrarVisor}>
                Cerrar
              </button>
              <a
                className={`btn btn-aqua ${puedeDescargar ? '' : 'disabled'}`}
                href={urlDescarga}
                download
                aria-disabled={!puedeDescargar}
                onClick={manejarClickDescarga}
                title={
                  puedeDescargar
                    ? 'Descargar curriculum'
                    : 'Disponible solo para CV almacenados en el servidor'
                }
              >
                <i className="bi bi-download me-1" aria-hidden="true" />
                Descargar CV
              </a>
            </div>
          </div>
        </div>
      </div>

      {visible && <div className="modal-backdrop fade show" />}

      {mensajeDescarga && (
        <>
          <div
            className="modal fade show d-block"
            id="cv-descarga-iniciada"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cv-descarga-iniciada-titulo"
            style={{ zIndex: 1070 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center p-4">
                  <span
                    className="stat-icon bg-tint-success mx-auto mb-3"
                    style={{ width: 60, height: 60, fontSize: '1.8rem' }}
                    aria-hidden="true"
                  >
                    <i className="bi bi-download" />
                  </span>
                  <h2 className="h5 fw-semibold mb-2" id="cv-descarga-iniciada-titulo">
                    Descarga iniciada
                  </h2>
                  <p className="text-muted-aqua small mb-0">
                    El curriculum de <strong>{nombre}</strong> se esta descargando como{' '}
                    <strong>{nombreDescarga}</strong>.
                  </p>
                </div>
                <div className="modal-footer justify-content-center border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-aqua"
                    onClick={() => setMensajeDescarga(false)}
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1065 }} />
        </>
      )}
    </>
  );
}
