import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ConfirmacionModal from '../../components/ui/ConfirmacionModal.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import FichaPostulante from '../../components/ui/FichaPostulante.jsx';
import VisorCvModal from '../../components/ui/VisorCvModal.jsx';
import { useAuth } from '../../context/AuthContext.js';
import { formatearFecha } from '../../mock/solicitudes.js';
import { descargarCv } from '../../services/candidatosApi.js';
import { guardarEvaluacion, obtenerMiSolicitud } from '../../services/solicitudesApi.js';

const RESULTADOS = [
  { clave: 'apto', nombre: 'Apto' },
  { clave: 'no_apto', nombre: 'No Apto' },
  { clave: 'con_observaciones', nombre: 'Con observaciones' },
];

function fechaHoyLocal() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');

  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function codigoSolicitud(valor) {
  const texto = String(valor ?? '').trim();

  return /^\d+$/.test(texto) ? `SOL-${texto.padStart(4, '0')}` : texto || 'SOL';
}

const FORMULARIO_INICIAL = {
  fechaEvaluacion: '',
  resultado: '',
  observaciones: '',
  cargoActual: '',
  comentarioEntrevista: '',
};

/**
 * EvaluadorEvaluar
 * Formulario de evaluación psicolaboral conectado a MySQL. Permite guardar un
 * borrador (estado en proceso) o finalizar la evaluación.
 */
