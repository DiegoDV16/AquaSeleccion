import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EvaluadorMisSolicitudes from './EvaluadorMisSolicitudes.jsx';
import { AuthContext } from '../../context/AuthContext.js';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';
import { listarMisSolicitudes } from '../../services/solicitudesApi.js';

vi.mock('../../services/solicitudesApi.js', () => ({
  listarMisSolicitudes: vi.fn(),
}));

describe('EvaluadorMisSolicitudes', () => {
  beforeEach(() => {
    listarMisSolicitudes.mockReset();
    listarMisSolicitudes.mockResolvedValue({ ok: true, solicitudes: [] });
  });

  it('muestra las metricas vacias y permite cambiar filtros', async () => {
    const user = userEvent.setup();
    render(
      <AuthContext.Provider value={{ usuario: { nombre: 'Rodrigo Salazar' } }}>
        <MemoryRouter future={FUTURO_ROUTER}>
          <EvaluadorMisSolicitudes />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(await screen.findByText('Mis solicitudes')).toBeInTheDocument();
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Finalizada/i }));
    expect(screen.getByText(/No hay solicitudes en este estado/i)).toBeInTheDocument();
  });
});
