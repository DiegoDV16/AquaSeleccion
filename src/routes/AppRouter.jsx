import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from '../components/layout/AppLayout.jsx';
import ModuloPendiente from '../pages/ModuloPendiente.jsx';

/**
 * AppRouter (esqueleto inicial)
 * Tabla de rutas del monolito. En esta rama solo existe el layout y los
 * marcadores de posicion de cada modulo; las vistas reales se incorporan en
 * las ramas feature/ posteriores.
 */
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      <Route element={<AppLayout />}>
        <Route
          path="/admin/dashboard"
          element={<ModuloPendiente modulo="Modulo Administrador" />}
        />
        <Route
          path="/analista/candidatos"
          element={<ModuloPendiente modulo="Modulo Analista" />}
        />
        <Route
          path="/evaluador/mis-solicitudes"
          element={<ModuloPendiente modulo="Modulo Evaluador" />}
        />
      </Route>

      <Route path="*" element={<ModuloPendiente modulo="Vista no disponible" />} />
    </Routes>
  );
}