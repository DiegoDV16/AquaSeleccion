import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import TipoPostulacionBadge from '../../components/ui/TipoPostulacionBadge.jsx';
import VisorCvModal from '../../components/ui/VisorCvModal.jsx';
import { actualizarCandidato, crearCandidato, listarCandidatos } from '../../services/candidatosApi.js';
import { listarFamiliasCargos } from '../../services/catalogosApi.js';
import { filtrarCandidatos } from './filtros.js';
import { formatearFecha } from '../../mock/solicitudes.js';

const ESTADOS_CANDIDATO = {
  pendiente: { nombre: 'Pendiente', clase: 'badge-estado-pendiente' },
  en_proceso: { nombre: 'En proceso', clase: 'badge-estado-proceso' },
  apto: { nombre: 'Apto', clase: 'badge-estado-apto' },
  no_apto: { nombre: 'No apto', clase: 'badge-estado-noapto' },
  con_observaciones: { nombre: 'Con observaciones', clase: 'badge-estado-observaciones' },
};

const FORMULARIO_INICIAL = {
  id: null,
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correo: '',
  telefono: '',
  idFamiliaCargo: '',
  idCargo: '',
  observaciones: '',
};

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * AnalistaCandidatos
 * Listado de candidatos registrados en MySQL. Permite registrar y editar los
 * datos principales, revisar el detalle y previsualizar el CV almacenado.
 */
