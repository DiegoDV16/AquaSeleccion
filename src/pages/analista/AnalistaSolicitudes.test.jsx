import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AnalistaSolicitudes from './AnalistaSolicitudes.jsx';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';
import { listarSolicitudes } from '../../services/solicitudesApi.js';

vi.mock('../../services/solicitudesApi.js', () => ({
  listarSolicitudes: vi.fn(),
}));

describe('AnalistaSolicitudes', () => {
  beforeEach(() => {
    listarSolicitudes.mockReset();
    listarSolicitudes.mockResolvedValue({ ok: true, solicitudes: [] });
  });

  it('filtra por estado sin solicitudes y permite crear una nueva', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter future={FUTURO_ROUTER}>
        <AnalistaSolicitudes />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Solicitudes de evaluacion/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Pendiente/i }));
    expect(screen.getByRole('link', { name: /Nueva solicitud/i })).toHaveAttribute('href', '/analista/nueva-solicitud');
  });
});