export default function EvaluadorEvaluar() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { usuario } = useAuth();

  const [solicitud, setSolicitud] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [errorAccion, setErrorAccion] = useState('');
  const [recarga, setRecarga] = useState(0);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);
  const [cvVisible, setCvVisible] = useState(false);

  const cargarSolicitud = useCallback(async () => {
    setCargando(true);
    setError('');

    const datos = await obtenerMiSolicitud(id);

    if (!datos?.ok) {
      setError(datos?.mensaje ?? 'No se pudo obtener la solicitud.');
      setSolicitud(null);
    } else {
      const actual = datos.solicitud;
      setSolicitud(actual);
      setFormulario({
        fechaEvaluacion: actual.evaluacion?.fechaEvaluacion ?? fechaHoyLocal(),
        resultado: actual.evaluacion?.resultado ?? '',
        observaciones: actual.evaluacion?.observacion ?? '',
        cargoActual: actual.evaluacion?.cargoActual ?? '',
        comentarioEntrevista: actual.evaluacion?.comentarioEntrevista ?? '',
      });
    }

    setCargando(false);
  }, [id]);

  useEffect(() => {
    cargarSolicitud();
  }, [cargarSolicitud, recarga]);

  const soloLectura = solicitud?.estado === 'finalizada';
  const codigo = codigoSolicitud(id);

  const resultadoNombre = useMemo(
    () => RESULTADOS.find((item) => item.clave === formulario.resultado)?.nombre ?? '-',
    [formulario.resultado],
  );

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: undefined }));
    setErrorAccion('');
  }

  function validar(finalizar) {
    const nuevosErrores = {};

    if (formulario.observaciones.length > 250) {
      nuevosErrores.observaciones = 'Maximo 250 caracteres.';
    }

    if (finalizar) {
      if (!formulario.fechaEvaluacion) {
        nuevosErrores.fechaEvaluacion = 'Ingresa la fecha de la evaluacion.';
      }

      if (!formulario.resultado) {
        nuevosErrores.resultado = 'Selecciona el resultado de la evaluacion.';
      }

      if (formulario.observaciones.trim().length < 20) {
        nuevosErrores.observaciones = 'Detalla las observaciones (minimo 20 caracteres).';
      }
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  }

  async function guardar(accion) {
    if (guardando || soloLectura) return;

    const finalizar = accion === 'finalizar';

    if (!validar(finalizar)) return;

    setGuardando(true);
    setErrorAccion('');

    const datos = await guardarEvaluacion({
      idSolicitud: id,
      accion,
      fechaEvaluacion: formulario.fechaEvaluacion,
      resultado: formulario.resultado,
      observaciones: formulario.observaciones,
      cargoActual: formulario.cargoActual,
      comentarioEntrevista: formulario.comentarioEntrevista,
    });

    setGuardando(false);

    if (!datos?.ok) {
      setErrorAccion(datos?.mensaje ?? 'No fue posible guardar la evaluacion.');
      return;
    }

    setSolicitud((actual) => ({
      ...actual,
      estado: datos.estado,
      evaluacion: {
        ...(actual?.evaluacion ?? {}),
        id: datos.idEvaluacion,
        resultado: finalizar ? datos.resultado : actual?.evaluacion?.resultado ?? null,
        fechaEvaluacion: formulario.fechaEvaluacion || null,
        observacion: formulario.observaciones,
        cargoActual: formulario.cargoActual,
        comentarioEntrevista: formulario.comentarioEntrevista,
      },
    }));

    setConfirmacion({ accion, estado: datos.estado, resultado: datos.resultado });
  }

  async function descargarCurriculum() {
    if (!solicitud?.candidato?.id) return;

    const resultado = await descargarCv(solicitud.candidato.id);

    if (!resultado.ok) {
      setErrorAccion(resultado.mensaje ?? 'No se pudo descargar el curriculum.');
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
        <PageHeader etiqueta={`Modulo Evaluador \u00b7 ${codigo}`} titulo="Evaluacion psicologica" />
        <div className="aqua-card">
          <div className="card-body text-center py-5 text-muted-aqua">
            <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
            <p className="mb-0 small">Cargando la solicitud...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !solicitud) {
    return (
      <>
        <PageHeader etiqueta="Modulo Evaluador" titulo="Solicitud no disponible" />
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
              <Link to="/evaluador/mis-solicitudes" className="btn btn-aqua btn-sm">
                Volver a mis solicitudes
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const candidato = solicitud.candidato;
  const cargo = candidato?.cargo ?? '-';
  const familia = candidato?.familiaCargo ?? '-';

  return (
    <>
      <PageHeader
        etiqueta={`Modulo Evaluador · ${codigo}`}
        titulo={`Evaluacion psicologica · ${candidato?.nombreCompleto ?? 'Postulante'}`}
        descripcion={`Cargo evaluado: ${familia} / ${cargo} · Asignada el ${formatearFecha(solicitud.fechaAsignacion)}`}
        acciones={
          <>
            <EstadoBadge estado={solicitud.estado} />
            <Link to="/evaluador/mis-solicitudes" className="btn btn-soft btn-sm">
              <i className="bi bi-arrow-left me-1" aria-hidden="true" />
              Volver
            </Link>
          </>
        }
      />

      <div className="row g-3">
        <div className="col-lg-4">
          <FichaPostulante
            candidato={candidato}
            onCvPreview={() => setCvVisible(true)}
            onCvDownload={descargarCurriculum}
          />
        </div>

        <div className="col-lg-8">
          <form
            className="aqua-form evaluacion-formulario"
            onSubmit={(evento) => {
              evento.preventDefault();
              guardar('finalizar');
            }}
            noValidate
          >
            <div className="aqua-card evaluacion-principal">
              <div className="card-header">
                <i className="bi bi-clipboard2-pulse me-2" aria-hidden="true" />
                Formulario de evaluación
                <span className="evaluador-nombre float-end" style={{ fontSize: '0.76rem' }}>
                  Evaluador: {usuario?.nombre ?? '-'}
                </span>
              </div>
              <div className="card-body">
                {soloLectura && (
                  <div className="alert alert-info d-flex align-items-center gap-2" role="alert">
                    <i className="bi bi-lock" aria-hidden="true" />
                    <span className="small">
                      La solicitud está finalizada. La evaluación queda en modo solo lectura.
                    </span>
                  </div>
                )}

                {errorAccion && (
                  <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                    <i className="bi bi-exclamation-circle" aria-hidden="true" />
                    <span className="small">{errorAccion}</span>
                  </div>
                )}

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="fechaEvaluacion">
                      Fecha de evaluación <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-control ${errores.fechaEvaluacion ? 'is-invalid' : ''}`}
                      id="fechaEvaluacion"
                      name="fechaEvaluacion"
                      value={formulario.fechaEvaluacion}
                      onChange={actualizarCampo}
                      disabled={soloLectura}
                      required
                    />
                    {errores.fechaEvaluacion && <div className="invalid-feedback">{errores.fechaEvaluacion}</div>}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" htmlFor="resultado">
                      Resultado <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errores.resultado ? 'is-invalid' : ''}`}
                      id="resultado"
                      name="resultado"
                      value={formulario.resultado}
                      onChange={actualizarCampo}
                      disabled={soloLectura}
                      required
                    >
                      <option value="">Seleccione un resultado</option>
                      {RESULTADOS.map((item) => (
                        <option key={item.clave} value={item.clave}>
                          {item.nombre}
                        </option>
                      ))}
                    </select>
                    {errores.resultado && <div className="invalid-feedback">{errores.resultado}</div>}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" htmlFor="estadoProceso">
                      Estado del proceso
                    </label>
                    <select
                      className="form-select bg-light"
                      id="estadoProceso"
                      value={solicitud.estado}
                      disabled
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En proceso</option>
                      <option value="finalizada">Finalizada</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="observaciones">
                    Observaciones psicolaborales <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${errores.observaciones ? 'is-invalid' : ''}`}
                    id="observaciones"
                    name="observaciones"
                    rows={6}
                    maxLength={250}
                    value={formulario.observaciones}
                    onChange={actualizarCampo}
                    disabled={soloLectura}
                    placeholder="Describe los hallazgos de la evaluación: perfil de competencias, ajuste al cargo, recomendaciones y plan de seguimiento."
                    required
                  />
                  {errores.observaciones ? (
                    <div className="invalid-feedback">{errores.observaciones}</div>
                  ) : (
                    <div className="form-text">
                      {formulario.observaciones.trim().length}/250 caracteres · mínimo 20 para finalizar.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="aqua-card mt-3">
              <div className="card-header">
                <i className="bi bi-clipboard2-pulse me-2" aria-hidden="true" />
                Batería complementaria (opcional)
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="cargoActual">
                      Cargo al que fue expuesto/a
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="cargoActual"
                      name="cargoActual"
                      maxLength={100}
                      value={formulario.cargoActual}
                      onChange={actualizarCampo}
                      disabled={soloLectura}
                      placeholder={cargo !== '-' ? cargo : 'Cargo evaluado'}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="comentarioEntrevista">
                      Comentario de entrevista
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="comentarioEntrevista"
                      name="comentarioEntrevista"
                      maxLength={250}
                      value={formulario.comentarioEntrevista}
                      onChange={actualizarCampo}
                      disabled={soloLectura}
                      placeholder="Impresiones del evaluador"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="aqua-card mt-3">
              <div className="card-body d-flex flex-column flex-sm-row gap-2">
                {!soloLectura && (
                  <>
                    <button type="submit" className="btn btn-aqua px-4" disabled={guardando}>
                      {guardando ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle me-1" aria-hidden="true" />
                          Guardar y Finalizar Evaluación
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-soft px-4"
                      onClick={() => guardar('borrador')}
                      disabled={guardando}
                    >
                      <i className="bi bi-save me-1" aria-hidden="true" />
                      Guardar borrador
                    </button>
                  </>
                )}
                <Link to="/evaluador/mis-solicitudes" className="btn btn-outline-aqua px-4">
                  <i className="bi bi-x-circle me-1" aria-hidden="true" />
                  {soloLectura ? 'Volver a mis solicitudes' : 'Cancelar'}
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      <VisorCvModal candidato={candidato} visible={cvVisible} onCerrar={() => setCvVisible(false)} />

      {confirmacion && (
        <ConfirmacionModal
          visible
          titulo={confirmacion.accion === 'finalizar' ? 'Evaluación finalizada' : 'Borrador guardado'}
          acciones={
            confirmacion.accion === 'finalizar'
              ? [
                  {
                    etiqueta: 'Volver a mis solicitudes',
                    variante: 'btn-aqua',
                    onClick: () => {
                      setConfirmacion(null);
                      navegar('/evaluador/mis-solicitudes');
                    },
                  },
                ]
              : [
                  {
                    etiqueta: 'Seguir editando',
                    onClick: () => setConfirmacion(null),
                  },
                  {
                    etiqueta: 'Volver a mis solicitudes',
                    variante: 'btn-aqua',
                    onClick: () => {
                      setConfirmacion(null);
                      navegar('/evaluador/mis-solicitudes');
                    },
                  },
                ]
          }
        >
          La solicitud <strong>{codigo}</strong> quedó en estado{' '}
          <strong>{confirmacion.estado === 'finalizada' ? 'Finalizada' : 'En proceso'}</strong>
          {confirmacion.accion === 'finalizar' && (
            <>
              {' '}
              con resultado <strong>{resultadoNombre}</strong>
            </>
          )}
          .
        </ConfirmacionModal>
      )}
    </>
  );
}
