/**
 * authApi.js
 * Endpoints de autenticacion del backend PHP (backend/api/auth/*.php).
 * La sesion vive en el servidor (cookie de sesion PHP).
 */

import { peticionJson } from './http.js';

/** POST login.php -> valida existencia, estado, contrasena y rol. */
export function iniciarSesion({ correo, contrasena }) {
  return peticionJson('backend/api/auth/login.php', {
    method: 'POST',
    body: JSON.stringify({ correo, contrasena }),
  });
}

/** POST logout.php -> destruye la sesion en el servidor. */
export function cerrarSesion() {
  return peticionJson('backend/api/auth/logout.php', { method: 'POST' });
}

/** GET session.php -> recupera la sesion activa (o autenticado:false). */
export function sesionActual() {
  return peticionJson('backend/api/auth/session.php', { method: 'GET' });
}
