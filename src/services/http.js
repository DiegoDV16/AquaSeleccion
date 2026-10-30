/**
 * http.js
 * Cliente HTTP base para hablar con el backend PHP. Antepone el BASE_URL de
 * Vite (en dev '/' funciona con el proxy de vite.config.js) e incluye las
 * cookies de sesion en cada peticion.
 */

const BASE = import.meta.env.BASE_URL;

export async function peticionJson(ruta, opciones = {}) {
  let respuesta;

  try {
    respuesta = await fetch(`${BASE}${ruta}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    });
  } catch {
    return { ok: false, mensaje: 'No se pudo conectar con el servidor. Intentalo nuevamente.' };
  }

  try {
    return await respuesta.json();
  } catch {
    return { ok: false, mensaje: 'El servidor devolvio una respuesta no valida.' };
  }
}
