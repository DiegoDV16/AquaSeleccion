/**
 * menu.js
 * Configuracion de navegacion por rol consumida por el Sidebar.
 * El `inicio` de cada bloque se usa como ruta raiz del modulo protegido
 * (ver routes/AppRouter.jsx). Los iconos son nombres de Bootstrap Icons y se
 * renderizan como <i className="bi bi-{icono}" />.
 */

import { CLAVE_ROLES } from './catalogoRoles.js';
import { SOLICITUDES } from './solicitudes.js';
import { USUARIOS_DEMO } from './usuarios.js';

export const MENU_POR_ROL = {
  [CLAVE_ROLES.ADMINISTRADOR]: [
    {
      titulo: 'Administracion',
      items: [
        { to: '/admin/dashboard', label: 'Dashboard', icono: 'speedometer2' },
        { to: '/admin/postular-interno', label: 'Postulacion interna', icono: 'person-plus' },
        { to: '/admin/usuarios', label: 'Usuarios del sistema', icono: 'people' },
        { to: '/admin/historial', label: 'Historial de solicitudes', icono: 'clock-history' },
      ],
    },
  ],
  [CLAVE_ROLES.ANALISTA]: [
    {
      titulo: 'Reclutamiento',
      items: [
        { to: '/analista/candidatos', label: 'Candidatos', icono: 'person-vcard' },
        { to: '/analista/solicitudes', label: 'Solicitudes', icono: 'file-earmark-text' },
        { to: '/analista/nueva-solicitud', label: 'Nueva solicitud', icono: 'file-earmark-plus' },
      ],
    },
  ],
  [CLAVE_ROLES.EVALUADOR]: [
    {
      titulo: 'Evaluacion',
      items: [
        { to: '/evaluador/mis-solicitudes', label: 'Mis solicitudes', icono: 'inbox' },
        { to: '/evaluador/evaluar/SOL-0142', label: 'Evaluar solicitud', icono: 'clipboard2-check' },
      ],
    },
  ],
};

/** Badge informativo en el menu: solicitudes pendientes por modulo. */
function pendientesDeEvaluadorDemo() {
  const evaluador = USUARIOS_DEMO[CLAVE_ROLES.EVALUADOR];
  return SOLICITUDES.filter(
    (solicitud) => solicitud.evaluador_id === evaluador.id && solicitud.estado === 'pendiente',
  ).length;
}

export function contadoresMenu() {
  return {
    [`${CLAVE_ROLES.ANALISTA}/analista/solicitudes`]: SOLICITUDES.filter(
      (solicitud) => solicitud.estado === 'pendiente',
    ).length,
    [`${CLAVE_ROLES.EVALUADOR}/evaluador/mis-solicitudes`]: pendientesDeEvaluadorDemo(),
  };
}