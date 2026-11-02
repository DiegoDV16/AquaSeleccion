import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AnalistaCandidatos from './AnalistaCandidatos.jsx';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';
import { actualizarCandidato, crearCandidato, listarCandidatos } from '../../services/candidatosApi.js';
import { listarFamiliasCargos } from '../../services/catalogosApi.js';

vi.mock('../../services/candidatosApi.js', () => ({
  actualizarCandidato: vi.fn(),
  crearCandidato: vi.fn(),
  listarCandidatos: vi.fn(),
}));

vi.mock('../../services/catalogosApi.js', () => ({
  listarFamiliasCargos: vi.fn(),
}));

describe('AnalistaCandidatos', () => {
  beforeEach(() => {
    listarCandidatos.mockReset();
    listarFamiliasCargos.mockReset();
    actualizarCandidato.mockReset();
    crearCandidato.mockReset();
    listarCandidatos.mockResolvedValue({ ok: true, candidatos: [] });
    listarFamiliasCargos.mockResolvedValue({ ok: true, familias: [] });
  });

  it('muestra el listado vacio y permite iniciar el registro', async () => {
    render(
      <MemoryRouter future={FUTURO_ROUTER}>
        <AnalistaCandidatos />
      </MemoryRouter>
    );

    expect(await screen.findByText(/0 postulaciones/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar candidato/i })).toBeInTheDocument();
  });
});
