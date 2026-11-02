import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminCandidatos from './AdminCandidatos.jsx';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';
import { listarCandidatos } from '../../services/candidatosApi.js';

vi.mock('../../services/candidatosApi.js', () => ({
  listarCandidatos: vi.fn(),
  crearCandidato: vi.fn(),
}));

vi.mock('../../services/catalogosApi.js', () => ({
  listarFamiliasCargos: vi.fn().mockResolvedValue({ ok: true, familias: [] }),
  listarCargosPorFamilia: vi.fn().mockResolvedValue({ ok: true, cargos: [] }),
}));

describe('AdminCandidatos', () => {
  beforeEach(() => {
    listarCandidatos.mockReset();
    listarCandidatos.mockResolvedValue({
      ok: true,
      candidatos: [{
        id: 12,
        nombreCompleto: 'Camila Rojas Pérez',
        correo: 'camila@example.cl',
        telefono: '+56912345678',
        tipoPostulacion: 'externa',
        cargo: 'Analista de Personas',
        familiaCargo: 'Personas',
        estado: 'pendiente',
        fechaPostulacion: '2026-10-30',
      }],
    });
  });

  it('filtra candidatos por texto y abre el formulario interno', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter future={FUTURO_ROUTER}>
        <AdminCandidatos />
      </MemoryRouter>
    );

    expect(await screen.findByText('Camila Rojas Pérez')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Buscar candidatos/i), 'camila');
    expect(screen.getByText('Camila Rojas Pérez')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Nueva postulación interna/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
