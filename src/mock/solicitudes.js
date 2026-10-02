/**
 * solicitudes.js
 * Simula la tabla `solicitudes`. Cada solicitud vincula un candidato con un
 * evaluador responsable y con el cargo competition. El campo `resultado`
 * (apto / no_apto / con_observaciones) solo se informa cuando la solicitud
 * pasa a estado 'finalizada'.
 */

export const ESTADOS_SOLICITUD = [
  { clave: 'pendiente', nombre: 'Pendiente', color: 'badge-estado-pendiente', icono: 'hourglass-split' },
  { clave: 'en_proceso', nombre: 'En proceso', color: 'badge-estado-proceso', icono: 'arrow-repeat' },
  { clave: 'finalizada', nombre: 'Finalizada', color: 'badge-estado-finalizada', icono: 'check-circle' },
];

export const RESULTADOS_EVALUACION = [
  { clave: 'apto', nombre: 'Apto', color: 'badge-estado-apto' },
  { clave: 'no_apto', nombre: 'No Apto', color: 'badge-estado-noapto' },
  { clave: 'con_observaciones', nombre: 'Con observaciones', color: 'badge-estado-observaciones' },
];

export const SOLICITUDES = [
  {
    id: 'SOL-0142',
    candidato_id: 1,
    evaluador_id: 7,
    cargo_id: 5,
    estado: 'en_proceso',
    resultado: null,
    fecha_creacion: '2026-09-25',
    fecha_asignacion: '2026-09-26',
    fecha_evaluacion: null,
    observaciones: null,
    prioridad: 'alta',
  },
  {
    id: 'SOL-0141',
    candidato_id: 5,
    evaluador_id: 7,
    cargo_id: 6,
    estado: 'pendiente',
    resultado: null,
    fecha_creacion: '2026-09-24',
    fecha_asignacion: '2026-09-24',
    fecha_evaluacion: null,
    observaciones: null,
    prioridad: 'normal',
  },
  {
    id: 'SOL-0140',
    candidato_id: 8,
    evaluador_id: 7,
    cargo_id: 6,
    estado: 'en_proceso',
    resultado: null,
    fecha_creacion: '2026-09-22',
    fecha_asignacion: '2026-09-23',
    fecha_evaluacion: null,
    observaciones: null,
    prioridad: 'normal',
  },
  {
    id: 'SOL-0139',
    candidato_id: 2,
    evaluador_id: 8,
    cargo_id: 1,
    estado: 'pendiente',
    resultado: null,
    fecha_creacion: '2026-09-23',
    fecha_asignacion: '2026-09-23',
    fecha_evaluacion: null,
    observaciones: null,
    prioridad: 'normal',
  },
  {
    id: 'SOL-0138',
    candidato_id: 6,
    evaluador_id: 8,
    cargo_id: 9,
    estado: 'pendiente',
    resultado: null,
    fecha_creacion: '2026-09-20',
    fecha_asignacion: '2026-09-21',
    fecha_evaluacion: null,
    observaciones: null,
    prioridad: 'baja',
  },
  {
    id: 'SOL-0137',
    candidato_id: 9,
    evaluador_id: 9,
    cargo_id: 5,
    estado: 'pendiente',
    resultado: null,
    fecha_creacion: '2026-09-21',
    fecha_asignacion: '2026-09-22',
    fecha_evaluacion: null,
    observaciones: null,
    prioridad: 'normal',
  },
  {
    id: 'SOL-0136',
    candidato_id: 11,
    evaluador_id: 9,
    cargo_id: 11,
    estado: 'pendiente',
    resultado: null,
    fecha_creacion: '2026-09-18',
    fecha_asignacion: '2026-09-19',
    fecha_evaluacion: null,
    observaciones: null,
    prioridad: 'normal',
  },
  {
    id: 'SOL-0135',
    candidato_id: 3,
    evaluador_id: 9,
    cargo_id: 11,
    estado: 'finalizada',
    resultado: 'apto',
    fecha_creacion: '2026-09-10',
    fecha_asignacion: '2026-09-11',
    fecha_evaluacion: '2026-09-18',
    observaciones:
      'Perfil analitico solido, buena instruccion de rol y manejo de Excel. Sin observaciones relevantes.',
    prioridad: 'normal',
  },
  {
    id: 'SOL-0134',
    candidato_id: 7,
    evaluador_id: 8,
    cargo_id: 10,
    estado: 'finalizada',
    resultado: 'con_observaciones',
    fecha_creacion: '2026-09-08',
    fecha_asignacion: '2026-09-09',
    fecha_evaluacion: '2026-09-16',
    observaciones:
      'Destaca en negociacion con proveedores. Se recomienda acompanamiento en gestion de tiempos bajo carga.',
    prioridad: 'normal',
  },
  {
    id: 'SOL-0133',
    candidato_id: 4,
    evaluador_id: 7,
    cargo_id: 14,
    estado: 'finalizada',
    resultado: 'no_apto',
    fecha_creacion: '2026-09-05',
    fecha_asignacion: '2026-09-06',
    fecha_evaluacion: '2026-09-12',
    observaciones:
      'No posee certificacion HACCP requerida y presenta antecedentes de inconvenientes en protocolos de inocuidad alimentaria.',
    prioridad: 'alta',
  },
  {
    id: 'SOL-0132',
    candidato_id: 10,
    evaluador_id: 9,
    cargo_id: 3,
    estado: 'finalizada',
    resultado: 'apto',
    fecha_creacion: '2026-09-02',
    fecha_asignacion: '2026-09-03',
    fecha_evaluacion: '2026-09-11',
    observaciones:
      'Amplia experiencia en planta, leadership de equipo reconocido por pares. Apto para ascenso interno.',
    prioridad: 'normal',
  },
];

/** Consecutivo simulado para nuevas solicitudes (SELECT MAX(id) + 1). */
export function proximoIdSolicitud() {
  const maximo = SOLICITUDES.reduce((mayor, solicitud) => Math.max(mayor, Number(solicitud.id.slice(4))), 0);
  return `SOL-${String(maximo + 1).padStart(4, '0')}`;
}

export function obtenerSolicitud(idSolicitud) {
  return SOLICITUDES.find((solicitud) => solicitud.id === idSolicitud) ?? null;
}

export function solicitudesDeEvaluador(idEvaluador) {
  return SOLICITUDES.filter((solicitud) => solicitud.evaluador_id === Number(idEvaluador));
}

export function buscarEstadoSolicitud(clave) {
  return ESTADOS_SOLICITUD.find((estado) => estado.clave === clave) ?? ESTADOS_SOLICITUD[0];
}

export function buscarResultado(clave) {
  return RESULTADOS_EVALUACION.find((resultado) => resultado.clave === clave) ?? null;
}

export function formatearFecha(fecha) {
  if (!fecha) return '-';
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}