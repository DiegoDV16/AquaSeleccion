import { useCallback, useEffect, useMemo, useState } from 'react';

import { AuthContext } from './AuthContext.js';
import { obtenerRol } from '../mock/catalogoRoles.js';
import { iniciarSesion, cerrarSesion, sesionActual } from '../services/authApi.js';

/**
 * AuthProvider
 * Estado de autenticacion respaldado por la sesion PHP (backend/api/auth).
 * El rol NO se elige: lo determina el backend a partir de la tabla `usuario`,
 * y el menu/rutas se filtran con ese rol. Al recargar la pagina se restaura la
 * sesion consultando session.php, que es la unica fuente de verdad.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);

  const rolActivo = usuario?.rol_id ?? null;
  const rol = useMemo(() => (rolActivo ? obtenerRol(rolActivo) : null), [rolActivo]);

  useEffect(() => {
    let vigente = true;

    sesionActual()
      .then((datos) => {
        if (!vigente) return;
        if (datos?.ok && datos.autenticado) {
          setUsuario(datos.usuario);
          setAutenticado(true);
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  /**
   * Valida las credenciales contra el backend PHP.
   * @returns {Promise<{ok: boolean, mensaje?: string, rol?: object}>}
   */
  const login = useCallback(async ({ correo, clave }) => {
    if (!correo?.trim() || !clave?.trim()) {
      return { ok: false, mensaje: 'Ingresa tu correo institucional y contrasena.' };
    }

    const datos = await iniciarSesion({ correo: correo.trim(), contrasena: clave });

    if (!datos?.ok) {
      return { ok: false, mensaje: datos?.mensaje ?? 'No se pudo iniciar sesion.' };
    }

    setUsuario(datos.usuario);
    setAutenticado(true);

    return { ok: true, rol: obtenerRol(datos.usuario.rol_id) };
  }, []);

  const logout = useCallback(async () => {
    setUsuario(null);
    setAutenticado(false);
    await cerrarSesion();
  }, []);

  const valor = useMemo(
    () => ({
      autenticado,
      usuario,
      rolActivo,
      rol,
      cargando,
      login,
      logout,
    }),
    [autenticado, usuario, rolActivo, rol, cargando, login, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
