/**
 * usuarios.js
 * Simula la tabla `usuarios`. En el MVP cada usuario tiene un rol unico y un
 * estado (activo/inactivo). El campo `clave_demo` simula el hash de contrasena
 * que validara el endpoint PHP de login.
 */

import { CLAVE_ROLES } from './catalogoRoles.js';

export const USUARIOS = [
  // Administradores
  {
    id: 1,
    nombre: 'Catalina Fuentes',
    correo: 'catalina.fuentes@aquachile.cl',
    rut: '15.554.221-4',
    cargo: 'Jefa de Reclutamiento y Seleccion',
    unidad: 'Personas / Talento',
    rol_id: CLAVE_ROLES.ADMINISTRADOR,
    estado: 'activo',
    fecha_ingreso: '2019-03-11',
    ultimo_acceso: '2026-09-28 09:14',
  },
  {
    id: 2,
    nombre: 'Andres Molina',
    correo: 'andres.molina@aquachile.cl',
    rut: '17.882.043-7',
    cargo: 'Analista de Compensation & Benefits',
    unidad: 'Personas / Talento',
    rol_id: CLAVE_ROLES.ADMINISTRADOR,
    estado: 'activo',
    fecha_ingreso: '2021-07-01',
    ultimo_acceso: '2026-09-26 17:42',
  },
  {
    id: 3,
    nombre: 'Barbara Sandoval',
    correo: 'barbara.sandoval@aquachile.cl',
    rut: '14.220.987-2',
    cargo: 'Coordinadora Administrativa',
    unidad: 'Personas / Talento',
    rol_id: CLAVE_ROLES.ADMINISTRADOR,
    estado: 'inactivo',
    fecha_ingreso: '2017-01-16',
    ultimo_acceso: '2026-05-04 11:02',
  },

  // Analistas de reclutamiento
  {
    id: 4,
    nombre: 'Maria Jose Rojas',
    correo: 'mariajose.rojas@aquachile.cl',
    rut: '16.774.530-9',
    cargo: 'Analista de Seleccion',
    unidad: 'Personas / Reclutamiento',
    rol_id: CLAVE_ROLES.ANALISTA,
    estado: 'activo',
    fecha_ingreso: '2020-11-02',
    ultimo_acceso: '2026-09-29 08:31',
  },
  {
    id: 5,
    nombre: 'Sebastian Tapia',
    correo: 'sebastian.tapia@aquachile.cl',
    rut: '18.339.104-5',
    cargo: 'Analista de Seleccion',
    unidad: 'Personas / Reclutamiento',
    rol_id: CLAVE_ROLES.ANALISTA,
    estado: 'activo',
    fecha_ingreso: '2022-04-18',
    ultimo_acceso: '2026-09-29 10:05',
  },
  {
    id: 6,
    nombre: 'Camila Ortiz',
    correo: 'camila.ortiz@aquachile.cl',
    rut: '19.112.780-8',
    cargo: 'Practicante de Reclutamiento',
    unidad: 'Personas / Reclutamiento',
    rol_id: CLAVE_ROLES.ANALISTA,
    estado: 'inactivo',
    fecha_ingreso: '2025-09-01',
    ultimo_acceso: '2026-02-20 15:23',
  },

  // Evaluadores psicologos
  {
    id: 7,
    nombre: 'Valentina Aravena',
    correo: 'valentina.aravena@aquachile.cl',
    rut: '16.203.998-1',
    cargo: 'Psicologa Laboral (Contrata externa)',
    unidad: 'Consultora PS&SS',
    rol_id: CLAVE_ROLES.EVALUADOR,
    estado: 'activo',
    fecha_ingreso: '2023-05-08',
    ultimo_acceso: '2026-09-29 07:58',
  },
  {
    id: 8,
    nombre: 'Ignacio Perez',
    correo: 'ignacio.perez@aquachile.cl',
    rut: '17.401.336-0',
    cargo: 'Psicologa Laboral (Contrata externa)',
    unidad: 'Consultora PS&SS',
    rol_id: CLAVE_ROLES.EVALUADOR,
    estado: 'activo',
    fecha_ingreso: '2023-05-08',
    ultimo_acceso: '2026-09-27 16:12',
  },
  {
    id: 9,
    nombre: 'Carolina Reyes',
    correo: 'carolina.reyes@aquachile.cl',
    rut: '18.990.412-6',
    cargo: 'Psicologa Laboral (Contrata externa)',
    unidad: 'Consultora PS&SS',
    rol_id: CLAVE_ROLES.EVALUADOR,
    estado: 'activo',
    fecha_ingreso: '2024-02-19',
    ultimo_acceso: '2026-09-29 09:47',
  },
  {
    id: 10,
    nombre: 'Felipe Cardenas',
    correo: 'felipe.cardenas@aquachile.cl',
    rut: '19.556.023-3',
    cargo: 'Psicologa Laboral (Contrata externa)',
    unidad: 'Consultora PS&SS',
    rol_id: CLAVE_ROLES.EVALUADOR,
    estado: 'inactivo',
    fecha_ingreso: '2024-02-19',
    ultimo_acceso: '2026-06-30 12:00',
  },

  // Colaboradores: empleados de planta sin acceso a los modulos de gestion.
  // Son los candidatos elegibles para postulaciones internas.
  {
    id: 11,
    nombre: 'Jorge Luis Alvarado Retamal',
    correo: 'jorge.alvarado@aquachile.cl',
    rut: '16.401.882-3',
    cargo: 'Operario de Proceso',
    unidad: 'Planta Puerto Montt',
    rol_id: CLAVE_ROLES.COLABORADOR,
    estado: 'activo',
    fecha_ingreso: '2022-02-07',
    ultimo_acceso: '2026-09-25 12:30',
  },
  {
    id: 12,
    nombre: 'Paulina Andrea Contreras Vera',
    correo: 'paulina.contreras@aquachile.cl',
    rut: '17.665.204-9',
    cargo: 'Tecnico en Mantencion de Relojeria',
    unidad: 'Planta Puerto Montt',
    rol_id: CLAVE_ROLES.COLABORADOR,
    estado: 'activo',
    fecha_ingreso: '2021-09-13',
    ultimo_acceso: '2026-09-24 09:12',
  },
  {
    id: 13,
    nombre: 'Hector Manuel Rios Lagos',
    correo: 'hector.rios@aquachile.cl',
    rut: '15.998.471-0',
    cargo: 'Operario de Salmonicultura',
    unidad: 'Centro de Crianza Inca',
    rol_id: CLAVE_ROLES.COLABORADOR,
    estado: 'activo',
    fecha_ingreso: '2018-05-28',
    ultimo_acceso: '2026-09-22 18:04',
  },
  {
    id: 14,
    nombre: 'Mariafernanda Gutierrez Baeza',
    correo: 'mfernanda.gutierrez@aquachile.cl',
    rut: '18.220.775-6',
    cargo: 'Asistente Administrativa',
    unidad: 'Oficina Central',
    rol_id: CLAVE_ROLES.COLABORADOR,
    estado: 'activo',
    fecha_ingreso: '2023-08-14',
    ultimo_acceso: '2026-09-23 14:41',
  },
  {
    id: 15,
    nombre: 'Luis Alberto Navarro Pizarro',
    correo: 'luis.navarro@aquachile.cl',
    rut: '14.887.310-4',
    cargo: 'Supervisor de Turno',
    unidad: 'Planta Puerto Montt',
    rol_id: CLAVE_ROLES.COLABORADOR,
    estado: 'inactivo',
    fecha_ingreso: '2016-11-07',
    ultimo_acceso: '2026-07-14 08:20',
  },
];

/** Usuario simulado por defecto segun rol, usado para pintar el Navbar. */
export const USUARIOS_DEMO = {
  [CLAVE_ROLES.ADMINISTRADOR]: USUARIOS[0],
  [CLAVE_ROLES.ANALISTA]: USUARIOS[3],
  [CLAVE_ROLES.EVALUADOR]: USUARIOS[6],
};

export function obtenerUsuario(idUsuario) {
  return USUARIOS.find((usuario) => usuario.id === Number(idUsuario)) ?? null;
}

export function obtenerUsuarioPorCorreo(correo) {
  return USUARIOS.find((usuario) => usuario.correo.toLowerCase() === String(correo).toLowerCase()) ?? null;
}

/** Listado de usuarios sin rol administrador (para postulate interno). */
export function usuariosElegiblesInternos() {
  return USUARIOS.filter((usuario) => usuario.estado === 'activo');
}

/** Usuarios que pueden recibir solicitudes de evaluacion. */
export function usuariosEvaluadores() {
  return USUARIOS.filter((usuario) => usuario.rol_id === CLAVE_ROLES.EVALUADOR && usuario.estado === 'activo');
}