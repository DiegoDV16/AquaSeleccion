/**
 * menu.js
 * Configuracion de navegacion por rol consumida por el Sidebar.
 * El `inicio` de cada bloque se usa como ruta raiz del modulo protegido
 * (ver routes/AppRouter.jsx). Los iconos son nombres de Bootstrap Icons y se
 * renderizan como <i className="bi bi-{icono}" />.
 */

import { CLAVE_ROLES } from './catalogoRoles.js';

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

/**
 * Contadores del menu (pendientes por modulo). Se habilitan en la rama
 * feature/modulo-administrador, que es donde se incorporan los datos de
 * solicitudes y usuarios.
 */
export function contadoresMenu() {
  return {};
}