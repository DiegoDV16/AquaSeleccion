import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import EstadoBadge from '../../components/ui/EstadoBadge.jsx';
import FichaPostulante from '../../components/ui/FichaPostulante.jsx';
import VisorCvModal from '../../components/ui/VisorCvModal.jsx';
import { useAuth } from '../../context/AuthContext.js';
import { obtenerCandidato } from '../../mock/candidatos.js';
import { obtenerCargo, obtenerFamilia } from '../../mock/cargos.js';
import { ESTADOS_SOLICITUD, RESULTADOS_EVALUACION, obtenerSolicitud } from '../../mock/solicitudes.js';
import { descargarCv } from '../../services/candidatosApi.js';

/**
 * EvaluadorEvaluar
 * Formulario de evaluación psicolaboral de la solicitud :id.
 * Persistencia prevista: PUT /evaluaciones/{id}.
 */
export default function EvaluadorEvaluar() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { usuario } = useAuth();

  const solicitud = useMemo(() => obtenerSolicitud(id), [id]);
  const candidato = useMemo(() => obtenerCandidato(solicitud?.candidato_id), [solicitud]);
  const cargo = obtenerCargo(solicitud?.cargo_id);
  const familia = cargo ? obtenerFamilia(cargo.familia_id) : null;

  const [formulario, setFormulario] = useState({
    fecha_evaluacion: solicitud?.fecha_evaluacion ?? '',
    resultado: solicitud?.resultado ?? '',
    estado: solicitud?.estado ?? 'pendiente',
    observaciones: solicitud?.observaciones ?? '',
    CargoActual: '',
    comentarioEntrevista: '',
  });
  const [errores, setErrores] = useState({});
  const [cvVisible, setCvVisible] = useState(false);
  const [confirmacion, setConfirmacion] = useState(false);

  function descargarCvPrueba() {
    const cargo = candidato?.cargo ?? '-';
    const nombre = candidato?.nombreCompleto ??
      `${candidato?.nombres ?? ''} ${candidato?.apellido_paterno ?? candidato?.apellidoPaterno ?? ''}`.trim();
    const limpiar = (texto) => String(texto ?? '-')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\\()]/g, '\\$&');
    const contenido = [
      `CV de prueba`,
      `Nombre: ${limpiar(nombre)}`,
      `Correo: ${limpiar(candidato?.correo)}`,
      `Telefono: ${limpiar(candidato?.telefono)}`,
      `Cargo evaluado: ${limpiar(cargo)}`,
      `Fecha de postulacion: ${limpiar(candidato?.fechaPostulacion ?? candidato?.fecha_postulacion)}`,
    ];
    const comandos = ['BT', '/F1 14 Tf', '50 780 Td', ...contenido.flatMap((linea, indice) =>
      indice === 0
        ? [`(${limpiar(linea)}) Tj`, '0 -24 Td']
        : [`(0${indice}. ${limpiar(linea)}) Tj`, '0 -28 Td']
    ), 'ET'].join('\n');

    const objetos = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
      '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
      `5 0 obj\n<< /Length ${comandos.length} >>\nstream\n${comandos}\nendstream\nendobj\n`,
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objetos.forEach((objeto) => {
      offsets.push(pdf.length);
      pdf += objeto;
    });
    const xref = pdf.length;
    pdf += `xref\n0 6\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

    const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `CV_prueba_${nombre.replace(/[^a-zA-Z0-9]+/g, '_') || 'postulante'}.pdf`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  }

  async function descargarCurriculum() {
    if (!candidato?.id) return;
    const resultado = await descargarCv(candidato.id);
    if (!resultado.ok) return;

    const objetoUrl = URL.createObjectURL(resultado.blob);
    const enlace = document.createElement('a');
    enlace.href = objetoUrl;
    enlace.download = resultado.nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(objetoUrl);
  }

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: undefined }));
  }

  function validar() {
    const nuevosErrores = {};
    if (!formulario.fecha_evaluacion) nuevosErrores.fecha_evaluacion = 'Ingresa la fecha de la evaluación.';
    if (formulario.estado === 'finalizada') {
      if (!formulario.resultado) nuevosErrores.resultado = 'Selecciona el resultado de la evaluación.';
      if (formulario.observaciones.trim().length < 20)
        nuevosErrores.observaciones = 'Detalla las observaciones (mínimo 20 caracteres).';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function guardarFinalizada() {
    if (!validar()) return;
    setConfirmacion(true);
  }

  function guardarBorrador() {
    setConfirmacion(true);
  }

  if (!solicitud) {
    return (
      <>
        <PageHeader etiqueta="Modulo Evaluador" titulo="Solicitud no encontrada" />
        <div className="aqua-card">
          <div className="card-body text-center py-5">
            <i className="bi bi-question-circle fs-1 text-muted-aqua d-block mb-3" aria-hidden="true" />
            <p className="mb-1 fw-semibold">No existe la solicitud {id}</p>
            <p className="text-muted-aqua small mb-3">
              Verifica el identificador en tus solicitudes asignadas.
            </p>
            <Link to="/evaluador/mis-solicitudes" className="btn btn-aqua btn-sm">
              Volver a mis solicitudes
            </Link>
          </div>
        </div>
      </>
    );
  }

  const soloLectura = formulario.estado === 'finalizada';

  return (
    <>
      <PageHeader
        etiqueta={`Modulo Evaluador · ${solicitud.id}`}
        titulo={`Evaluación psicolaboral · ${candidato ? `${candidato.nombres} ${candidato.apellido_paterno}` : ''}`}
        descripcion={`Cargo evaluado: ${familia ? `${familia.nombre} / ` : ''}${cargo ? cargo.nombre : '-'} · Asignada el ${solicitud.fecha_asignacion}`}
        acciones={
          <>
            <EstadoBadge estado={formulario.estado} />
            <Link to="/evaluador/mis-solicitudes" className="btn btn-soft btn-sm">
              <i className="bi bi-arrow-left me-1" aria-hidden="true" />
              Volver
            </Link>
          </>
        }
      />

      <div className="row g-3">
        {/* Datos del postulante */}
        <div className="col-lg-4">
          <FichaPostulante
            candidato={candidato}
            onCvPreview={() => setCvVisible(true)}
            onCvDownload={descargarCurriculum}
            onCvTestDownload={descargarCvPrueba}
          />
        </div>

        {/* Formulario de evaluación */}
        <div className="col-lg-8">
          <form
            className="aqua-form evaluacion-formulario"
            onSubmit={(evento) => {
              evento.preventDefault();
              guardarFinalizada();
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
                      La solicitud está finalizada. Los campos quedan deshabilitados mientras no cambies el
                      estado del proceso.
                    </span>
                  </div>
                )}

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="fecha_evaluacion">
                      Fecha de evaluación <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-control ${errores.fecha_evaluacion ? 'is-invalid' : ''}`}
                      id="fecha_evaluacion"
                      name="fecha_evaluacion"
                      value={formulario.fecha_evaluacion}
                      onChange={actualizarCampo}
                      disabled={soloLectura}
                      required
                    />
                    {errores.fecha_evaluacion && <div className="invalid-feedback">{errores.fecha_evaluacion}</div>}
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
                      {RESULTADOS_EVALUACION.map((item) => (
                        <option key={item.clave} value={item.clave}>
                          {item.nombre}
                        </option>
                      ))}
                    </select>
                    {errores.resultado && <div className="invalid-feedback">{errores.resultado}</div>}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" htmlFor="estado">
                      Estado del proceso <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="estado"
                      name="estado"
                      value={formulario.estado}
                      onChange={actualizarCampo}
                    >
                      {ESTADOS_SOLICITUD.map((estado) => (
                        <option key={estado.clave} value={estado.clave}>
                          {estado.nombre}
                        </option>
                      ))}
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
                      {formulario.observaciones.trim().length} caracteres &middot; obligatorio para cerrar el
                      proceso.
                    </div>
                  )}
                </div>

            </div>
          </div>

          <div className="aqua-card bateria-complementaria mt-3">
            <div className="card-header">
              <i className="bi bi-clipboard2-pulse me-2" aria-hidden="true" />
              Batería complementaria (opcional)
            </div>
            <div className="card-body">
              <div className="row g-3 bateria-campos">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="cargoActual">
                    Cargo al que fue expuesto/a
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="cargoActual"
                    name="CargoActual"
                    value={formulario.CargoActual}
                    onChange={actualizarCampo}
                    disabled={soloLectura}
                    placeholder={cargo ? cargo.nombre : 'Cargo evaluado'}
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
                    value={formulario.comentarioEntrevista}
                    onChange={actualizarCampo}
                    disabled={soloLectura}
                    placeholder="Impresiones del evaluador"
                  />
                </div>
              </div>

              <div className="evaluacion-acciones d-flex flex-column flex-sm-row gap-2">
                <button type="submit" className="btn btn-aqua px-4">
                  <i className="bi bi-check2-circle me-1" aria-hidden="true" />
                  Guardar y Finalizar Evaluación
                </button>
                <button type="button" className="btn btn-soft px-4" onClick={guardarBorrador}>
                  <i className="bi bi-save me-1" aria-hidden="true" />
                  Guardar borrador
                </button>
                <button
                  type="button"
                  className="btn btn-outline-aqua px-4"
                  onClick={() => navegar('/evaluador/mis-solicitudes')}
                >
                  <i className="bi bi-x-circle me-1" aria-hidden="true" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          <p className="text-muted-aqua mt-3 mb-0" style={{ fontSize: '0.76rem' }}>
            Maquetado: al finalizar se registra un movimiento en la trazabilidad de{' '}
            <code>historialsolicitudes</code> con estado Finalizada.
          </p>
          </form>
        </div>
      </div>

      <VisorCvModal candidato={candidato} visible={cvVisible} onCerrar={() => setCvVisible(false)} />

      {confirmacion && (
        <>
          <div
            className="modal fade show d-block"
            id="evaluacion-guardada"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="evaluacion-guardada-titulo"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center p-4">
                  <span className="stat-icon bg-tint-success mx-auto mb-3" style={{ width: 60, height: 60, fontSize: '1.8rem' }} aria-hidden="true">
                    <i className="bi bi-check-lg" />
                  </span>
                  <h2 className="h5 fw-semibold mb-2" id="evaluacion-guardada-titulo">
                    {formulario.estado === 'finalizada' ? 'Evaluación finalizada' : 'Borrador guardado'}
                  </h2>
                  <p className="text-muted-aqua small mb-0">
                    La solicitud <strong>{solicitud.id}</strong> quedó en estado{' '}
                    <strong>{ESTADOS_SOLICITUD.find((estado) => estado.clave === formulario.estado)?.nombre}</strong>
                    {formulario.resultado && (
                      <>
                        {' '}
                        con resultado{' '}
                        <strong>
                          {RESULTADOS_EVALUACION.find((item) => item.clave === formulario.resultado)?.nombre}
                        </strong>
                      </>
                    )}
                    . El Analista de reclutamiento ya puede verlo en su módulo.
                  </p>
                </div>
                <div className="modal-footer justify-content-center border-0 pt-0">
                  <button type="button" className="btn btn-soft" onClick={() => setConfirmacion(false)}>
                    Seguir editando
                  </button>
                  <button
                    type="button"
                    className="btn btn-aqua"
                    onClick={() => navegar('/evaluador/mis-solicitudes')}
                  >
                    Volver a mis solicitudes
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </>
  );
}