export default function AnalistaCandidatos() {
  const [candidatos, setCandidatos] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [errorCatalogos, setErrorCatalogos] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [detalle, setDetalle] = useState(null);
  const [candidatoCv, setCandidatoCv] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [errores, setErrores] = useState({});
  const [errorFormulario, setErrorFormulario] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarCandidatos = useCallback(async () => {
    setCargando(true);
    setError('');

    const datos = await listarCandidatos();

    if (!datos?.ok) {
      setError(datos?.mensaje ?? 'No se pudieron cargar los candidatos.');
      setCandidatos([]);
    } else {
      setCandidatos(datos.candidatos ?? []);
    }

    setCargando(false);
  }, []);

  useEffect(() => {
    cargarCandidatos();
  }, [cargarCandidatos]);

  useEffect(() => {
    let vigente = true;

    listarFamiliasCargos().then((datos) => {
      if (!vigente) return;

      if (!datos?.ok) {
        setErrorCatalogos(datos?.mensaje ?? 'No se pudieron cargar las familias y cargos.');
        return;
      }

      setFamilias(datos.familias ?? []);
    });

    return () => {
      vigente = false;
    };
  }, []);

  const visibles = useMemo(
    () => filtrarCandidatos(candidatos, { busqueda, tipo: filtroTipo }),
    [candidatos, busqueda, filtroTipo],
  );

  const cargosDisponibles = useMemo(() => {
    const familia = familias.find((item) => item.id === Number(formulario.idFamiliaCargo));

    return familia?.cargos ?? [];
  }, [familias, formulario.idFamiliaCargo]);

  const catalogosListos = familias.length > 0;

  function abrirCrear() {
    setFormulario(FORMULARIO_INICIAL);
    setErrores({});
    setErrorFormulario('');
    setMensaje('');
    setModalAbierto(true);
  }

  function abrirEditar(candidato) {
    setFormulario({
      id: candidato.id,
      nombres: candidato.nombres ?? '',
      apellidoPaterno: candidato.apellidoPaterno ?? '',
      apellidoMaterno: candidato.apellidoMaterno ?? '',
      correo: candidato.correo ?? '',
      telefono: candidato.telefono ?? '',
      idFamiliaCargo: String(candidato.idFamiliaCargo ?? ''),
      idCargo: String(candidato.idCargo ?? ''),
      observaciones: candidato.observaciones ?? '',
    });
    setErrores({});
    setErrorFormulario('');
    setMensaje('');
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;
    setModalAbierto(false);
  }

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: undefined }));
  }

  function seleccionarFamilia(evento) {
    setFormulario((actual) => ({
      ...actual,
      idFamiliaCargo: evento.target.value,
      idCargo: '',
    }));
    setErrores((actual) => ({ ...actual, idFamiliaCargo: undefined, idCargo: undefined }));
  }

  function validarFormulario() {
    const nuevosErrores = {};
    const nombres = formulario.nombres.trim();
    const apellidoPaterno = formulario.apellidoPaterno.trim();
    const apellidoMaterno = formulario.apellidoMaterno.trim();
    const correo = formulario.correo.trim();
    const telefono = formulario.telefono.trim();

    if (!nombres) nuevosErrores.nombres = 'Ingresa los nombres del candidato.';
    else if (nombres.length > 50) nuevosErrores.nombres = 'Maximo 50 caracteres.';

    if (!apellidoPaterno) nuevosErrores.apellidoPaterno = 'Ingresa el apellido paterno.';
    else if (apellidoPaterno.length > 25) nuevosErrores.apellidoPaterno = 'Maximo 25 caracteres.';

    if (!apellidoMaterno) nuevosErrores.apellidoMaterno = 'Ingresa el apellido materno.';
    else if (apellidoMaterno.length > 25) nuevosErrores.apellidoMaterno = 'Maximo 25 caracteres.';

    if (!correo || !CORREO_VALIDO.test(correo)) nuevosErrores.correo = 'Ingresa un correo valido.';
    else if (correo.length > 50) nuevosErrores.correo = 'Maximo 50 caracteres.';

    if (!telefono) nuevosErrores.telefono = 'Ingresa un telefono de contacto.';
    else if (telefono.length > 15) nuevosErrores.telefono = 'Maximo 15 caracteres.';

    if (!formulario.idFamiliaCargo) nuevosErrores.idFamiliaCargo = 'Selecciona la familia de cargo.';
    if (!formulario.idCargo) nuevosErrores.idCargo = 'Selecciona el cargo al que postula.';

    if (formulario.observaciones.length > 500) {
      nuevosErrores.observaciones = 'Maximo 500 caracteres.';
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  }

  async function guardar(evento) {
    evento.preventDefault();

    if (guardando) return;

    if (!validarFormulario()) return;

    setGuardando(true);
    setErrorFormulario('');

    const datos = {
      nombres: formulario.nombres.trim(),
      apellidoPaterno: formulario.apellidoPaterno.trim(),
      apellidoMaterno: formulario.apellidoMaterno.trim(),
      correo: formulario.correo.trim(),
      telefono: formulario.telefono.trim(),
      idFamiliaCargo: Number(formulario.idFamiliaCargo),
      idCargo: Number(formulario.idCargo),
      observaciones: formulario.observaciones.trim(),
    };

    const respuesta = formulario.id
      ? await actualizarCandidato({ idCandidato: formulario.id, ...datos })
      : await crearCandidato(datos);

    if (!respuesta?.ok) {
      setErrorFormulario(respuesta?.mensaje ?? 'No se pudo guardar el candidato.');
      setGuardando(false);
      return;
    }

    setModalAbierto(false);
    setMensaje(respuesta.mensaje ?? 'Candidato guardado correctamente.');
    setGuardando(false);

    await cargarCandidatos();
  }

  const totalExternas = candidatos.filter((candidato) => candidato.tipoPostulacion === 'externa').length;
  const totalInternas = candidatos.filter((candidato) => candidato.tipoPostulacion === 'interna').length;

  return (
    <>
      <PageHeader
        etiqueta="Modulo Analista"
        titulo="Candidatos registrados"
        descripcion={`${candidatos.length} postulaciones en el sistema (${totalExternas} externas y ${totalInternas} internas)`}
        acciones={
          <button
            type="button"
            className="btn btn-aqua btn-sm"
            onClick={abrirCrear}
            disabled={!catalogosListos || Boolean(errorCatalogos)}
            title={
              errorCatalogos ||
              (catalogosListos ? 'Registrar un candidato externo' : 'Cargando catalogo de cargos')
            }
          >
            <i className="bi bi-person-plus me-1" aria-hidden="true" />
            Registrar candidato
          </button>
        }
      />

      {mensaje && (
        <div className="alert alert-success d-flex justify-content-between align-items-center" role="status">
          <span>
            <i className="bi bi-check-circle me-2" aria-hidden="true" />
            {mensaje}
          </span>
          <button type="button" className="btn-close" onClick={() => setMensaje('')} aria-label="Cerrar" />
        </div>
      )}

      {errorCatalogos && (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
          {errorCatalogos} No se podra registrar ni editar hasta recuperar el catalogo.
        </div>
      )}

      <div className="aqua-card">
        <div className="card-header">
          <div className="row g-2">
            <div className="col-lg-6">
              <label className="visually-hidden" htmlFor="busqueda-candidatos">
                Buscar candidatos
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white" aria-hidden="true">
                  <i className="bi bi-search" />
                </span>
                <input
                  type="search"
                  className="form-control"
                  id="busqueda-candidatos"
                  placeholder="Buscar por nombre, correo o telefono"
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                />
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <label className="visually-hidden" htmlFor="filtro-origen">
                Filtrar por origen
              </label>
              <select
                className="form-select form-select-sm"
                id="filtro-origen"
                value={filtroTipo}
                onChange={(evento) => setFiltroTipo(evento.target.value)}
              >
                <option value="todas">Internas y externas</option>
                <option value="externa">Solo externas</option>
                <option value="interna">Solo internas</option>
              </select>
            </div>
            <div className="col-lg-3 d-flex align-items-center justify-content-lg-end text-muted-aqua">
              <small>{visibles.length} resultados</small>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="card-body text-center py-5 text-muted-aqua">
            <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
            <p className="mb-0 small">Cargando candidatos...</p>
          </div>
        ) : error ? (
          <div className="card-body">
            <div
              className="alert alert-danger d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-0"
              role="alert"
            >
              <span>
                <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
                {error}
              </span>
              <button type="button" className="btn btn-soft btn-sm" onClick={cargarCandidatos}>
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table aqua-table mb-0">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Candidato</th>
                  <th scope="col">Origen</th>
                  <th scope="col">Cargo postulado</th>
                  <th scope="col">Postulacion</th>
                  <th scope="col">Estado</th>
                  <th scope="col">CV</th>
                  <th scope="col" className="text-end">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((candidato) => {
                  const estado = ESTADOS_CANDIDATO[candidato.estado] ?? ESTADOS_CANDIDATO.pendiente;
                  return (
                    <tr key={candidato.id}>
                      <td className="text-muted-aqua">{candidato.id}</td>
                      <td>
                        <span className="fw-semibold">{candidato.nombreCompleto}</span>
                        <span className="d-block text-muted-aqua" style={{ fontSize: '0.78rem' }}>
                          {candidato.correo} &middot; {candidato.telefono ?? 'sin telefono'}
                        </span>
                      </td>
                      <td>
                        <TipoPostulacionBadge tipo={candidato.tipoPostulacion} />
                      </td>
                      <td className="text-muted-aqua">
                        <span className="d-block">{candidato.cargo}</span>
                        <span className="d-block" style={{ fontSize: '0.76rem' }}>
                          {candidato.familiaCargo}
                        </span>
                      </td>
                      <td className="text-muted-aqua small text-nowrap">
                        {formatearFecha(candidato.fechaPostulacion)}
                      </td>
                      <td>
                        <span className={`badge badge-estado ${estado.clase}`}>{estado.nombre}</span>
                        {candidato.tieneSolicitudActiva && (
                          <span className="d-block text-muted-aqua mt-1" style={{ fontSize: '0.72rem' }}>
                            Solicitud activa
                          </span>
                        )}
                      </td>
                      <td className="small text-muted-aqua text-truncate" style={{ maxWidth: 140 }}>
                        {candidato.cvArchivo ? candidato.cvArchivo.split('/').pop() : 'No aplica'}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-soft"
                            onClick={() => setDetalle(candidato)}
                            title="Ver detalle"
                          >
                            <i className="bi bi-eye" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-soft"
                            onClick={() => setCandidatoCv(candidato)}
                            disabled={!candidato.cvArchivo}
                            title={candidato.cvArchivo ? 'Previsualizar CV' : 'Postulacion sin CV adjunto'}
                          >
                            <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-soft"
                            onClick={() => abrirEditar(candidato)}
                            disabled={!catalogosListos}
                            title={catalogosListos ? 'Editar datos principales' : 'Cargando catalogo de cargos'}
                          >
                            <i className="bi bi-pencil-square" aria-hidden="true" />
                          </button>
                          {candidato.tieneSolicitudActiva ? (
                            <button
                              type="button"
                              className="btn btn-soft"
                              disabled
                              title="El candidato ya tiene una solicitud activa"
                            >
                              <i className="bi bi-file-earmark-plus" aria-hidden="true" />
                            </button>
                          ) : (
                            <Link
                              to={`/analista/nueva-solicitud?candidato=${candidato.id}`}
                              className="btn btn-soft"
                              title="Crear solicitud de evaluacion"
                            >
                              <i className="bi bi-file-earmark-plus" aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted-aqua py-4">
                      No hay candidatos que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detalle del candidato */}
      {detalle && (
        <>
          <div
            className="modal fade show d-block"
            id="detalle-candidato"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalle-candidato-titulo"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="detalle-candidato-titulo">
                    <i className="bi bi-person-vcard me-2" aria-hidden="true" />
                    {detalle.nombreCompleto}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setDetalle(null)} aria-label="Cerrar" />
                </div>
                <div className="modal-body">
                  <div className="row g-3 small">
                    <div className="col-md-6">
                      <p className="text-muted-aqua mb-1">Correo</p>
                      <p className="mb-3">{detalle.correo}</p>
                      <p className="text-muted-aqua mb-1">Telefono</p>
                      <p className="mb-3">{detalle.telefono ?? '-'}</p>
                      <p className="text-muted-aqua mb-1">Origen de la postulacion</p>
                      <p className="mb-3">
                        <TipoPostulacionBadge tipo={detalle.tipoPostulacion} />
                      </p>
                      <p className="text-muted-aqua mb-1">Estado del candidato</p>
                      <p className="mb-0">
                        <span
                          className={`badge badge-estado ${
                            (ESTADOS_CANDIDATO[detalle.estado] ?? ESTADOS_CANDIDATO.pendiente).clase
                          }`}
                        >
                          {(ESTADOS_CANDIDATO[detalle.estado] ?? ESTADOS_CANDIDATO.pendiente).nombre}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted-aqua mb-1">Cargo postulado</p>
                      <p className="mb-3">{detalle.cargo}</p>
                      <p className="text-muted-aqua mb-1">Familia de cargo</p>
                      <p className="mb-3">{detalle.familiaCargo}</p>
                      <p className="text-muted-aqua mb-1">Fecha de postulacion</p>
                      <p className="mb-3">{formatearFecha(detalle.fechaPostulacion)}</p>
                      <p className="text-muted-aqua mb-1">Solicitud de evaluacion</p>
                      <p className="mb-0">
                        {detalle.idSolicitudReciente
                          ? `SOL-${String(detalle.idSolicitudReciente).padStart(4, '0')}`
                          : 'Sin solicitud creada'}
                      </p>
                    </div>
                    {detalle.observaciones && (
                      <div className="col-12">
                        <p className="text-muted-aqua mb-1">Observaciones</p>
                        <p className="mb-0">{detalle.observaciones}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-soft" onClick={() => setDetalle(null)}>
                    Cerrar
                  </button>
                  <button
                    type="button"
                    className="btn btn-soft"
                    onClick={() => setCandidatoCv(detalle)}
                    disabled={!detalle.cvArchivo}
                  >
                    <i className="bi bi-file-earmark-pdf me-1" aria-hidden="true" />
                    Ver CV
                  </button>
                  <button
                    type="button"
                    className="btn btn-soft"
                    onClick={() => {
                      setDetalle(null);
                      abrirEditar(detalle);
                    }}
                  >
                    <i className="bi bi-pencil-square me-1" aria-hidden="true" />
                    Editar
                  </button>
                  {!detalle.tieneSolicitudActiva && (
                    <Link
                      to={`/analista/nueva-solicitud?candidato=${detalle.id}`}
                      className="btn btn-aqua"
                      onClick={() => setDetalle(null)}
                    >
                      <i className="bi bi-file-earmark-plus me-1" aria-hidden="true" />
                      Crear solicitud
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {/* Formulario de registro / edicion */}
      {modalAbierto && (
        <>
          <div
            className="modal fade show d-block"
            id="formulario-candidato"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="formulario-candidato-titulo"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="formulario-candidato-titulo">
                    <i className="bi bi-person-plus me-2" aria-hidden="true" />
                    {formulario.id ? 'Editar candidato' : 'Registrar candidato'}
                  </h5>
                  <button type="button" className="btn-close" onClick={cerrarModal} aria-label="Cerrar" />
                </div>
                <form className="aqua-form" onSubmit={guardar} noValidate>
                  <div className="modal-body">
                    {errorFormulario && (
                      <div className="alert alert-danger" role="alert">
                        <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
                        {errorFormulario}
                      </div>
                    )}

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="nombres">
                          Nombres <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errores.nombres ? 'is-invalid' : ''}`}
                          id="nombres"
                          name="nombres"
                          maxLength={50}
                          value={formulario.nombres}
                          onChange={actualizarCampo}
                          required
                        />
                        {errores.nombres && <div className="invalid-feedback">{errores.nombres}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" htmlFor="apellidoPaterno">
                          Apellido paterno <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errores.apellidoPaterno ? 'is-invalid' : ''}`}
                          id="apellidoPaterno"
                          name="apellidoPaterno"
                          maxLength={25}
                          value={formulario.apellidoPaterno}
                          onChange={actualizarCampo}
                          required
                        />
                        {errores.apellidoPaterno && (
                          <div className="invalid-feedback">{errores.apellidoPaterno}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" htmlFor="apellidoMaterno">
                          Apellido materno <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errores.apellidoMaterno ? 'is-invalid' : ''}`}
                          id="apellidoMaterno"
                          name="apellidoMaterno"
                          maxLength={25}
                          value={formulario.apellidoMaterno}
                          onChange={actualizarCampo}
                          required
                        />
                        {errores.apellidoMaterno && (
                          <div className="invalid-feedback">{errores.apellidoMaterno}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" htmlFor="correo">
                          Correo electronico <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
                          id="correo"
                          name="correo"
                          maxLength={50}
                          value={formulario.correo}
                          onChange={actualizarCampo}
                          required
                        />
                        {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" htmlFor="telefono">
                          Telefono <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                          id="telefono"
                          name="telefono"
                          maxLength={15}
                          value={formulario.telefono}
                          onChange={actualizarCampo}
                          placeholder="+56 9 1234 5678"
                          required
                        />
                        {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" htmlFor="idFamiliaCargo">
                          Familia de cargo <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select ${errores.idFamiliaCargo ? 'is-invalid' : ''}`}
                          id="idFamiliaCargo"
                          name="idFamiliaCargo"
                          value={formulario.idFamiliaCargo}
                          onChange={seleccionarFamilia}
                          required
                        >
                          <option value="">Seleccione una familia</option>
                          {familias.map((familia) => (
                            <option key={familia.id} value={familia.id}>
                              {familia.nombre}
                            </option>
                          ))}
                        </select>
                        {errores.idFamiliaCargo && (
                          <div className="invalid-feedback">{errores.idFamiliaCargo}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" htmlFor="idCargo">
                          Cargo al que postula <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select ${errores.idCargo ? 'is-invalid' : ''}`}
                          id="idCargo"
                          name="idCargo"
                          value={formulario.idCargo}
                          onChange={actualizarCampo}
                          disabled={!formulario.idFamiliaCargo}
                          required
                        >
                          <option value="">
                            {formulario.idFamiliaCargo ? 'Seleccione un cargo' : 'Elija primero la familia'}
                          </option>
                          {cargosDisponibles.map((cargo) => (
                            <option key={cargo.id} value={cargo.id}>
                              {cargo.nombre}
                            </option>
                          ))}
                        </select>
                        {errores.idCargo && <div className="invalid-feedback">{errores.idCargo}</div>}
                      </div>

                      <div className="col-12">
                        <label className="form-label" htmlFor="observaciones">
                          Observaciones
                        </label>
                        <textarea
                          className={`form-control ${errores.observaciones ? 'is-invalid' : ''}`}
                          id="observaciones"
                          name="observaciones"
                          rows={3}
                          maxLength={500}
                          value={formulario.observaciones}
                          onChange={actualizarCampo}
                          placeholder="Antecedentes del candidato o contexto de la postulacion (opcional)"
                        />
                        {errores.observaciones ? (
                          <div className="invalid-feedback">{errores.observaciones}</div>
                        ) : (
                          <div className="form-text">{formulario.observaciones.length}/500 caracteres</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-soft" onClick={cerrarModal} disabled={guardando}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-aqua" disabled={guardando}>
                      {guardando ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle me-1" aria-hidden="true" />
                          Guardar candidato
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      <VisorCvModal candidato={candidatoCv} visible={Boolean(candidatoCv)} onCerrar={() => setCandidatoCv(null)} />
    </>
  );
}
