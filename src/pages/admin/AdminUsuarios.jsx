import { useCallback, useEffect, useMemo, useState } from 'react';

import PageHeader from '../../components/ui/PageHeader.jsx';
import ConfirmacionModal from '../../components/ui/ConfirmacionModal.jsx';
import Paginacion from '../../components/ui/Paginacion.jsx';
import { useAuth } from '../../context/AuthContext.js';
import { useValorDiferido } from '../../hooks/useValorDiferido.js';
import { CLAVE_ROLES, ROLES, obtenerRol } from '../../mock/catalogoRoles.js';
import { actualizarUsuario, crearUsuario, eliminarUsuario, listarUsuarios } from '../../services/usuariosApi.js';

const TAMANO_PAGINA = 8;

const ESTADO_INICIAL_FORMULARIO_CREAR = {
  idUsuario: '',
  idRol: '',
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correo: '',
  contrasena: '',
  estado: 1,
};

const ESTADO_INICIAL_FORMULARIO_EDITAR = {
  idUsuario: '',
  idRol: '',
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correo: '',
  contrasena: '',
  estado: 1,
  nombreCompleto: '',
  rol_nombre: '',
};

/** Listado de usuarios del sistema con filtro por rol, estado y busqueda. */
export default function AdminUsuarios() {
  const { rolActivo } = useAuth();
  const soloLectura = rolActivo === CLAVE_ROLES.JEFATURA;
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const busquedaDiferida = useValorDiferido(busqueda, 250);

  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [formularioCrear, setFormularioCrear] = useState(ESTADO_INICIAL_FORMULARIO_CREAR);
  const [guardandoCrear, setGuardandoCrear] = useState(false);
  const [errorModalCrear, setErrorModalCrear] = useState('');
  const [exitoModalCrear, setExitoModalCrear] = useState('');

  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [formularioEditar, setFormularioEditar] = useState(ESTADO_INICIAL_FORMULARIO_EDITAR);
  const [guardandoEditar, setGuardandoEditar] = useState(false);
  const [errorModalEditar, setErrorModalEditar] = useState('');
  const [exitoModalEditar, setExitoModalEditar] = useState('');

  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [usuarioEliminar, setUsuarioEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorModalEliminar, setErrorModalEliminar] = useState('');
  const [exitoModalEliminar, setExitoModalEliminar] = useState('');
  const [confirmacionUsuario, setConfirmacionUsuario] = useState(null);

  const cargarUsuarios = useCallback(() => {
    setCargando(true);
    setError('');
    listarUsuarios()
      .then((datos) => {
        if (!datos?.ok) {
          setError(datos?.mensaje ?? 'No se pudieron cargar los usuarios.');
          return;
        }
        setUsuarios(datos.usuarios);
      })
      .finally(() => {
        setCargando(false);
      });
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const abrirModalCrear = () => {
    setFormularioCrear(ESTADO_INICIAL_FORMULARIO_CREAR);
    setErrorModalCrear('');
    setExitoModalCrear('');
    setMostrarModalCrear(true);
  };

  const cerrarModalCrear = () => {
    if (guardandoCrear) return;
    setMostrarModalCrear(false);
    setErrorModalCrear('');
    setExitoModalCrear('');
    setFormularioCrear(ESTADO_INICIAL_FORMULARIO_CREAR);
  };

  const manejarCambioCrear = (evento) => {
    const { name, value, type, checked } = evento.target;
    setFormularioCrear((previo) => ({
      ...previo,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const manejarGuardarCrear = async (evento) => {
    evento.preventDefault();
    setErrorModalCrear('');
    setExitoModalCrear('');

    if (!formularioCrear.idRol) {
      setErrorModalCrear('Selecciona el rol del usuario.');
      return;
    }
    if (!formularioCrear.nombres.trim()) {
      setErrorModalCrear('Ingresa los nombres.');
      return;
    }
    if (!formularioCrear.apellidoPaterno.trim()) {
      setErrorModalCrear('Ingresa el apellido paterno.');
      return;
    }
    if (!formularioCrear.correo.trim()) {
      setErrorModalCrear('Ingresa el correo.');
      return;
    }
    if (!formularioCrear.contrasena) {
      setErrorModalCrear('Ingresa la contrasena.');
      return;
    }

    setGuardandoCrear(true);

    try {
      const datosResp = await crearUsuario({
        idRol: formularioCrear.idRol,
        nombres: formularioCrear.nombres.trim(),
        apellidoPaterno: formularioCrear.apellidoPaterno.trim(),
        apellidoMaterno: formularioCrear.apellidoMaterno.trim(),
        correo: formularioCrear.correo.trim(),
        contrasena: formularioCrear.contrasena,
        estado: formularioCrear.estado,
      });
      if (!datosResp?.ok) {
        setErrorModalCrear(datosResp?.mensaje ?? 'No se pudo crear el usuario.');
        return;
      }
      const nombre = `${formularioCrear.nombres.trim()} ${formularioCrear.apellidoPaterno.trim()}`.trim();
      const rol = ROLES.find((item) => item.id === Number(formularioCrear.idRol))?.nombre ?? 'el rol seleccionado';

      setMostrarModalCrear(false);
      setFormularioCrear(ESTADO_INICIAL_FORMULARIO_CREAR);
      setConfirmacionUsuario({
        titulo: 'Usuario creado',
        mensaje: (
          <>
            <strong>{nombre}</strong> fue creado correctamente con el rol <strong>{rol}</strong>.
          </>
        ),
        acciones: [
          {
            etiqueta: 'Crear otro',
            icono: 'person-plus',
            onClick: () => {
              setConfirmacionUsuario(null);
              abrirModalCrear();
            },
          },
          {
            etiqueta: 'Cerrar',
            variante: 'btn-aqua',
            onClick: () => setConfirmacionUsuario(null),
          },
        ],
      });
      cargarUsuarios();
    } catch {
      setErrorModalCrear('Ocurrio un error al crear el usuario.');
    } finally {
      setGuardandoCrear(false);
    }
  };

  const abrirModalEditar = (usuario) => {
    const rolSistema = obtenerRol(usuario.rol_id);
    const rolObj = ROLES.find((r) => r.clave === usuario.rol_id);

    const nombres = usuario.nombres ?? usuario.nombre?.split(' ')[0] ?? '';
    const apellidoPaterno = usuario.apellidoPaterno ?? usuario.nombre?.split(' ')[1] ?? '';
    const apellidoMaterno =
      usuario.apellidoMaterno ??
      (usuario.nombre ? usuario.nombre.split(' ').slice(2).join(' ') : '');

    setFormularioEditar({
      idUsuario: usuario.id,
      idRol: rolObj?.id ?? usuario.idRol ?? '',
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      correo: usuario.correo ?? '',
      contrasena: '',
      estado: usuario.estado === 'activo' ? 1 : 0,
      nombreCompleto: usuario.nombre ?? '',
      rol_nombre: usuario.rol_nombre ?? rolSistema.nombre,
    });
    setErrorModalEditar('');
    setExitoModalEditar('');
    setMostrarModalEditar(true);
  };

  const cerrarModalEditar = () => {
    if (guardandoEditar) return;
    setMostrarModalEditar(false);
    setErrorModalEditar('');
    setExitoModalEditar('');
    setFormularioEditar(ESTADO_INICIAL_FORMULARIO_EDITAR);
  };

  const manejarCambioEditar = (evento) => {
    const { name, value, type, checked } = evento.target;
    setFormularioEditar((previo) => ({
      ...previo,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const manejarGuardarEditar = async (evento) => {
    evento.preventDefault();
    setErrorModalEditar('');
    setExitoModalEditar('');

    if (!formularioEditar.idRol) {
      setErrorModalEditar('Selecciona el rol del usuario.');
      return;
    }
    if (!formularioEditar.nombres.trim()) {
      setErrorModalEditar('Ingresa los nombres.');
      return;
    }
    if (!formularioEditar.apellidoPaterno.trim()) {
      setErrorModalEditar('Ingresa el apellido paterno.');
      return;
    }
    if (!formularioEditar.correo.trim()) {
      setErrorModalEditar('Ingresa el correo.');
      return;
    }

    setGuardandoEditar(true);

    try {
      const datosResp = await actualizarUsuario({
        idUsuario: formularioEditar.idUsuario,
        idRol: formularioEditar.idRol,
        nombres: formularioEditar.nombres.trim(),
        apellidoPaterno: formularioEditar.apellidoPaterno.trim(),
        apellidoMaterno: formularioEditar.apellidoMaterno.trim(),
        correo: formularioEditar.correo.trim(),
        contrasena: formularioEditar.contrasena,
        estado: formularioEditar.estado,
      });
      if (!datosResp?.ok) {
        setErrorModalEditar(datosResp?.mensaje ?? 'No se pudo actualizar el usuario.');
        return;
      }
      const nombre = `${formularioEditar.nombres.trim()} ${formularioEditar.apellidoPaterno.trim()}`.trim();

      setMostrarModalEditar(false);
      setFormularioEditar(ESTADO_INICIAL_FORMULARIO_EDITAR);
      setConfirmacionUsuario({
        titulo: 'Usuario actualizado',
        mensaje: (
          <>
            <strong>{nombre}</strong> fue actualizado correctamente.
          </>
        ),
        acciones: [
          {
            etiqueta: 'Cerrar',
            variante: 'btn-aqua',
            onClick: () => setConfirmacionUsuario(null),
          },
        ],
      });
      cargarUsuarios();
    } catch {
      setErrorModalEditar('Ocurrio un error al actualizar el usuario.');
    } finally {
      setGuardandoEditar(false);
    }
  };

  const abrirModalEliminar = (usuario) => {
    setUsuarioEliminar(usuario);
    setErrorModalEliminar('');
    setExitoModalEliminar('');
    setMostrarModalEliminar(true);
  };

  const cerrarModalEliminar = () => {
    if (eliminando) return;
    setMostrarModalEliminar(false);
    setErrorModalEliminar('');
    setExitoModalEliminar('');
    setUsuarioEliminar(null);
  };

  const manejarEliminar = async () => {
    if (!usuarioEliminar) return;
    setErrorModalEliminar('');
    setExitoModalEliminar('');
    setEliminando(true);

    try {
      const datosResp = await eliminarUsuario({ idUsuario: usuarioEliminar.id });
      if (!datosResp?.ok) {
        setErrorModalEliminar(datosResp?.mensaje ?? 'No se pudo eliminar el usuario.');
        return;
      }
      const nombre = usuarioEliminar.nombre;

      setMostrarModalEliminar(false);
      setUsuarioEliminar(null);
      setConfirmacionUsuario({
        titulo: 'Usuario eliminado',
        mensaje: (
          <>
            <strong>{nombre}</strong> fue eliminado del sistema.
          </>
        ),
        icono: 'trash',
        tinte: 'bg-tint-danger',
        acciones: [
          {
            etiqueta: 'Cerrar',
            variante: 'btn-aqua',
            onClick: () => setConfirmacionUsuario(null),
          },
        ],
      });
      cargarUsuarios();
    } catch {
      setErrorModalEliminar('Ocurrio un error al eliminar el usuario.');
    } finally {
      setEliminando(false);
    }
  };

  const usuariosFiltrados = useMemo(() => {
    const texto = busquedaDiferida.trim().toLowerCase();
    return usuarios.filter((usuario) => {
      const coincideTexto =
        texto === '' ||
        usuario.nombre.toLowerCase().includes(texto) ||
        usuario.correo.toLowerCase().includes(texto);
      const coincideRol = filtroRol === 'todos' || usuario.rol_id === filtroRol;
      const coincideEstado = filtroEstado === 'todos' || usuario.estado === filtroEstado;
      return coincideTexto && coincideRol && coincideEstado;
    });
  }, [usuarios, busquedaDiferida, filtroRol, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / TAMANO_PAGINA));
  const usuariosPagina = useMemo(
    () => usuariosFiltrados.slice((pagina - 1) * TAMANO_PAGINA, pagina * TAMANO_PAGINA),
    [usuariosFiltrados, pagina]
  );

  useEffect(() => {
    setPagina(1);
  }, [busquedaDiferida, filtroRol, filtroEstado]);

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [pagina, totalPaginas]);

  return (
    <>
      <PageHeader
        etiqueta={soloLectura ? 'Modulo Jefatura' : 'Modulo Administrador'}
        titulo="Usuarios del sistema"
        descripcion={`${usuarios.length} usuarios registrados - ${usuarios.filter((u) => u.estado === 'activo').length} activos`}
        acciones={
          soloLectura ? (
            <span className="badge badge-estado badge-estado-inactivo">
              <i className="bi bi-eye me-1" aria-hidden="true" />
              Solo lectura
            </span>
          ) : (
            <button type="button" className="btn btn-success btn-sm" onClick={abrirModalCrear}>
              <i className="bi bi-person-plus me-1" aria-hidden="true" />
              Nuevo usuario
            </button>
          )
        }
      />

      <div className="aqua-card">
        <div className="card-header">
          <div className="row g-2">
            <div className="col-lg-5">
              <label className="visually-hidden" htmlFor="busqueda-usuarios">
                Buscar usuarios
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white" aria-hidden="true">
                  <i className="bi bi-search" />
                </span>
                <input
                  type="search"
                  className="form-control"
                  id="busqueda-usuarios"
                  placeholder="Buscar por nombre o correo"
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                />
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <label className="visually-hidden" htmlFor="filtro-rol">
                Filtrar por rol
              </label>
              <select
                className="form-select form-select-sm"
                id="filtro-rol"
                value={filtroRol}
                onChange={(evento) => setFiltroRol(evento.target.value)}
              >
                <option value="todos">Todos los roles</option>
                <option value={CLAVE_ROLES.ADMINISTRADOR}>Administrador</option>
                <option value={CLAVE_ROLES.ANALISTA}>Analista de reclutamiento</option>
                <option value={CLAVE_ROLES.EVALUADOR}>Profesional evaluador</option>
                <option value={CLAVE_ROLES.JEFATURA}>Jefatura</option>
              </select>
            </div>
            <div className="col-sm-6 col-lg-3">
              <label className="visually-hidden" htmlFor="filtro-estado">
                Filtrar por estado
              </label>
              <select
                className="form-select form-select-sm"
                id="filtro-estado"
                value={filtroEstado}
                onChange={(evento) => setFiltroEstado(evento.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div className="col-lg-1 d-flex align-items-center justify-content-lg-end text-muted-aqua">
              <small>{usuariosFiltrados.length}</small>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table aqua-table mb-0">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Nombre</th>
                <th scope="col">Correo</th>
                <th scope="col">Rol asignado</th>
                <th scope="col">Estado</th>
                <th scope="col">Último acceso</th>
                <th scope="col" className="text-end">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={7} className="text-center text-muted-aqua py-4">
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Cargando usuarios...
                  </td>
                </tr>
              )}
              {!cargando && error && (
                <tr>
                  <td colSpan={7} className="text-center text-danger py-4">
                    <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
                    {error}
                    <button type="button" className="btn btn-soft btn-sm ms-2" onClick={cargarUsuarios}>
                      Reintentar
                    </button>
                  </td>
                </tr>
              )}
              {!cargando && !error && usuariosPagina.map((usuario) => {
                const rol = obtenerRol(usuario.rol_id);
                return (
                  <tr key={usuario.id}>
                    <td className="text-muted-aqua">{usuario.id}</td>
                    <td>
                      <span className="fw-semibold">{usuario.nombre}</span>
                    </td>
                    <td className="text-muted-aqua">{usuario.correo}</td>
                    <td>
                      <span className={`badge badge-estado badge-estado-${rol.color === 'secondary' ? 'inactivo' : 'proceso'}`}>
                        <i className={`bi bi-${rol.icono} me-1`} aria-hidden="true" />
                        {usuario.rol_nombre ?? rol.nombre}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge badge-estado ${
                          usuario.estado === 'activo' ? 'badge-estado-activo' : 'badge-estado-inactivo'
                        }`}
                      >
                        <i
                          className={`bi bi-${usuario.estado === 'activo' ? 'check-circle' : 'slash-circle'} me-1`}
                          aria-hidden="true"
                        />
                        {usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="text-muted-aqua small">{usuario.ultimo_acceso ?? '—'}</td>
                    <td className="text-end">
                      {soloLectura ? (
                        <span className="text-muted-aqua small">Solo lectura</span>
                      ) : (
                        <div className="btn-group btn-group-sm">
                          <button type="button" className="btn btn-soft" title="Editar usuario" aria-label={`Editar usuario ${usuario.nombre}`} onClick={() => abrirModalEditar(usuario)}>
                            <i className="bi bi-pencil" aria-hidden="true" />
                          </button>
                          <button type="button" className="btn btn-soft text-danger" title="Eliminar usuario" aria-label={`Eliminar usuario ${usuario.nombre}`} onClick={() => abrirModalEliminar(usuario)}>
                            <i className="bi bi-trash" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!cargando && !error && usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted-aqua py-4">
                    No hay usuarios que coincidan con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white small text-muted-aqua d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span>
            {usuariosFiltrados.length === 0
              ? 'Sin usuarios para mostrar.'
              : `Mostrando ${(pagina - 1) * TAMANO_PAGINA + 1}–${Math.min(
                  pagina * TAMANO_PAGINA,
                  usuariosFiltrados.length
                )} de ${usuariosFiltrados.length} usuarios.`}
          </span>
          <Paginacion
            pagina={pagina}
            totalPaginas={totalPaginas}
            onCambiar={setPagina}
            etiqueta="Paginacion de usuarios"
          />
        </div>
      </div>

      {mostrarModalCrear && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-person-plus me-2" aria-hidden="true" />
                    Nuevo usuario
                  </h5>
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={cerrarModalCrear} disabled={guardandoCrear}></button>
                </div>
                <form method="POST" action="backend/api/usuarios/c_usuario.php" onSubmit={manejarGuardarCrear} encType="application/x-www-form-urlencoded">
                  <div className="modal-body">
                    <div className="p-3 mb-3 rounded" style={{ border: '2px solid #198754', background: '#f8f9fa' }}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label" htmlFor="crear-idRol">Rol</label>
                  <select
                    className="form-select"
                    id="crear-idRol"
                    name="idRol"
                    value={formularioCrear.idRol}
                    onChange={(e) => { manejarCambioCrear(e); setFormularioCrear((previo) => ({ ...previo, idRol: e.target.value })); }}
                    required
                  >
                            <option value="">Selecciona un rol</option>
                            {ROLES.filter((rol) => rol.clave !== CLAVE_ROLES.COLABORADOR).map((rol) => (
                              <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label" htmlFor="crear-estado">Estado</label>
                  <select
                    className="form-select"
                    id="crear-estado"
                    name="estado"
                    value={String(formularioCrear.estado)}
                    onChange={(e) => { setFormularioCrear((previo) => ({ ...previo, estado: e.target.value === '1' ? 1 : 0 })); }}
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                        </div>
                      </div>
                    </div>

                    {errorModalCrear && (
                      <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="bi bi-exclamation-circle me-2" aria-hidden="true" />
                        <div>{errorModalCrear}</div>
                      </div>
                    )}
                    {exitoModalCrear && (
                      <div className="alert alert-success d-flex align-items-center" role="alert">
                        <i className="bi bi-check-circle me-2" aria-hidden="true" />
                        <div>{exitoModalCrear}</div>
                      </div>
                    )}

                    <div className="p-3 mb-3 rounded" style={{ border: '2px solid #198754', background: '#f8f9fa' }}>
                      <h6 className="mb-2">Nombre y Apellidos</h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="crear-nombres">Nombres</label>
                          <input
                            type="text"
                            className="form-control"
                            id="crear-nombres"
                            name="nombres"
                            value={formularioCrear.nombres}
                            onChange={manejarCambioCrear}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="crear-apellidoPaterno">Apellido Paterno</label>
                          <input
                            type="text"
                            className="form-control"
                            id="crear-apellidoPaterno"
                            name="apellidoPaterno"
                            value={formularioCrear.apellidoPaterno}
                            onChange={manejarCambioCrear}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="crear-apellidoMaterno">Apellido Materno</label>
                          <input
                            type="text"
                            className="form-control"
                            id="crear-apellidoMaterno"
                            name="apellidoMaterno"
                            value={formularioCrear.apellidoMaterno}
                            onChange={manejarCambioCrear}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 mb-0 rounded" style={{ border: '2px solid #198754', background: '#f8f9fa' }}>
                      <h6 className="mb-2">Correo y Contraseña</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label" htmlFor="crear-correo">Correo</label>
                          <input
                            type="email"
                            className="form-control"
                            id="crear-correo"
                            name="correo"
                            value={formularioCrear.correo}
                            onChange={manejarCambioCrear}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label" htmlFor="crear-contrasena">Contrasena</label>
                          <input
                            type="password"
                            className="form-control"
                            id="crear-contrasena"
                            name="contrasena"
                            value={formularioCrear.contrasena}
                            onChange={manejarCambioCrear}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={cerrarModalCrear} disabled={guardandoCrear}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-success" disabled={guardandoCrear}>
                      {guardandoCrear ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-1" aria-hidden="true" />
                          Guardar
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {mostrarModalEditar && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-pencil-square me-2" aria-hidden="true" />
                    Editar usuario
                  </h5>
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={cerrarModalEditar} disabled={guardandoEditar}></button>
                </div>
                <form method="POST" action="backend/api/usuarios/u_usuario.php" onSubmit={manejarGuardarEditar} encType="application/x-www-form-urlencoded">
                  <input type="hidden" name="idUsuario" value={formularioEditar.idUsuario} />
                  <div className="modal-body">
                    <div className="p-3 mb-3 rounded" style={{ border: '2px solid #ffc107', background: '#f8f9fa' }}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label" htmlFor="editar-idRol">Rol</label>
                          <select
                            className="form-select"
                            id="editar-idRol"
                            name="idRol"
                            value={formularioEditar.idRol}
                            onChange={manejarCambioEditar}
                            required
                          >
                            <option value="">Selecciona un rol</option>
                            {ROLES.filter((rol) => rol.clave !== CLAVE_ROLES.COLABORADOR).map((rol) => (
                              <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label" htmlFor="editar-estado">Estado</label>
                  <select
                    className="form-select"
                    id="editar-estado"
                    name="estado"
                    value={String(formularioEditar.estado)}
                    onChange={(e) => setFormularioEditar((previo) => ({ ...previo, estado: e.target.value === '1' ? 1 : 0 }))}
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                        </div>
                      </div>
                    </div>

                    {errorModalEditar && (
                      <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="bi bi-exclamation-circle me-2" aria-hidden="true" />
                        <div>{errorModalEditar}</div>
                      </div>
                    )}
                    {exitoModalEditar && (
                      <div className="alert alert-success d-flex align-items-center" role="alert">
                        <i className="bi bi-check-circle me-2" aria-hidden="true" />
                        <div>{exitoModalEditar}</div>
                      </div>
                    )}

                    <div className="p-3 mb-3 rounded" style={{ border: '2px solid #ffc107', background: '#f8f9fa' }}>
                      <h6 className="mb-2">Nombre y Apellidos</h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="editar-nombres">Nombres</label>
                          <input
                            type="text"
                            className="form-control"
                            id="editar-nombres"
                            name="nombres"
                            value={formularioEditar.nombres}
                            onChange={manejarCambioEditar}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="editar-apellidoPaterno">Apellido Paterno</label>
                          <input
                            type="text"
                            className="form-control"
                            id="editar-apellidoPaterno"
                            name="apellidoPaterno"
                            value={formularioEditar.apellidoPaterno}
                            onChange={manejarCambioEditar}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="editar-apellidoMaterno">Apellido Materno</label>
                          <input
                            type="text"
                            className="form-control"
                            id="editar-apellidoMaterno"
                            name="apellidoMaterno"
                            value={formularioEditar.apellidoMaterno}
                            onChange={manejarCambioEditar}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 mb-0 rounded" style={{ border: '2px solid #ffc107', background: '#f8f9fa' }}>
                      <h6 className="mb-2">Correo y Contraseña</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label" htmlFor="editar-correo">Correo</label>
                          <input
                            type="email"
                            className="form-control"
                            id="editar-correo"
                            name="correo"
                            value={formularioEditar.correo}
                            onChange={manejarCambioEditar}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label" htmlFor="editar-contrasena">Contraseña (dejar vacío para no cambiar)</label>
                          <input
                            type="password"
                            className="form-control"
                            id="editar-contrasena"
                            name="contrasena"
                            value={formularioEditar.contrasena}
                            onChange={manejarCambioEditar}
                            placeholder="Nueva contraseña"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={cerrarModalEditar} disabled={guardandoEditar}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-warning" disabled={guardandoEditar}>
                      {guardandoEditar ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-1" aria-hidden="true" />
                          Guardar cambios
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {mostrarModalEliminar && usuarioEliminar && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-exclamation-triangle me-2 text-danger" aria-hidden="true" />
                    Eliminar usuario
                  </h5>
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={cerrarModalEliminar} disabled={eliminando}></button>
                </div>
                <div className="modal-body">
                  <div className="p-3 mb-3 rounded" style={{ border: '2px solid #dc3545', background: '#f8f9fa' }}>
                    <div className="mb-1">
                      <h6 className="mb-1">¿Estás seguro de eliminar este usuario?</h6>
                      <small className="text-muted">Esta acción no se puede deshacer.</small>
                    </div>
                  </div>

                  {errorModalEliminar && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="bi bi-exclamation-circle me-2" aria-hidden="true" />
                      <div>{errorModalEliminar}</div>
                    </div>
                  )}
                  {exitoModalEliminar && (
                    <div className="alert alert-success d-flex align-items-center" role="alert">
                      <i className="bi bi-check-circle me-2" aria-hidden="true" />
                      <div>{exitoModalEliminar}</div>
                    </div>
                  )}

                  <div className="p-3 rounded" style={{ border: '2px solid #dc3545', background: '#f8f9fa' }}>
                    <div className="mb-2">
                      <span className="fw-semibold">Nombre:</span> {usuarioEliminar.nombre}
                    </div>
                    <div className="mb-2">
                      <span className="fw-semibold">Rol:</span> {usuarioEliminar.rol_nombre ?? obtenerRol(usuarioEliminar.rol_id).nombre}
                    </div>
                    <div>
                      <span className="fw-semibold">Correo:</span> {usuarioEliminar.correo}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={cerrarModalEliminar} disabled={eliminando}>
                    Cancelar
                  </button>
                  <form method="POST" action="backend/api/usuarios/d_usuario.php" onSubmit={(e) => { e.preventDefault(); manejarEliminar(); }} style={{ display: 'inline' }} encType="application/x-www-form-urlencoded">
                    <input type="hidden" name="idUsuario" value={usuarioEliminar?.id || ''} />
                    <button type="submit" className="btn btn-danger" disabled={eliminando}>
                      {eliminando ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-trash me-1" aria-hidden="true" />
                          Eliminar
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {confirmacionUsuario && (
        <ConfirmacionModal
          visible
          titulo={confirmacionUsuario.titulo}
          acciones={confirmacionUsuario.acciones}
          icono={confirmacionUsuario.icono}
          tinte={confirmacionUsuario.tinte}
        >
          {confirmacionUsuario.mensaje}
        </ConfirmacionModal>
      )}
    </>
  );
}
