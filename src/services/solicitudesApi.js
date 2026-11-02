/**
 * solicitudesApi.js
 * Endpoints de solicitudes de evaluacion y del modulo Evaluador
 * (backend/api/solicitudes/*.php y backend/api/evaluaciones/*.php).
 */

import { peticionFormulario } from './http.js';

/** POST listar.php -> solicitudes con candidato, evaluador y evaluacion. */
export function listarSolicitudes(filtros = {}) {
  return peticionFormulario('backend/api/solicitudes/listar.php', filtros);
}

/** POST crear.php -> crea la solicitud y asigna el evaluador responsable. */
export function crearSolicitud(datos) {
  return peticionFormulario('backend/api/solicitudes/crear.php', datos);
}

/** POST detalle.php -> una solicitud con su candidato y evaluacion. */
export function obtenerSolicitud(idSolicitud) {
  return peticionFormulario('backend/api/solicitudes/detalle.php', { idSolicitud });
}

/** POST evaluadores.php -> usuarios activos con rol Evaluador. */
export function listarEvaluadores() {
  return peticionFormulario('backend/api/solicitudes/evaluadores.php');
}

/** POST evaluaciones/listar.php -> solicitudes asignadas al evaluador en sesion. */
export function listarMisSolicitudes() {
  return peticionFormulario('backend/api/evaluaciones/listar.php');
}

/** POST evaluaciones/detalle.php -> una solicitud asignada al evaluador en sesion. */
export function obtenerMiSolicitud(idSolicitud) {
  return peticionFormulario('backend/api/evaluaciones/detalle.php', { idSolicitud });
}

/** POST evaluaciones/guardar.php -> borrador o finalizacion de una evaluacion. */
export function guardarEvaluacion(datos) {
  return peticionFormulario('backend/api/evaluaciones/guardar.php', datos);
}
