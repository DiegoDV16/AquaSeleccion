import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import ResultadoBadge from '../../components/ui/ResultadoBadge.jsx';
import FichaPostulante from '../../components/ui/FichaPostulante.jsx';
import VisorCvModal from '../../components/ui/VisorCvModal.jsx';
import { formatearFecha } from '../../mock/solicitudes.js';
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

      <div className="row g-3">
        <div className="col-lg-4">
          <FichaPostulante candidato={candidato} />

          <div className="aqua-card mt-3">
            <div className="card-header">
              <i className="bi bi-file-earmark-pdf me-2" aria-hidden="true" />
              Curriculum Vitae
            </div>
            <div className="card-body">
              {candidato.cvArchivo ? (
                <>
                  <p className="small fw-semibold mb-1 text-break">
                    {candidato.cvArchivo.split('/').pop()}
                  </p>
                  <p className="text-muted-aqua mb-3" style={{ fontSize: '0.78rem' }}>
                    Documento almacenado en el servidor.
                  </p>
                  <button type="button" className="btn btn-aqua btn-sm" onClick={() => setCvVisible(true)}>
                    <i className="bi bi-eye me-1" aria-hidden="true" />
                    Previsualizar CV
                  </button>
                </>
              ) : (
                <p className="text-muted-aqua small mb-0">
                  Postulacion sin CV adjunto. En los movimientos internos el respaldo es el legajo del
                  colaborador.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="aqua-card">
            <div className="card-header">
              <i className="bi bi-clipboard2-data me-2" aria-hidden="true" />
              Datos de la solicitud
            </div>
            <div className="card-body">
              <dl className="row mb-0 small">
                <dt className="col-sm-4 text-muted-aqua fw-semibold">Codigo</dt>
                <dd className="col-sm-8">{codigo}</dd>

                <dt className="col-sm-4 text-muted-aqua fw-semibold">Estado</dt>
                <dd className="col-sm-8">
                  <EstadoBadge estado={solicitud.estado} />
                </dd>

                <dt className="col-sm-4 text-muted-aqua fw-semibold">Prioridad</dt>
                <dd className="col-sm-8">
                  <span className={`badge badge-estado ${prioridad.clase}`}>{prioridad.nombre}</span>
                </dd>

                <dt className="col-sm-4 text-muted-aqua fw-semibold">Fecha de solicitud</dt>
                <dd className="col-sm-8">{formatearFecha(solicitud.fechaSolicitud)}</dd>

                <dt className="col-sm-4 text-muted-aqua fw-semibold">Fecha de asignacion</dt>
                <dd className="col-sm-8">{formatearFecha(solicitud.fechaAsignacion)}</dd>

                <dt className="col-sm-4 text-muted-aqua fw-semibold">Evaluador responsable</dt>
                <dd className="col-sm-8">
                  {solicitud.evaluador ? (
                    <>
                      <span className="d-block">{solicitud.evaluador.nombre}</span>
                      <span className="d-block text-muted-aqua" style={{ fontSize: '0.78rem' }}>
                        {solicitud.evaluador.correo}
                      </span>
                    </>
                  ) : (
                    'Sin asignar'
                  )}
                </dd>

                <dt className="col-sm-4 text-muted-aqua fw-semibold">Cargo</dt>
                <dd className="col-sm-8">
                  {candidato.cargo} &middot; {candidato.familiaCargo}
                </dd>

                <dt className="col-sm-4 text-muted-aqua fw-semibold">Observaciones</dt>
                <dd className="col-sm-8 mb-0">
                  {solicitud.observaciones || <span className="text-muted-aqua">Sin observaciones.</span>}
                </dd>
              </dl>
            </div>
          </div>

          <div className="aqua-card mt-3">
            <div className="card-header">
              <i className="bi bi-clipboard2-pulse me-2" aria-hidden="true" />
              Evaluacion psicologica
            </div>
            <div className="card-body">
              {evaluacion ? (
                <dl className="row mb-0 small">
                  <dt className="col-sm-4 text-muted-aqua fw-semibold">Fecha de evaluacion</dt>
                  <dd className="col-sm-8">{formatearFecha(evaluacion.fechaEvaluacion)}</dd>

                  <dt className="col-sm-4 text-muted-aqua fw-semibold">Resultado</dt>
                  <dd className="col-sm-8">
                    <ResultadoBadge resultado={evaluacion.resultado} />
                  </dd>

                  <dt className="col-sm-4 text-muted-aqua fw-semibold">Observaciones</dt>
                  <dd className="col-sm-8 mb-0">
                    {evaluacion.observacion || (
                      <span className="text-muted-aqua">Sin observaciones registradas.</span>
                    )}
                  </dd>
                </dl>
              ) : (
                <div className="alert alert-info d-flex align-items-center gap-2 mb-0" role="alert">
                  <i className="bi bi-clock-history" aria-hidden="true" />
                  <span className="small">
                    El evaluador aun no registra la evaluacion. La solicitud se encuentra en estado{' '}
                    <strong>{solicitud.estado === 'pendiente' ? 'Pendiente' : 'En proceso'}</strong>.
                  </span>
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
