import { useEffect, useMemo, useState } from 'react';

import PageHeader from '../../components/ui/PageHeader.jsx';
import { CLAVE_ROLES, obtenerRol } from '../../mock/catalogoRoles.js';
import { listarUsuarios } from '../../services/usuariosApi.js';

/** Listado de usuarios del sistema con filtro por rol, estado y busqueda. */
export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    let vigente = true;

    listarUsuarios()
      .then((datos) => {
        if (!vigente) return;
        if (!datos?.ok) {
          setError(datos?.mensaje ?? 'No se pudieron cargar los usuarios.');
          return;
        }
        setUsuarios(datos.usuarios);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return usuarios.filter((usuario) => {
      const coincideTexto =
        texto === '' ||
        usuario.nombre.toLowerCase().includes(texto) ||
        usuario.correo.toLowerCase().includes(texto);
      const coincideRol = filtroRol === 'todos' || usuario.rol_id === filtroRol;
      const coincideEstado = filtroEstado === 'todos' || usuario.estado === filtroEstado;
      return coincideTexto && coincideRol && coincideEstado;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  return (
    <>
      <PageHeader
        etiqueta="Modulo Administrador"
        titulo="Usuarios del sistema"
        descripcion={`${usuarios.length} usuarios registrados - ${usuarios.filter((u) => u.estado === 'activo').length} activos`}
        acciones={
          <button type="button" className="btn btn-aqua btn-sm" disabled title="Disponible en la iteracion con backend">
            <i className="bi bi-person-plus me-1" aria-hidden="true" />
            Nuevo usuario
          </button>
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
                <option value={CLAVE_ROLES.COLABORADOR}>Colaborador</option>
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
                  </td>
                </tr>
              )}
              {!cargando && !error && usuariosFiltrados.map((usuario) => {
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
                      <div className="btn-group btn-group-sm">
                        <button type="button" className="btn btn-soft" title="Ver detalle" disabled>
                          <i className="bi bi-eye" aria-hidden="true" />
                        </button>
                        <button type="button" className="btn btn-soft" title="Editar" disabled>
                          <i className="bi bi-pencil" aria-hidden="true" />
                        </button>
                        <button type="button" className="btn btn-soft" title={usuario.estado === 'activo' ? 'Desactivar' : 'Activar'} disabled>
                          <i className={`bi bi-${usuario.estado === 'activo' ? 'toggle-on' : 'toggle-off'}`} aria-hidden="true" />
                        </button>
                      </div>
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
      </div>
    </>
  );
}