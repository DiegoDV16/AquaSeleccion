/**
 * usuariosApi.js
 * Endpoints de usuarios del backend PHP (backend/api/usuarios/*.php).
 */

import { peticionFormulario, peticionJson } from './http.js';

/** GET listar.php -> usuarios registrados en la base de datos. */
export function listarUsuarios() {
  return peticionJson('backend/api/usuarios/listar.php', { method: 'GET' });
}

/** POST c_usuario.php -> crea un nuevo usuario en la tabla `usuario`. */
export function crearUsuario(datos) {
  return peticionFormulario('backend/api/usuarios/c_usuario.php', datos);
}

/** POST u_usuario.php -> actualiza un usuario existente. */
export function actualizarUsuario(datos) {
  return peticionFormulario('backend/api/usuarios/u_usuario.php', datos);
}

/** POST d_usuario.php -> elimina un usuario existente. */
export function eliminarUsuario(datos) {
  return peticionFormulario('backend/api/usuarios/d_usuario.php', datos);
}
