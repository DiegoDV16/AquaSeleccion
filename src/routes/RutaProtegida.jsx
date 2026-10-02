import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.js';

/**
 * RutaProtegida
 * Guarda de navegación del lado cliente. Impide abrir el modulo de un rol
 * distinto al activo en el Contexto. Con PHP/MySQL esta comprobación se
 * replicará en el servidor: la sesión PHP es la única fuente de verdad.
 *
 * Los roles admitidos se declaran con PERMISOS_POR_MODULO (mock/catalogoRoles.js).
 */
export default function RutaProtegida({ rolesPermitidos, children }) {
  const { rolActivo, autenticado } = useAuth();
  const location = useLocation();

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }

  const permitido = rolesPermitidos.includes(rolActivo);

  if (!permitido) {
    return <Navigate to="/sin-permisos" replace state={{ solicitado: location.pathname }} />;
  }

  return children;
}