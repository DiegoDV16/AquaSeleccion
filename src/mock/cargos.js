/**
 * cargos.js
 * Simula las tablas `familias_cargo` y `cargos`.
 * El vinculo Familia -> Cargo se modela con `cargos.familia_id`, que es el
 * mismo criterio que usara el endpoint PHP `/api/cargos`.
 */

export const FAMILIAS_CARGO = [
  { id: 1, nombre: 'Produccion y Operaciones', icono: 'water', color: 'primary' },
  { id: 2, nombre: 'Tecnico y Mantencion', icono: 'tools', color: 'info' },
  { id: 3, nombre: 'Logistica y Abastecimiento', icono: 'truck', color: 'warning' },
  { id: 4, nombre: 'Administracion y Finanzas', icono: 'calculator', color: 'success' },
  { id: 5, nombre: 'Calidad e Inocuidad', icono: 'patch-check', color: 'danger' },
  { id: 6, nombre: 'Recursos Humanos', icono: 'person-workspace', color: 'secondary' },
];

export const CARGOS = [
  // Produccion y Operaciones
  { id: 1, familia_id: 1, nombre: 'Operario de Salmonicultura', jornada: 'Turno rotativo', vacantes: 6, estado: 'activo' },
  { id: 2, familia_id: 1, nombre: 'Operario de Proceso', jornada: 'Turno rotativo', vacantes: 3, estado: 'activo' },
  { id: 3, familia_id: 1, nombre: 'Supervisor de Turno', jornada: 'Diurna', vacantes: 1, estado: 'activo' },
  { id: 4, familia_id: 1, nombre: 'Buzo Apostador', jornada: 'Diurna', vacantes: 2, estado: 'inactivo' },

  // Tecnico y Mantencion
  { id: 5, familia_id: 2, nombre: 'Tecnico en Clone (Acuicultura)', jornada: 'Diurna', vacantes: 2, estado: 'activo' },
  { id: 6, familia_id: 2, nombre: 'Tecnico Electromecanico', jornada: 'Diurna', vacantes: 3, estado: 'activo' },
  { id: 7, familia_id: 2, nombre: 'Tecnico en Mantencion de Relojeria', jornada: 'Diurna', vacantes: 1, estado: 'activo' },

  // Logistica y Abastecimiento
  { id: 8, familia_id: 3, nombre: 'Chofer Repartidor', jornada: 'Diurna', vacantes: 2, estado: 'activo' },
  { id: 9, familia_id: 3, nombre: 'Encargado de Bodega', jornada: 'Diurna', vacantes: 1, estado: 'activo' },
  { id: 10, familia_id: 3, nombre: 'Analista de Compras', jornada: 'Diurna', vacantes: 1, estado: 'activo' },

  // Administracion y Finanzas
  { id: 11, familia_id: 4, nombre: 'Analista Contable', jornada: 'Diurna', vacantes: 2, estado: 'activo' },
  { id: 12, familia_id: 4, nombre: 'Asistente Administrativa', jornada: 'Diurna', vacantes: 1, estado: 'activo' },
  { id: 13, familia_id: 4, nombre: 'Jefe de Tesoreria', jornada: 'Diurna', vacantes: 1, estado: 'inactivo' },

  // Calidad e Inocuidad
  { id: 14, familia_id: 5, nombre: 'Analista de Calidad e Inocuidad', jornada: 'Diurna', vacantes: 2, estado: 'activo' },
  { id: 15, familia_id: 5, nombre: 'Asistente de Muestreo', jornada: 'Rotativa', vacantes: 1, estado: 'activo' },

  // Recursos Humanos
  { id: 16, familia_id: 6, nombre: 'Analista de Seleccion y Reclutamiento', jornada: 'Diurna', vacantes: 1, estado: 'activo' },
  { id: 17, familia_id: 6, nombre: 'Encargado de Relaciones Laborales', jornada: 'Diurna', vacantes: 1, estado: 'activo' },
];

export function obtenerFamilia(idFamilia) {
  return FAMILIAS_CARGO.find((familia) => familia.id === Number(idFamilia)) ?? null;
}

export function obtenerCargo(idCargo) {
  return CARGOS.find((cargo) => cargo.id === Number(idCargo)) ?? null;
}

/** Cargos habilitados, agrupados por familia, para poblar los <select>. */
export function cargosPorFamilia() {
  return FAMILIAS_CARGO.map((familia) => ({
    ...familia,
    cargos: CARGOS.filter((cargo) => cargo.familia_id === familia.id && cargo.estado === 'activo'),
  })).filter((grupo) => grupo.cargos.length > 0);
}

/** Nombre legible "Familia / Cargo". */
export function nombreCargoCompleto(idCargo) {
  const cargo = obtenerCargo(idCargo);
  if (!cargo) return 'Cargo no definido';
  const familia = obtenerFamilia(cargo.familia_id);
  return `${familia ? familia.nombre : 'Sin familia'} / ${cargo.nombre}`;
}