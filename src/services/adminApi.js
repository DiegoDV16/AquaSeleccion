/**
 * adminApi.js
 * Endpoints del panel de Administracion.
 */

import { peticionFormulario } from './http.js';

/** POST admin/dashboard.php -> metricas, solicitudes y actividad reales. */
export function obtenerResumenAdmin() {
  return peticionFormulario('backend/api/admin/dashboard.php');
}
