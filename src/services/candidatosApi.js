/**
 * candidatosApi.js
 * Endpoints del modulo Analista para candidatos
 * (backend/api/candidatos/*.php).
 */

import { peticionFormulario } from './http.js';

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
