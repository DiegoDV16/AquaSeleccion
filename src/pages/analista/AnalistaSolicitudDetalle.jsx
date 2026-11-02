import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import ResultadoBadge from '../../components/ui/ResultadoBadge.jsx';
import FichaPostulante from '../../components/ui/FichaPostulante.jsx';
import VisorCvModal from '../../components/ui/VisorCvModal.jsx';
import { formatearFecha } from '../../mock/solicitudes.js';
import { descargarCv } from '../../services/candidatosApi.js';
import { obtenerSolicitud } from '../../services/solicitudesApi.js';

const PRIORIDAD = {
  alta: { nombre: 'Alta', clase: 'badge-estado-noapto' },
  normal: { nombre: 'Normal', clase: 'badge-estado-inactivo' },
  baja: { nombre: 'Baja', clase: 'badge-estado-inactivo' },
};

/**
 * AnalistaSolicitudDetalle
 * Vista de solo lectura de una solicitud: candidato, asignacion, estado y
 * evaluacion registrada por el profesional responsable.
 */
export default function AnalistaSolicitudDetalle() {
  const { id } = useParams();
  const [solicitud, setSolicitud] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);
  const [cvVisible, setCvVisible] = useState(false);
  const [errorAccion, setErrorAccion] = useState('');

  useEffect(() => {
    let vigente = true;

    setCargando(true);
    setError('');

    obtenerSolicitud(id).then((datos) => {
      if (!vigente) return;

      if (!datos?.ok) {
        setError(datos?.mensaje ?? 'No se pudo obtener la solicitud.');
        setSolicitud(null);
      } else {
        setSolicitud(datos.solicitud);
      }

      setCargando(false);
    });

    return () => {
      vigente = false;
    };
  }, [id, recarga]);

  const codigo = `SOL-${String(id).padStart(4, '0')}`;

  async function descargarCurriculum() {
    if (!solicitud?.candidato?.id) return;

    const resultado = await descargarCv(solicitud.candidato.id);

    if (!resultado.ok) {
      setErrorAccion(resultado.mensaje ?? 'No se pudo descargar el currículum.');
      return;
    }

    const objetoUrl = URL.createObjectURL(resultado.blob);
    const enlace = document.createElement('a');
    enlace.href = objetoUrl;
    enlace.download = resultado.nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(objetoUrl);
  }

  if (cargando) {
    return (
      <>
        <PageHeader etiqueta={`Modulo Analista \u00b7 ${codigo}`} titulo="Detalle de la solicitud" />
        <div className="aqua-card">
          <div className="card-body text-center py-5 text-muted-aqua">
            <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
            <p className="mb-0 small">Cargando solicitud...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !solicitud) {
    return (
      <>
        <PageHeader etiqueta="Modulo Analista" titulo="Solicitud no disponible" />
        <div className="aqua-card">
          <div className="card-body text-center py-5">
            <i className="bi bi-question-circle fs-1 text-muted-aqua d-block mb-3" aria-hidden="true" />
            <p className="mb-1 fw-semibold">No se pudo abrir la solicitud {codigo}</p>
            <p className="text-muted-aqua small mb-3">{error || 'La solicitud indicada no existe.'}</p>
            <div className="d-flex justify-content-center gap-2">
              <button type="button" className="btn btn-soft btn-sm" onClick={() => setRecarga((valor) => valor + 1)}>
                <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
                Reintentar
              </button>
              <Link to="/analista/solicitudes" className="btn btn-aqua btn-sm">
                Volver a solicitudes
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const candidato = solicitud.candidato;
  const evaluacion = solicitud.evaluacion;
  const prioridad = PRIORIDAD[solicitud.prioridad] ?? PRIORIDAD.normal;

  return (
    <>
      <PageHeader
        etiqueta={`Modulo Analista \u00b7 ${codigo}`}
        titulo="Detalle de la solicitud"
        descripcion={`${candidato.nombreCompleto} \u00b7 ${candidato.cargo}`}
        acciones={
          <>
            <EstadoBadge estado={solicitud.estado} />
            <Link to="/analista/solicitudes" className="btn btn-soft btn-sm">
              <i className="bi bi-arrow-left me-1" aria-hidden="true" />
              Volver
            </Link>
          </>
        }
      />

      {errorAccion && (
        <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
          <i className="bi bi-exclamation-circle" aria-hidden="true" />
          <span className="small">{errorAccion}</span>
          <button
            type="button"
            className="btn-close ms-auto"
            aria-label="Cerrar"
            onClick={() => setErrorAccion('')}
          />
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-4">
          <FichaPostulante
            candidato={candidato}
            onCvPreview={() => setCvVisible(true)}
            onCvDownload={descargarCurriculum}
          />
        </div>

        <div className="col-lg-8">
          <div className="aqua-card">
            <div className="card-header">
              <i className="bi bi-clipboard2-data me-2" aria-hidden="true" />
              Datos de la solicitud
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <section className="ficha-seccion mt-0 h-100">
                    <div className="ficha-seccion-titulo">
                      <i className="bi bi-clipboard2-data" aria-hidden="true" />
                      Resumen
                    </div>
                    <div className="ficha-dato">
                      <span>Código</span>
                      <span className="ficha-dato-valor">{codigo}</span>
                    </div>
                    <div className="ficha-dato">
                      <span>Estado</span>
                      <span className="ficha-dato-valor">
                        <EstadoBadge estado={solicitud.estado} />
                      </span>
                    </div>
                    <div className="ficha-dato">
                      <span>Prioridad</span>
                      <span className="ficha-dato-valor">
                        <span className={`badge badge-estado ${prioridad.clase}`}>{prioridad.nombre}</span>
                      </span>
                    </div>
                  </section>
                </div>

                <div className="col-md-6">
                  <section className="ficha-seccion mt-0 h-100">
                    <div className="ficha-seccion-titulo">
                      <i className="bi bi-calendar3" aria-hidden="true" />
                      Fechas
                    </div>
                    <div className="ficha-dato">
                      <span>Fecha de solicitud</span>
                      <span className="ficha-dato-valor">{formatearFecha(solicitud.fechaSolicitud)}</span>
                    </div>
                    <div className="ficha-dato">
                      <span>Fecha de asignación</span>
                      <span className="ficha-dato-valor">{formatearFecha(solicitud.fechaAsignacion)}</span>
                    </div>
                  </section>
                </div>

                <div className="col-12">
                  <section className="ficha-seccion mt-0">
                    <div className="ficha-seccion-titulo">
                      <i className="bi bi-person-badge" aria-hidden="true" />
                      Asignación
                    </div>
                    <div className="ficha-dato">
                      <span>Evaluador responsable</span>
                      <span className="ficha-dato-valor">
                        {solicitud.evaluador ? (
                          <>
                            <span className="d-block">{solicitud.evaluador.nombre}</span>
                            <span className="d-block text-muted-aqua" style={{ fontSize: '0.76rem' }}>
                              {solicitud.evaluador.correo}
                            </span>
                          </>
                        ) : (
                          'Sin asignar'
                        )}
                      </span>
                    </div>
                    <div className="ficha-dato">
                      <span>Cargo</span>
                      <span className="ficha-dato-valor">
                        {candidato.cargo} · {candidato.familiaCargo}
                      </span>
                    </div>
                  </section>
                </div>

                <div className="col-12">
                  <section className="ficha-seccion mt-0">
                    <div className="ficha-seccion-titulo">
                      <i className="bi bi-chat-left-text" aria-hidden="true" />
                      Observaciones
                    </div>
                    <p className="text-muted-aqua small mb-0">
                      {solicitud.observaciones || 'Sin observaciones.'}
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </div>

          <div className="aqua-card mt-3">
            <div className="card-header">
              <i className="bi bi-clipboard2-pulse me-2" aria-hidden="true" />
              Evaluación psicológica
            </div>
            <div className="card-body">
              {evaluacion ? (
                <div className="row g-3">
                  <div className="col-md-5">
                    <section className="ficha-seccion mt-0 h-100">
                      <div className="ficha-seccion-titulo">
                        <i className="bi bi-clipboard2-check" aria-hidden="true" />
                        Resultado
                      </div>
                      <div className="ficha-dato">
                        <span>Fecha de evaluación</span>
                        <span className="ficha-dato-valor">
                          {formatearFecha(evaluacion.fechaEvaluacion)}
                        </span>
                      </div>
                      <div className="ficha-dato">
                        <span>Resultado</span>
                        <span className="ficha-dato-valor">
                          <ResultadoBadge resultado={evaluacion.resultado} />
                        </span>
                      </div>
                    </section>
                  </div>
                  <div className="col-md-7">
                    <section className="ficha-seccion mt-0 h-100">
                      <div className="ficha-seccion-titulo">
                        <i className="bi bi-chat-left-text" aria-hidden="true" />
                        Observaciones
                      </div>
                      <p className="text-muted-aqua small mb-0">
                        {evaluacion.observacion || 'Sin observaciones registradas.'}
                      </p>
                    </section>
                  </div>
                </div>
              ) : (
                <div className="detalle-vacio">
                  <span className="detalle-vacio-icon" aria-hidden="true">
                    <i className="bi bi-clock-history" />
                  </span>
                  <div>
                    <h6>Pendiente de evaluación</h6>
                    <p className="text-muted-aqua small mb-0">
                      El evaluador aún no registra la evaluación. La solicitud se encuentra en estado{' '}
                      <strong>{solicitud.estado === 'pendiente' ? 'Pendiente' : 'En proceso'}</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <VisorCvModal
        candidato={candidato}
        visible={cvVisible}
        onCerrar={() => setCvVisible(false)}
      />
    </>
  );
}
