import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import { abrirEntrevista, generarDocumentoEntrevista, guardarEntrevista } from '../../services/entrevistasApi.js';

function formatearTiempo(segundos) {
  const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
  const resto = String(segundos % 60).padStart(2, '0');

  return `${minutos}:${resto}`;
}

/**
 * EvaluadorEntrevistaIA
 * Transcripcion en vivo de una entrevista presencial y generacion de un
 * borrador de documento con IA. Requiere consentimiento explicito.
 */
export default function EvaluadorEntrevistaIA() {
  const { id } = useParams();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [solicitud, setSolicitud] = useState(null);
  const [consentimiento, setConsentimiento] = useState(false);
  const [transcripcion, setTranscripcion] = useState('');
  const [documento, setDocumento] = useState('');
  const [interim, setInterim] = useState('');
  const [grabando, setGrabando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [generando, setGenerando] = useState(false);
  const reconocimientoRef = useRef(null);
  const cronometroRef = useRef(null);

  const soporteVoz = useMemo(
    () => typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    []
  );

  useEffect(() => {
    let vigente = true;

    abrirEntrevista(id)
      .then((datos) => {
        if (!vigente) return;

        if (!datos?.ok) {
          setError(datos?.mensaje ?? 'No se pudo abrir la entrevista.');
          return;
        }

        setSolicitud(datos.solicitud);
        setConsentimiento(Boolean(datos.entrevista?.consentimiento));
        setTranscripcion(datos.entrevista?.transcripcion ?? '');
        setDocumento(datos.entrevista?.documento ?? '');
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
      if (reconocimientoRef.current) reconocimientoRef.current.stop();
      if (cronometroRef.current) window.clearInterval(cronometroRef.current);
    };
  }, [id]);

  useEffect(() => {
    if (!grabando) {
      if (cronometroRef.current) window.clearInterval(cronometroRef.current);
      cronometroRef.current = null;
      return undefined;
    }

    cronometroRef.current = window.setInterval(() => {
      setSegundos((actual) => actual + 1);
    }, 1000);

    return () => {
      if (cronometroRef.current) window.clearInterval(cronometroRef.current);
      cronometroRef.current = null;
    };
  }, [grabando]);

  function iniciarGrabacion() {
    setError('');
    setMensaje('');

    if (!consentimiento) {
      setError('Registra el consentimiento del postulante antes de comenzar a escuchar.');
      return;
    }

    if (!soporteVoz) {
      setError('Este navegador no permite transcripción en vivo. Usa Chrome o Edge, o escribe la transcripción manualmente.');
      return;
    }

    const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
    const reconocimiento = new Reconocimiento();
    reconocimiento.lang = 'es-CL';
    reconocimiento.continuous = true;
    reconocimiento.interimResults = true;

    reconocimiento.onresult = (evento) => {
      let textoFinal = '';
      let textoInterino = '';

      for (let indice = evento.resultIndex; indice < evento.results.length; indice += 1) {
        const resultado = evento.results[indice];
        if (resultado.isFinal) {
          textoFinal += ` ${resultado[0].transcript}`;
        } else {
          textoInterino += resultado[0].transcript;
        }
      }

      if (textoFinal.trim() !== '') {
        setTranscripcion((actual) => `${actual}${actual ? ' ' : ''}${textoFinal.trim()}`);
      }
      setInterim(textoInterino);
    };

    reconocimiento.onerror = (evento) => {
      if (evento.error === 'not-allowed') {
        setError('No se autorizó el micrófono. Revisa los permisos del navegador.');
      } else if (evento.error !== 'aborted' && evento.error !== 'no-speech') {
        setError('La transcripción en vivo se detuvo. Puedes continuar escribiendo la transcripción.');
      }
      setGrabando(false);
      setInterim('');
    };

    reconocimiento.onend = () => {
      setGrabando(false);
      setInterim('');
    };

    try {
      reconocimiento.start();
      reconocimientoRef.current = reconocimiento;
      setGrabando(true);
      setSegundos(0);
    } catch {
      setError('No se pudo iniciar el micrófono. Revisa los permisos del navegador.');
    }
  }

  function detenerGrabacion() {
    if (reconocimientoRef.current) {
      reconocimientoRef.current.stop();
      reconocimientoRef.current = null;
    }
    setGrabando(false);
    setInterim('');
  }

  async function guardar() {
    if (guardando) return;

    setGuardando(true);
    setError('');
    setMensaje('');

    const respuesta = await guardarEntrevista({
      idSolicitud: id,
      consentimiento: consentimiento ? '1' : '0',
      transcripcion,
      documento,
      estado: 'en_curso',
    });

    setGuardando(false);

    if (!respuesta?.ok) {
      setError(respuesta?.mensaje ?? 'No se pudo guardar la entrevista.');
      return;
    }

    setMensaje(respuesta.mensaje ?? 'Entrevista guardada.');
  }

  async function generarDocumento() {
    if (generando) return;

    if (!consentimiento) {
      setError('Registra el consentimiento del postulante antes de generar el documento.');
      return;
    }

    setGenerando(true);
    setError('');
    setMensaje('');

    const guardado = await guardarEntrevista({
      idSolicitud: id,
      consentimiento: '1',
      transcripcion,
      documento,
      estado: 'en_curso',
    });

    if (!guardado?.ok) {
      setGenerando(false);
      setError(guardado?.mensaje ?? 'No se pudo guardar la transcripción antes de generar el documento.');
      return;
    }

    const respuesta = await generarDocumentoEntrevista(id);

    setGenerando(false);

    if (!respuesta?.ok) {
      setError(respuesta?.mensaje ?? 'No se pudo generar el documento.');
      return;
    }

    setDocumento(respuesta.documento ?? '');
    setMensaje(respuesta.mensaje ?? 'Borrador generado. Revísalo antes de guardarlo.');
  }

  if (cargando) {
    return (
      <div className="aqua-card">
        <div className="card-body text-center py-5 text-muted-aqua">
          <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
          <p className="mb-0 small">Preparando la entrevista...</p>
        </div>
      </div>
    );
  }

  if (error && !solicitud) {
    return (
      <>
        <PageHeader etiqueta="Modulo Evaluador" titulo="Entrevista no disponible" />
        <div className="aqua-card">
          <div className="card-body text-center py-5">
            <p className="mb-3">{error}</p>
            <Link to="/evaluador/mis-solicitudes" className="btn btn-aqua btn-sm">
              Volver a mis solicitudes
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        etiqueta="Modulo Evaluador · Entrevista asistida"
        titulo={solicitud?.candidato ?? 'Entrevista'}
        descripcion={`${solicitud?.cargo ?? 'Cargo'} · La transcripcion y el documento son confidenciales.`}
        acciones={
          <Link to={`/evaluador/evaluar/${id}`} className="btn btn-soft btn-sm">
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Volver a la evaluación
          </Link>
        }
      />

      {error && (
        <div className="alert alert-danger d-flex align-items-start gap-2" role="alert">
          <i className="bi bi-exclamation-circle mt-1" aria-hidden="true" />
          <span className="small">{error}</span>
        </div>
      )}

      {mensaje && (
        <div className="alert alert-success d-flex align-items-start gap-2" role="status">
          <i className="bi bi-check-circle mt-1" aria-hidden="true" />
          <span className="small">{mensaje}</span>
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="aqua-card mb-3">
            <div className="card-header">
              <i className="bi bi-shield-check me-2" aria-hidden="true" />
              Consentimiento y privacidad
            </div>
            <div className="card-body">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="consentimiento-entrevista"
                  checked={consentimiento}
                  onChange={(evento) => setConsentimiento(evento.target.checked)}
                />
                <label className="form-check-label small" htmlFor="consentimiento-entrevista">
                  El postulante autorizó la grabación, transcripción y uso de sus antecedentes para esta entrevista.
                </label>
              </div>
              <p className="text-muted-aqua small mt-3 mb-0">
                No grabes entrevistas sin consentimiento. La transcripción debe revisarse antes de incorporarla a la evaluación.
              </p>
            </div>
          </div>

          <div className="aqua-card">
            <div className="card-header">
              <i className="bi bi-mic me-2" aria-hidden="true" />
              Escucha y transcripción en vivo
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                <div>
                  <span className={`badge rounded-pill ${grabando ? 'bg-tint-danger' : 'bg-tint-info'}`}>
                    {grabando ? 'Escuchando' : 'En espera'}
                  </span>
                  <span className="ms-2 small text-muted-aqua">{formatearTiempo(segundos)}</span>
                </div>
                <span className="small text-muted-aqua">
                  {soporteVoz ? 'Chrome/Edge' : 'Sin soporte de voz'}
                </span>
              </div>

              <div className="d-grid gap-2">
                {!grabando ? (
                  <button type="button" className="btn btn-aqua" onClick={iniciarGrabacion}>
                    <i className="bi bi-mic-fill me-1" aria-hidden="true" />
                    Iniciar escucha
                  </button>
                ) : (
                  <button type="button" className="btn btn-danger" onClick={detenerGrabacion}>
                    <i className="bi bi-stop-fill me-1" aria-hidden="true" />
                    Detener escucha
                  </button>
                )}
                <button type="button" className="btn btn-soft" onClick={guardar} disabled={guardando}>
                  <i className="bi bi-save me-1" aria-hidden="true" />
                  {guardando ? 'Guardando...' : 'Guardar transcripción'}
                </button>
              </div>

              {interim && (
                <p className="small text-muted-aqua mt-3 mb-0">
                  <em>{interim}</em>
                </p>
              )}

              <p className="small text-muted-aqua mt-3 mb-0">
                El navegador envía el audio al servicio de reconocimiento de voz. Si el entorno lo prohíbe, escribe la transcripción manualmente.
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="aqua-card mb-3">
            <div className="card-header">
              <i className="bi bi-chat-left-text me-2" aria-hidden="true" />
              Transcripción de la entrevista
            </div>
            <div className="card-body">
              <label className="visually-hidden" htmlFor="transcripcion-entrevista">
                Transcripción de la entrevista
              </label>
              <textarea
                className="form-control"
                id="transcripcion-entrevista"
                rows={9}
                value={transcripcion}
                onChange={(evento) => setTranscripcion(evento.target.value)}
                placeholder="La transcripción aparecerá aquí. También puedes escribir o corregir el texto."
              />
              <div className="d-flex justify-content-between mt-2 small text-muted-aqua">
                <span>Revisa nombres, cargos y términos antes de generar el documento.</span>
                <span>{transcripcion.length} caracteres</span>
              </div>
            </div>
          </div>

          <div className="aqua-card">
            <div className="card-header d-flex justify-content-between align-items-center gap-2">
              <span>
                <i className="bi bi-stars me-2" aria-hidden="true" />
                Documento de entrevista
              </span>
              <button
                type="button"
                className="btn btn-aqua btn-sm"
                onClick={generarDocumento}
                disabled={generando}
              >
                {generando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" />
                    Generando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-magic me-1" aria-hidden="true" />
                    Generar borrador
                  </>
                )}
              </button>
            </div>
            <div className="card-body">
              <p className="small text-muted-aqua">
                La IA genera un borrador con la transcripción. Debes revisarlo y corregirlo antes de usarlo.
              </p>
              <label className="visually-hidden" htmlFor="documento-entrevista">
                Documento de entrevista
              </label>
              <textarea
                className="form-control"
                id="documento-entrevista"
                rows={14}
                value={documento}
                onChange={(evento) => setDocumento(evento.target.value)}
                placeholder="Aquí aparecerá el borrador generado por IA."
              />
              <div className="d-flex justify-content-end mt-3">
                <button type="button" className="btn btn-aqua" onClick={guardar} disabled={guardando}>
                  <i className="bi bi-save me-1" aria-hidden="true" />
                  {guardando ? 'Guardando...' : 'Guardar entrevista'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
