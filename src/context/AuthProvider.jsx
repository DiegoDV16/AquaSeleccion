import { useCallback, useMemo, useState } from 'react';

import { AuthContext } from './AuthContext.js';
import { CLAVE_ROLES, obtenerRol } from '../mock/catalogoRoles.js';
import { USUARIOS_DEMO } from '../mock/usuarios.js';

const ROL_INICIAL = CLAVE_ROLES.ADMINISTRADOR;

/**
 * AuthProvider
 * Estado simulado de autenticacion. Cuando exista el backend, `login()` pasara
 * a hacer POST /api/auth/login y la sesion se sustentara con una cookie/token,
 * pero la forma de consumption (`useAuth()`) se mantiene igual.
 */
export function AuthProvider({ children }) {
  const [rolActivo, setRolActivo] = useState(ROL_INICIAL);
  const [usuario, setUsuario] = useState(USUARIOS_DEMO[ROL_INICIAL]);
  const [autenticado, setAutenticado] = useState(true);

  const cambiarRol = useCallback((claveRol) => {
    const rol = obtenerRol(claveRol);
    setRolActivo(rol.clave);
    setUsuario(USUARIOS_DEMO[rol.clave] ?? usuario);
  }, [usuario]);

  const login = useCallback(({ correo, rol: rolSolicitado }) => {
    const claveRol = rolSolicitado ?? obtenerRolPorCorreo(correo);
    const rol = obtenerRol(claveRol);
    setRolActivo(rol.clave);
    setUsuario(USUARIOS_DEMO[rol.clave] ?? null);
    setAutenticado(true);
    return rol;
  }, []);

  const logout = useCallback(() => {
    setAutenticado(false);
  }, []);

  const valor = useMemo(
    () => ({
      autenticado,
      usuario,
      rolActivo,
      rol: obtenerRol(rolActivo),
      esAdministrador: rolActivo === CLAVE_ROLES.ADMINISTRADOR,
      esAnalista: rolActivo === CLAVE_ROLES.ANALISTA,
      esEvaluador: rolActivo === CLAVE_ROLES.EVALUADOR,
      cambiarRol,
      login,
      logout,
    }),
    [autenticado, usuario, rolActivo, cambiarRol, login, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

function obtenerRolPorCorreo(correo) {
  const usuarioDemo = Object.values(USUARIOS_DEMO).find((item) =>
    item.correo.toLowerCase() === String(correo ?? '').toLowerCase(),
  );
  return usuarioDemo ? usuarioDemo.rol_id : ROL_INICIAL;
}