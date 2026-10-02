/**
 * historialSolicitudes.js
 * Simula la tabla `historialsolicitudes` (trazabilidad). Cada fila representa un
 * movimiento del ciclo de vida de una solicitud: creacion, asignacion de
 * evaluador, inicio de evaluacion y finalizacion.
 */

export const TIPOS_GESTION = [
  { clave: 'externa', nombre: 'Externa', className: 'badge-tipo-externa' },
  { clave: 'interna', nombre: 'Interna', className: 'badge-tipo-interna' },
];

export const HISTORIAL_SOLICITUDES = [
  {
    id: 1,
    solicitud_id: 'SOL-0133',
    candidato: 'Rodrigo Alonso Fuentes Castro',
    tipo_gestion: 'externa',
    accion: 'Evaluacion finalizada',
    detalle: 'Resultado: No Apto. Se notifica fin del proceso.',
    usuario_accion: 'Valentina Aravena',
    estado: 'finalizada',
    fecha_movimiento: '2026-09-12 15:40',
  },
  {
    id: 2,
    solicitud_id: 'SOL-0142',
    candidato: 'Martina Andrea Contreras Muniz',
    tipo_gestion: 'externa',
    accion: 'Asignacion de evaluador',
    detalle: 'Solicitud asignada a Valentina Aravena.',
    usuario_accion: 'Maria Jose Rojas',
    estado: 'en_proceso',
    fecha_movimiento: '2026-09-26 10:12',
  },
  {
    id: 3,
    solicitud_id: 'SOL-0142',
    candidato: 'Martina Andrea Contreras Muniz',
    tipo_gestion: 'externa',
    accion: 'Creacion de solicitud',
    detalle: 'Analista crea solicitud a partir de postulacion externa.',
    usuario_accion: 'Maria Jose Rojas',
    estado: 'pendiente',
    fecha_movimiento: '2026-09-25 09:05',
  },
  {
    id: 4,
    solicitud_id: 'SOL-0142',
    candidato: 'Martina Andrea Contreras Muniz',
    tipo_gestion: 'externa',
    accion: 'Postulacion registrada',
    detalle: 'Postulacion recibida desde el portal publico.',
    usuario_accion: 'Postulante (formulario web)',
    estado: 'pendiente',
    fecha_movimiento: '2026-09-24 18:47',
  },
  {
    id: 5,
    solicitud_id: 'SOL-0140',
    candidato: 'Jorge Luis Alvarado Retamal',
    tipo_gestion: 'interna',
    accion: 'Postulacion interna registrada',
    detalle: 'Administrador postula al colaborador al cargo Tecnico Electromecanico.',
    usuario_accion: 'Catalina Fuentes',
    estado: 'en_proceso',
    fecha_movimiento: '2026-09-23 11:22',
  },
  {
    id: 6,
    solicitud_id: 'SOL-0135',
    candidato: 'Constanza Belen Vergara Nunez',
    tipo_gestion: 'externa',
    accion: 'Evaluacion finalizada',
    detalle: 'Resultado: Apto. Se habilita para continuar el proceso.',
    usuario_accion: 'Carolina Reyes',
    estado: 'finalizada',
    fecha_movimiento: '2026-09-18 17:03',
  },
  {
    id: 7,
    solicitud_id: 'SOL-0134',
    candidato: 'Fernanda Sofia Aguilera Bustos',
    tipo_gestion: 'externa',
    accion: 'Evaluacion finalizada',
    detalle: 'Resultado: Con observaciones.',
    usuario_accion: 'Ignacio Perez',
    estado: 'finalizada',
    fecha_movimiento: '2026-09-16 16:28',
  },
  {
    id: 8,
    solicitud_id: 'SOL-0137',
    candidato: 'Paulina Andrea Contreras Vera',
    tipo_gestion: 'interna',
    accion: 'Asignacion de evaluador',
    detalle: 'Solicitud asignada a Carolina Reyes.',
    usuario_accion: 'Sebastian Tapia',
    estado: 'pendiente',
    fecha_movimiento: '2026-09-22 08:55',
  },
  {
    id: 9,
    solicitud_id: 'SOL-0137',
    candidato: 'Paulina Andrea Contreras Vera',
    tipo_gestion: 'interna',
    accion: 'Postulacion interna registrada',
    detalle: 'Administrador postula al colaborador al cargo Tecnico en Clone.',
    usuario_accion: 'Catalina Fuentes',
    estado: 'pendiente',
    fecha_movimiento: '2026-09-20 14:10',
  },
  {
    id: 10,
    solicitud_id: 'SOL-0139',
    candidato: 'Javier Esteban Ponce Diaz',
    tipo_gestion: 'externa',
    accion: 'Asignacion de evaluador',
    detalle: 'Solicitud asignada a Ignacio Perez.',
    usuario_accion: 'Maria Jose Rojas',
    estado: 'pendiente',
    fecha_movimiento: '2026-09-23 13:36',
  },
  {
    id: 11,
    solicitud_id: 'SOL-0132',
    candidato: 'Hector Manuel Rios Lagos',
    tipo_gestion: 'interna',
    accion: 'Evaluacion finalizada',
    detalle: 'Resultado: Apto. Ascenso interno validado.',
    usuario_accion: 'Carolina Reyes',
    estado: 'finalizada',
    fecha_movimiento: '2026-09-11 12:19',
  },
  {
    id: 12,
    solicitud_id: 'SOL-0138',
    candidato: 'Cristobal Nicolas Munos Sepulveda',
    tipo_gestion: 'externa',
    accion: 'Asignacion de evaluador',
    detalle: 'Solicitud asignada a Ignacio Perez.',
    usuario_accion: 'Sebastian Tapia',
    estado: 'pendiente',
    fecha_movimiento: '2026-09-21 10:44',
  },
];

export function filtrarHistorial({ tipoGestion = 'todas', estado = 'todas', texto = '' } = {}) {
  return HISTORIAL_SOLICITUDES.filter((movimiento) => {
    const coincideTipo = tipoGestion === 'todas' || movimiento.tipo_gestion === tipoGestion;
    const coincideEstado = estado === 'todas' || movimiento.estado === estado;
    const coincideTexto =
      texto.trim() === '' ||
      movimiento.candidato.toLowerCase().includes(texto.trim().toLowerCase()) ||
      movimiento.solicitud_id.toLowerCase().includes(texto.trim().toLowerCase());
    return coincideTipo && coincideEstado && coincideTexto;
  });
}

export function tipoGestion(clave) {
  return TIPOS_GESTION.find((tipo) => tipo.clave === clave) ?? TIPOS_GESTION[0];
}