import { peticionFormulario } from './http.js';

/** Abre o recupera la entrevista asistida de una solicitud asignada. */
export function abrirEntrevista(idSolicitud) {
  return peticionFormulario('backend/api/entrevistas/abrir.php', { idSolicitud });
}

/** Guarda consentimiento, transcripcion y documento. */
export function guardarEntrevista(datos) {
  return peticionFormulario('backend/api/entrevistas/guardar.php', datos);
}

/** Genera un borrador del documento usando la transcripcion guardada. */
export function generarDocumentoEntrevista(idSolicitud) {
  return peticionFormulario('backend/api/entrevistas/generar.php', { idSolicitud });
}
