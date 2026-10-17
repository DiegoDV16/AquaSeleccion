/**
 * usuariosApi.js
 * Endpoints de usuarios del backend PHP (backend/api/usuarios/*.php).
 */

import { peticionJson } from './http.js';

/** GET listar.php -> usuarios registrados en la base de datos. */
export function listarUsuarios() {
  return peticionJson('backend/api/usuarios/listar.php', { method: 'GET' });
}
