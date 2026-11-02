import { describe, expect, it } from 'vitest';

import { CLAVE_ROLES } from './catalogoRoles.js';
import { contadoresMenu } from './menu.js';

const claveAnalista = `${CLAVE_ROLES.ANALISTA}/analista/solicitudes`;
const claveEvaluador = `${CLAVE_ROLES.EVALUADOR}/evaluador/mis-solicitudes`;

describe('contadoresMenu', () => {
  it('cuenta todas las solicitudes pendientes para el analista', () => {
    expect(contadoresMenu(4)[claveAnalista]).toBe(5);
  });

  it('cuenta solo las pendientes del evaluador indicado', () => {
    expect(contadoresMenu(7)[claveEvaluador]).toBe(1);
    expect(contadoresMenu(8)[claveEvaluador]).toBe(2);
  });

  it('acepta el id del evaluador como texto', () => {
    expect(contadoresMenu('8')[claveEvaluador]).toBe(2);
  });

  it('devuelve 0 para el evaluador sin id o sin solicitudes', () => {
    expect(contadoresMenu(undefined)[claveEvaluador]).toBe(0);
    expect(contadoresMenu(999)[claveEvaluador]).toBe(0);
  });
});
