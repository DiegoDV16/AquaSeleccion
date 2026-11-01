/**
 * catalogosApi.js
 * Catalogos publicos utilizados por los formularios del modulo Analista.
 */

import { peticionJson } from './http.js';

/** GET c_listaCargosDisponibles.php -> familias con sus cargos. */
export function listarFamiliasCargos() {
  return peticionJson('backend/config/c_listaCargosDisponibles.php', { method: 'GET' });
}
