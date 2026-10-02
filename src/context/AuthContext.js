import { createContext, useContext } from 'react';

/**
 * AuthContext
 * Contexto unico de la aplicacion: simula la sesion y el rol activo.
 * El Provider vive en AuthProvider.jsx (separado para no romper Fast Refresh).
 */
export const AuthContext = createContext(null);

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (contexto === null) {
    throw new Error('useAuth() debe usarse dentro de <AuthProvider>.');
  }
  return contexto;
}