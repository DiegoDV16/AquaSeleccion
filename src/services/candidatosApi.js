/**
 * candidatosApi.js
 * Endpoints del modulo Analista para candidatos
 * (backend/api/candidatos/*.php).
 */

import { peticionArchivo, peticionFormulario } from './http.js';

/** POST listar.php -> candidatos con cargo, familia y estado derivado. */
export function listarCandidatos() {
  return peticionFormulario('backend/api/candidatos/listar.php');
}

/** POST crear.php -> registra un candidato externo creado por el analista. */
export function crearCandidato(datos) {
  return peticionFormulario('backend/api/candidatos/crear.php', datos);
}

/** POST actualizar.php -> actualiza los datos principales del candidato. */
export function actualizarCandidato(datos) {
  return peticionFormulario('backend/api/candidatos/actualizar.php', datos);
}

/** POST cv.php -> vista previa del CV (HTML para Word, URL para PDF). */
export function previsualizarCv(idCandidato) {
  return peticionFormulario('backend/api/candidatos/cv.php', { idCandidato });
}

/** POST descargar_cv.php -> descarga autenticada del CV como Blob. */
export function descargarCv(idCandidato) {
  return peticionArchivo('backend/api/candidatos/descargar_cv.php', { idCandidato });
}
