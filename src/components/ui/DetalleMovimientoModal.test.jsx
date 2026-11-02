import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DetalleMovimientoModal from './DetalleMovimientoModal.jsx';

const MOVIMIENTO = {
  id: 3,
  solicitud: 'SOL-0003',
  candidato: 'Camila Rojas',
  cargo: 'Asistente Social Faena',
  idCargo: 18,
  tipoGestion: 'externa',
  accion: 'Evaluación finalizada',
  detalle: 'Resultado: Apto.',
  usuario: 'Rodrigo Salazar',
  estado: 'finalizada',
  fecha: '2026-11-01 10:00:00',
};

describe('DetalleMovimientoModal accesible', () => {
  it('enfoca el primer control y cierra con Escape', async () => {
    const onCerrar = vi.fn();

    render(
      <DetalleMovimientoModal movimiento={MOVIMIENTO} visible onCerrar={onCerrar} />
    );

    const botones = screen.getAllByRole('button', { name: 'Cerrar' });

    await waitFor(() => {
      expect(document.activeElement).toBe(botones[0]);
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('mantiene el foco dentro del diálogo al tabular', async () => {
    render(
      <DetalleMovimientoModal movimiento={MOVIMIENTO} visible onCerrar={vi.fn()} />
    );

    const botones = screen.getAllByRole('button', { name: 'Cerrar' });
    const primero = botones[0];
    const ultimo = botones[botones.length - 1];

    await waitFor(() => {
      expect(document.activeElement).toBe(primero);
    });

    ultimo.focus();
    fireEvent.keyDown(document, { key: 'Tab' });

    expect(document.activeElement).toBe(primero);
  });
});
