/**
 * catalogoRoles.js
 * Configuracion de roles del sistema. En fase M/V este archivo reemplaza la
 * tabla `roles` de MySQL. El valor `clave` es el que se persiste en
 * `usuarios.rol_id` y el que usa el Contexto de Rol para filtrar el menu.
 */

export const CLAVE_ROLES = {
  ADMINISTRADOR: 'administrador',
  ANALISTA: 'analista',
  EVALUADOR: 'evaluador',
  COLABORADOR: 'colaborador',
};

export const ROLES = [
  {
    clave: CLAVE_ROLES.ADMINISTRADOR,
    id: 1,
    nombre: 'Administrador',
    descripcion: 'Gestiona usuarios del sistema, postulaciones internas y trazabilidad global.',
    icono: 'shield-lock',
    color: 'danger',
    rutaInicio: '/admin/dashboard',
  },
  {
    clave: CLAVE_ROLES.ANALISTA,
    id: 2,
    nombre: 'Analista de Reclutamiento',
    descripcion: 'Revisa candidatos registrados y crea solicitudes de evaluacion psicologica.',
    icono: 'people',
    color: 'primary',
    rutaInicio: '/analista/candidatos',
  },
  {
    clave: CLAVE_ROLES.EVALUADOR,
    id: 3,
    nombre: 'Profesional Evaluador',
    descripcion: 'Psicologo/a responsable de realizar la evaluacion psicologaboral asignada.',
    icono: 'clipboard2-pulse',
    color: 'success',
    rutaInicio: '/evaluador/mis-solicitudes',
  },
  {
    clave: CLAVE_ROLES.COLABORADOR,
    id: 4,
    nombre: 'Colaborador',
    descripcion: 'Empleado registrado en el sistema, sin acceso a los modulos de gestion.',
    icono: 'person',
    color: 'secondary',
    rutaInicio: null,
  },
];

export function obtenerRol(clave) {
  return ROLES.find((rol) => rol.clave === clave) ?? ROLES[0];
}

/** Roles autorizados por modulo: se consumen en las rutas protegidas. */
export const PERMISOS_POR_MODULO = {
  ADMINISTRADOR: [CLAVE_ROLES.ADMINISTRADOR],
  ANALISTA: [CLAVE_ROLES.ANALISTA],
  EVALUADOR: [CLAVE_ROLES.EVALUADOR],
};