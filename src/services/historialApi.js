/**
 * historialApi.js
 * Endpoints del historial de solicitudes del modulo Administrador.
 */

import { peticionFormulario } from './http.js';

/** POST historial/listar.php -> movimientos reales con filtros. */
export function listarHistorial(filtros = {}) {
  return peticionFormulario('backend/api/historial/listar.php', filtros);
}
