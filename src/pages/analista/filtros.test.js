import { describe, expect, it } from 'vitest';

import { filtrarCandidatos, filtrarSolicitudes } from './filtros.js';

const candidatos = [
  {
    id: 1,
    nombreCompleto: 'Martina Contreras',
    correo: 'martina@correo.cl',
    telefono: '+56 9 1111 2222',
    tipoPostulacion: 'externa',
  },
  {
    id: 2,
    nombreCompleto: 'Jorge Alvarado',
    correo: 'jorge@aquachile.cl',
    telefono: '+56 9 3333 4444',
    tipoPostulacion: 'interna',
  },
];

const solicitudes = [
  {
    id: 12,
    estado: 'pendiente',
    fechaSolicitud: '2026-10-30',
    candidato: { idCargo: 5, nombreCompleto: 'Martina Contreras', correo: 'martina@correo.cl' },
    evaluador: { id: 7, nombre: 'Valentina Aravena' },
  },
  {
    id: 13,
    estado: 'en_proceso',
    fechaSolicitud: '2026-10-25',
    candidato: { idCargo: 6, nombreCompleto: 'Jorge Alvarado', correo: 'jorge@aquachile.cl' },
    evaluador: { id: 8, nombre: 'Ignacio Perez' },
  },
  {
    id: 14,
    estado: 'finalizada',
    fechaSolicitud: '2026-10-20',
    candidato: { idCargo: 5, nombreCompleto: 'Paulina Contreras', correo: 'paulina@aquachile.cl' },
    evaluador: null,
  },
];

describe('filtrarCandidatos', () => {
  it('devuelve todos los candidatos sin filtros', () => {
    expect(filtrarCandidatos(candidatos)).toHaveLength(2);
  });

  it('busca por nombre, correo y telefono sin distinguir mayusculas', () => {
    expect(filtrarCandidatos(candidatos, { busqueda: 'MARTINA' })).toHaveLength(1);
    expect(filtrarCandidatos(candidatos, { busqueda: 'aquachile' })).toHaveLength(1);
    expect(filtrarCandidatos(candidatos, { busqueda: '3333' })).toHaveLength(1);
  });

  it('filtra por origen de la postulacion', () => {
    expect(filtrarCandidatos(candidatos, { tipo: 'interna' })).toHaveLength(1);
    expect(filtrarCandidatos(candidatos, { tipo: 'externa' })[0].id).toBe(1);
  });

  it('combina texto y origen', () => {
    expect(filtrarCandidatos(candidatos, { busqueda: 'jorge', tipo: 'externa' })).toHaveLength(0);
  });
});

describe('filtrarSolicitudes', () => {
  it('devuelve todas las solicitudes sin filtros', () => {
    expect(filtrarSolicitudes(solicitudes)).toHaveLength(3);
  });

  it('filtra por estado', () => {
    const resultado = filtrarSolicitudes(solicitudes, { estado: 'pendiente' });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe(12);
  });

  it('filtra por cargo y evaluador', () => {
    expect(filtrarSolicitudes(solicitudes, { idCargo: '5' })).toHaveLength(2);
    expect(filtrarSolicitudes(solicitudes, { idEvaluador: '8' })).toHaveLength(1);
  });

  it('filtra por fecha de solicitud desde', () => {
    const resultado = filtrarSolicitudes(solicitudes, { fechaDesde: '2026-10-25' });

    expect(resultado.map((solicitud) => solicitud.id)).toEqual([12, 13]);
  });

  it('busca por ID, codigo SOL o nombre del candidato', () => {
    expect(filtrarSolicitudes(solicitudes, { texto: '13' })).toHaveLength(1);
    expect(filtrarSolicitudes(solicitudes, { texto: 'sol-0014' })).toHaveLength(1);
    expect(filtrarSolicitudes(solicitudes, { texto: 'paulina' })).toHaveLength(1);
  });

  it('combina estado, cargo y texto', () => {
    const resultado = filtrarSolicitudes(solicitudes, {
      estado: 'en_proceso',
      idCargo: '6',
      texto: 'jorge',
    });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe(13);
  });
});
