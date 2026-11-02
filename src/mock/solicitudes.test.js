import { describe, expect, it } from 'vitest';

import {
  buscarEstadoSolicitud,
  buscarResultado,
  formatearFecha,
  proximoIdSolicitud,
} from './solicitudes.js';

describe('formatearFecha', () => {
  it('convierte una fecha ISO a formato dd/mm/aaaa', () => {
    expect(formatearFecha('2026-09-25')).toBe('25/09/2026');
  });

  it('muestra un guion cuando no hay fecha', () => {
    expect(formatearFecha(null)).toBe('-');
  });
});

describe('proximoIdSolicitud', () => {
  it('genera el siguiente consecutivo a partir del id mas alto', () => {
    expect(proximoIdSolicitud()).toBe('SOL-0143');
  });
});

describe('buscarEstadoSolicitud', () => {
  it('devuelve el estado de la clave indicada', () => {
    expect(buscarEstadoSolicitud('finalizada').nombre).toBe('Finalizada');
  });

  it('usa pendiente cuando la clave no existe', () => {
    expect(buscarEstadoSolicitud('clave_inexistente').clave).toBe('pendiente');
  });
});

describe('buscarResultado', () => {
  it('devuelve el resultado de la clave indicada', () => {
    expect(buscarResultado('apto').nombre).toBe('Apto');
  });

  it('devuelve null cuando la clave no existe', () => {
    expect(buscarResultado('clave_inexistente')).toBeNull();
  });
});
