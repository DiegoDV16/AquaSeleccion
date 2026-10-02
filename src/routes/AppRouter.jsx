import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from '../components/layout/AppLayout.jsx';
import RutaProtegida from './RutaProtegida.jsx';
import { PERMISOS_POR_MODULO as PERMISOS } from '../mock/catalogoRoles.js';

import Login from '../pages/auth/Login.jsx';
import Postular from '../pages/public/Postular.jsx';

import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import AdminPostularInterno from '../pages/admin/AdminPostularInterno.jsx';
import AdminUsuarios from '../pages/admin/AdminUsuarios.jsx';
import AdminHistorial from '../pages/admin/AdminHistorial.jsx';

import AnalistaCandidatos from '../pages/analista/AnalistaCandidatos.jsx';
import AnalistaSolicitudes from '../pages/analista/AnalistaSolicitudes.jsx';
import AnalistaNuevaSolicitud from '../pages/analista/AnalistaNuevaSolicitud.jsx';

import EvaluadorMisSolicitudes from '../pages/evaluador/EvaluadorMisSolicitudes.jsx';
import EvaluadorEvaluar from '../pages/evaluador/EvaluadorEvaluar.jsx';

import SinPermisos from '../pages/SinPermisos.jsx';
import NotFound from '../pages/NotFound.jsx';

/**
 * AppRouter
 * Tabla de rutas unica del monolito (react-router-dom v6).
 *
 *  - Publicas ....... /, /login, /postular, /sin-permisos, * (404)
 *  - Protegidas ..... cada modulo se monta dentro de AppLayout (Navbar +
 *                     Sidebar + Outlet) y se envuelve en RutaProtegida con
 *                     los roles autorizados para ese modulo.
 */
export default function AppRouter() {
  return (
    <Routes>
      {/* ------------------------------- Publicas ------------------------------- */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/postular" element={<Postular />} />
      <Route path="/sin-permisos" element={<SinPermisos />} />

      {/* --------------------------- Layout del monolito ------------------------- */}
      <Route element={<AppLayout />}>
        {/* Modulo Administrador */}
        <Route
          path="/admin"
          element={
            <RutaProtegida rolesPermitidos={PERMISOS.ADMINISTRADOR}>
              <Navigate to="/admin/dashboard" replace />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RutaProtegida rolesPermitidos={PERMISOS.ADMINISTRADOR}>
              <AdminDashboard />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/postular-interno"
          element={
            <RutaProtegida rolesPermitidos={PERMISOS.ADMINISTRADOR}>
              <AdminPostularInterno />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <RutaProtegida rolesPermitidos={PERMISOS.ADMINISTRADOR}>
              <AdminUsuarios />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/historial"
          element={
            <RutaProtegida rolesPermitidos={PERMISOS.ADMINISTRADOR}>
              <AdminHistorial />
            </RutaProtegida>
          }
        />

        {/* Modulo Analista de Reclutamiento */}
        <Route
          path="/analista"
          element={
            <RutaProtegida rolesPermitidos={PERMISOS.ANALISTA}>
              <Navigate to="/analista/candidatos" replace />
            </RutaProtegida>
          }
        />
        <Route
          path="/analista/candidatos"
          element={
            <RutaProtegida rolesPermitidos={PERMISOS.ANALISTA}>
              <AnalistaCandidatos />
            </RutaProtegida>
          }
        />
        <Route
          path="/analista/solicitudes"
          element={
            <RutaProtegida rolesPermitidos={PERMISOS.ANALISTA}>
              <AnalistaSolicitudes />
            </RutaProtegida>
          }
        />
        <Route
          path="/analista/nueva-solicitud"
          element={
            <RutaProtegida rolesPermitidos={PERMISOS.ANALISTA}>
              <AnalistaNuevaSolicitud />
            </RutaProtegida>
          }
        />

        {/* Modulo Profesional Evaluador */}
        <Route
          path="/evaluador"
          element={
            <RutaProtegida rolesPermitidos={PERMISOS.EVALUADOR}>
              <Navigate to="/evaluador/mis-solicitudes" replace />
            </RutaProtegida>
          }
        />
        <Route
          path="/evaluador/mis-solicitudes"
          element={
            <RutaProtegida rolesPermitidos={PERMISOS.EVALUADOR}>
              <EvaluadorMisSolicitudes />
            </RutaProtegida>
          }
        />
        <Route
          path="/evaluador/evaluar/:id"
          element={
            <RutaProtegida rolesPermitidos={PERMISOS.EVALUADOR}>
              <EvaluadorEvaluar />
            </RutaProtegida>
          }
        />
      </Route>

      {/* --------------------------------- 404 ---------------------------------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}