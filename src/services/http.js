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

export async function peticionFormulario(ruta, datos = {}, opciones = {}) {
  const formData = new FormData();

  Object.entries(datos).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null) {
      formData.append(clave, String(valor));
    }
  });

  let respuesta;

  try {
    respuesta = await fetch(`${BASE}${ruta}`, {
      method: 'POST',
      credentials: 'include',
      ...opciones,
      body: formData,
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
