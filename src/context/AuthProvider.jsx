import { useCallback, useMemo, useState } from 'react';

import { AuthContext } from './AuthContext.js';
import { obtenerRol } from '../mock/catalogoRoles.js';
import { obtenerUsuarioPorCorreo } from '../mock/usuarios.js';

/**
 * AuthProvider
 * Estado simulado de autenticacion. El rol NO se elige: se deduce del usuario
 * que inicia sesion, igual que lo hara el backend con la tabla `usuarios`.
 * Cuando exista MySQL + PHP, `login()` pasara a hacer POST /api/auth/login y la
 * sesion se sustentara con cookie de sesion, pero la forma de consumo
 * (`useAuth()`) se mantiene igual.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [autenticado, setAutenticado] = useState(false);

  const rolActivo = usuario?.rol_id ?? null;
  const rol = useMemo(() => (rolActivo ? obtenerRol(rolActivo) : null), [rolActivo]);

  /**
   * Valida las credenciales contra los datos simulados.
   * @returns {{ok: boolean, mensaje?: string, rol?: object}}
   */
  const login = useCallback(({ correo, clave }) => {
    if (!correo?.trim() || !clave?.trim()) {
      return { ok: false, mensaje: 'Ingresa tu correo institucional y contrasena.' };
    }

    const encontrado = obtenerUsuarioPorCorreo(correo.trim());

    if (!encontrado) {
      return {
        ok: false,
        mensaje: 'El correo no esta registrado en el sistema. Revisa el dominio o usa una cuenta de prueba.',
      };
    }

    if (encontrado.estado !== 'activo') {
      return { ok: false, mensaje: 'Tu usuario se encuentra inactivo. Contacta al administrador del sistema.' };
    }

    if (!obtenerRol(encontrado.rol_id).rutaInicio) {
      return {
        ok: false,
        mensaje: 'Tu usuario esta registrado como colaborador y no tiene acceso a los modulos de gestion.',
      };
    }

    setUsuario(encontrado);
    setAutenticado(true);
    return { ok: true, rol: obtenerRol(encontrado.rol_id) };
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
    setAutenticado(false);
  }, []);

  const valor = useMemo(
    () => ({
      autenticado,
      usuario,
      rolActivo,
      rol,
      login,
      logout,
    }),
    [autenticado, usuario, rolActivo, rol, login, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}