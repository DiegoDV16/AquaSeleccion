import { describe, expect, it } from 'vitest';

import { CLAVE_ROLES, obtenerRol, PERMISOS_POR_MODULO, ROLES } from './catalogoRoles.js';

describe('obtenerRol', () => {
  it('devuelve el rol de la clave indicada', () => {
    expect(obtenerRol('evaluador').nombre).toBe('Profesional Evaluador');
  });

  it('usa administrador cuando la clave no existe', () => {
    expect(obtenerRol('clave_inexistente').clave).toBe(CLAVE_ROLES.ADMINISTRADOR);
  });
});

describe('ROLES', () => {
  it('solo el colaborador queda sin modulo de inicio', () => {
    const sinModulo = ROLES.filter((rol) => rol.rutaInicio === null).map((rol) => rol.clave);

    expect(sinModulo).toEqual([CLAVE_ROLES.COLABORADOR]);
  });
});

describe('PERMISOS_POR_MODULO', () => {
  it('cada modulo admite exactamente su rol', () => {
    expect(PERMISOS_POR_MODULO.ADMINISTRADOR).toEqual([CLAVE_ROLES.ADMINISTRADOR]);
    expect(PERMISOS_POR_MODULO.ADMINISTRACION).toEqual([
      CLAVE_ROLES.ADMINISTRADOR,
      CLAVE_ROLES.JEFATURA,
    ]);
    expect(PERMISOS_POR_MODULO.ANALISTA).toEqual([CLAVE_ROLES.ANALISTA]);
    expect(PERMISOS_POR_MODULO.EVALUADOR).toEqual([CLAVE_ROLES.EVALUADOR]);
  });

  it('el colaborador no tiene acceso a ningun modulo', () => {
    const todosLosRoles = Object.values(PERMISOS_POR_MODULO).flat();

    expect(todosLosRoles).not.toContain(CLAVE_ROLES.COLABORADOR);
  });

  it('la ruta de inicio de cada rol pertenece a su modulo', () => {
    const prefijoPorModulo = {
      ADMINISTRADOR: '/admin',
      ADMINISTRACION: '/admin',
      ANALISTA: '/analista',
      EVALUADOR: '/evaluador',
    };

    for (const [modulo, claves] of Object.entries(PERMISOS_POR_MODULO)) {
      for (const clave of claves) {
        expect(obtenerRol(clave).rutaInicio.startsWith(prefijoPorModulo[modulo])).toBe(true);
      }
    }
  });
});
