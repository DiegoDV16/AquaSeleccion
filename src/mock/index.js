/**
 * index.js
 * Punto unico de importacion de la capa de datos simulados.
 * Cuando exista MySQL + PHP, este archivo se reemplaza por un servicio HTTP
 * (fetch/axios) contra la API, manteniendo los mismos nombres de funcion para
 * que las vistas no cambien.
 */

export * from './catalogoRoles.js';
export * from './cargos.js';
export * from './usuarios.js';
export * from './candidatos.js';
export * from './solicitudes.js';
export * from './historialSolicitudes.js';
export * from './menu.js';
export * from './metricas.js';