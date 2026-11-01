/**
 * solicitudesApi.js
 * Endpoints del modulo Analista para solicitudes de evaluacion
 * (backend/api/solicitudes/*.php).
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
