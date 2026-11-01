/**
 * http.js
 * Cliente HTTP base para hablar con el backend PHP. Antepone el BASE_URL de
 * Vite (en dev '/' funciona con el proxy de vite.config.js) e incluye las
 * cookies de sesion en cada peticion.
 */

const BASE = import.meta.env.BASE_URL;

/**
 * Mensaje accionable cuando el backend responde algo distinto de JSON
 * (por ejemplo, el index.html de Vite o una pagina de error de Apache).
 */
function respuestaNoJson(respuesta) {
  return {
    ok: false,
    mensaje: `El servidor respondio HTTP ${respuesta.status} sin JSON. Revisa que Apache y MySQL esten iniciados y que Vite tenga activo el proxy /backend.`,
  };
}

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
    return respuestaNoJson(respuesta);
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
    return respuestaNoJson(respuesta);
  }
}

/**
 * Envia un formulario y devuelve un archivo binario (Blob) con su nombre.
 * Se usa para descargas autenticadas, donde el servidor valida la sesion.
 */
export async function peticionArchivo(ruta, datos = {}) {
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
      body: formData,
    });
  } catch {
    return { ok: false, mensaje: 'No se pudo conectar con el servidor. Intentalo nuevamente.' };
  }

  if (!respuesta.ok) {
    try {
      const error = await respuesta.json();
      return { ok: false, mensaje: error?.mensaje ?? 'No fue posible descargar el archivo.' };
    } catch {
      return { ok: false, mensaje: `El servidor respondio HTTP ${respuesta.status} al descargar.` };
    }
  }

  const disposicion = respuesta.headers.get('Content-Disposition') ?? '';
  const coincidencia = /filename="?([^";]+)"?/i.exec(disposicion);

  return {
    ok: true,
    blob: await respuesta.blob(),
    nombre: coincidencia ? coincidencia[1] : 'curriculum',
  };
}
