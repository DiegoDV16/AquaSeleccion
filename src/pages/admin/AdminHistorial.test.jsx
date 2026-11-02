import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminHistorial from './AdminHistorial.jsx';
import { listarHistorial } from '../../services/historialApi.js';

vi.mock('../../services/historialApi.js', () => ({
  listarHistorial: vi.fn(),
}));

const MOVIMIENTOS = [
  {
    id: 7,
    idSolicitud: 2,
    solicitud: 'SOL-0002',
    idCargo: 18,
    cargo: 'Asistente Social Faena',
    candidato: 'Camila Rojas Pérez',
    tipoGestion: 'externa',
    accion: 'Evaluación finalizada',
    detalle: 'Resultado: Apto. Observaciones: Buen desempeño.',
    usuario: 'Rodrigo Salazar',
    estado: 'finalizada',
    fecha: '2026-11-01 12:30:00',
  },
  {
    id: 6,
    idSolicitud: 2,
    solicitud: 'SOL-0002',
    idCargo: 18,
    cargo: 'Asistente Social Faena',
    candidato: 'Camila Rojas Pérez',
    tipoGestion: 'externa',
    accion: 'Evaluación iniciada',
    detalle: 'El evaluador inició la evaluación.',
    usuario: 'Rodrigo Salazar',
    estado: 'en_proceso',
    fecha: '2026-11-01 10:00:00',
  },
];

describe('AdminHistorial', () => {
  beforeEach(() => {
    listarHistorial.mockReset();
    listarHistorial.mockResolvedValue({ ok: true, movimientos: MOVIMIENTOS });
  });

  it('renderiza los movimientos que devuelve el backend', async () => {
    render(<AdminHistorial />);

    expect(await screen.findByText('Evaluación finalizada')).toBeInTheDocument();
    expect(screen.getAllByText('Camila Rojas Pérez')).toHaveLength(2);
    expect(screen.getAllByText('SOL-0002')).toHaveLength(2);
  });

  it('abre el detalle completo de un movimiento', async () => {
    const user = userEvent.setup();
    render(<AdminHistorial />);

    const botones = await screen.findAllByRole('button', { name: /^Ver$/ });
    await user.click(botones[0]);

    const modal = screen.getByRole('dialog');
    expect(within(modal).getByRole('heading', { name: 'Detalle del movimiento' })).toBeInTheDocument();
    expect(within(modal).getByText('ID del cargo')).toBeInTheDocument();
    expect(within(modal).getByText('18')).toBeInTheDocument();
    expect(
      within(modal).getByText('Resultado: Apto. Observaciones: Buen desempeño.')
    ).toBeInTheDocument();
  });

  it('envía el texto de búsqueda al endpoint del historial', async () => {
    const user = userEvent.setup();
    render(<AdminHistorial />);

    await screen.findByText('Evaluación finalizada');
    await user.type(screen.getByRole('searchbox'), 'SOL-0002');

    await waitFor(() => {
      expect(listarHistorial).toHaveBeenLastCalledWith(
        expect.objectContaining({ texto: 'SOL-0002' })
      );
    });
  });
});
