/**
 * metricas.js
 * Agregaciones calculadas sobre los datos simulados. En el backend estas
 * cifras saldran de consultas SQL con COUNT/SUM agrupado por estado y tipo.
 *
 * Cada metrica declara `acento` (color solido para el borde y el icono de la
 * tarjeta) y `tinte` (fondo claro para la pastilla de tendencia). Los colores
 * solidos se eligen de la paleta --aqua-solid-* del tema: blanco encima siempre
 * supera el contraste AA.
 */

import { CANDIDATOS } from './candidatos.js';
import { SOLICITUDES } from './solicitudes.js';
import { USUARIOS } from './usuarios.js';
import { ESTADOS_SOLICITUD } from './solicitudes.js';
import { FAMILIAS_CARGO, obtenerCargo } from './cargos.js';

export function metricasDashboard() {
  const externas = CANDIDATOS.filter((candidato) => candidato.tipo_postulacion === 'externa');
  const internas = CANDIDATOS.filter((candidato) => candidato.tipo_postulacion === 'interna');

  const enProceso = SOLICITUDES.filter((solicitud) => solicitud.estado === 'en_proceso');
  const finalizadas = SOLICITUDES.filter((solicitud) => solicitud.estado === 'finalizada');
  const pendientes = SOLICITUDES.filter((solicitud) => solicitud.estado === 'pendiente');
  const aptos = finalizadas.filter((solicitud) => solicitud.resultado === 'apto');
  const usuariosActivos = USUARIOS.filter((usuario) => usuario.estado === 'activo').length;

  return [
    {
      clave: 'postulaciones_externas',
      titulo: 'Postulaciones externas',
      valor: externas.length,
      pie: `${externas.filter((c) => c.estado === 'pendiente').length} sin evaluar`,
      variacion: '+18% vs. mes anterior',
      icono: 'envelope-paper',
      acento: 'var(--aqua-solid-primary)',
      tinte: 'bg-tint-primary',
    },
    {
      clave: 'postulaciones_internas',
      titulo: 'Postulaciones internas',
      valor: internas.length,
      pie: `${internas.filter((c) => c.estado === 'pendiente').length} sin evaluar`,
      variacion: '+2 vs. mes anterior',
      icono: 'building',
      acento: 'var(--aqua-solid-info)',
      tinte: 'bg-tint-info',
    },
    {
      clave: 'evaluaciones_proceso',
      titulo: 'Evaluaciones en proceso',
      valor: enProceso.length,
      pie: `${pendientes.length} pendientes de asignar`,
      variacion: 'En curso',
      icono: 'arrow-repeat',
      acento: 'var(--aqua-solid-warning)',
      tinte: 'bg-tint-warning',
    },
    {
      clave: 'evaluaciones_finalizadas',
      titulo: 'Evaluaciones finalizadas',
      valor: finalizadas.length,
      pie: `${aptos.length} con resultado apto`,
      variacion: `${finalizadas.length} de ${SOLICITUDES.length} solicitudes`,
      icono: 'check-circle',
      acento: 'var(--aqua-solid-success)',
      tinte: 'bg-tint-success',
    },
    {
      clave: 'usuarios_activos',
      titulo: 'Usuarios activos',
      valor: usuariosActivos,
      pie: `${USUARIOS.length} usuarios registrados`,
      variacion: 'Sistema operativo',
      icono: 'person-gear',
      acento: 'var(--aqua-solid-primary)',
      tinte: 'bg-tint-primary',
    },
    {
      clave: 'tasa_aprobacion',
      titulo: 'Tasa de aprobacion',
      valor: `${finalizadas.length ? Math.round((aptos.length / finalizadas.length) * 100) : 0}%`,
      pie: 'Sobre evaluaciones finalizadas',
      variacion: 'Meta >= 60%',
      icono: 'percent',
      acento: 'var(--aqua-solid-secondary)',
      tinte: 'bg-tint-info',
    },
  ];
}

/** Solicitudes por estado, para las barras de distribucion del dashboard. */
export function distribucionPorEstado() {
  const colores = {
    pendiente: 'var(--aqua-solid-warning)',
    en_proceso: 'var(--aqua-solid-primary)',
    finalizada: 'var(--aqua-solid-success)',
  };

  return ESTADOS_SOLICITUD.map((estado) => ({
    clave: estado.clave,
    nombre: estado.nombre,
    total: SOLICITUDES.filter((solicitud) => solicitud.estado === estado.clave).length,
    color: colores[estado.clave],
  }));
}

/** Postulaciones por familia de cargo (solo las que tienen movimiento). */
export function distribucionPorFamilia() {
  return FAMILIAS_CARGO.map((familia) => ({
    clave: familia.id,
    nombre: familia.nombre,
    total: CANDIDATOS.filter((candidato) => obtenerCargo(candidato.cargo_id)?.familia_id === familia.id)
      .length,
  })).filter((familia) => familia.total > 0);
}

/** Actividad reciente para el panel lateral del dashboard. */
export const ACTIVIDAD_RECIENTE = [
  {
    id: 1,
    icono: 'person-plus',
    tinte: 'bg-tint-primary',
    titulo: 'Nueva postulacion externa',
    detalle: 'Martina Andrea Contreras Muniz - Tecnico en Clone',
    fecha: '2026-09-24 18:47',
  },
  {
    id: 2,
    icono: 'building-add',
    tinte: 'bg-tint-info',
    titulo: 'Postulacion interna registrada',
    detalle: 'Jorge Luis Alvarado Retamal - Tecnico Electromecanico',
    fecha: '2026-09-23 11:22',
  },
  {
    id: 3,
    icono: 'clipboard2-check',
    tinte: 'bg-tint-success',
    titulo: 'Evaluacion finalizada',
    detalle: 'Constanza Belen Vergara Nunez - Apto',
    fecha: '2026-09-18 17:03',
  },
  {
    id: 4,
    icono: 'person-gear',
    tinte: 'bg-tint-warning',
    titulo: 'Solicitud reasignada',
    detalle: 'SOL-0142 reasignada a Valentina Aravena',
    fecha: '2026-09-26 10:12',
  },
];

/** Cargos con mayor demanda de postulaciones (para el dashboard). */
export const TOP_CARGOS = [
  { cargo: 'Operario de Salmonicultura', postulaciones: 4, vacantes: 6 },
  { cargo: 'Tecnico Electromecanico', postulaciones: 3, vacantes: 3 },
  { cargo: 'Analista Contable', postulaciones: 2, vacantes: 2 },
  { cargo: 'Analista de Calidad e Inocuidad', postulaciones: 2, vacantes: 2 },
  { cargo: 'Chofer Repartidor', postulaciones: 1, vacantes: 2 },
];