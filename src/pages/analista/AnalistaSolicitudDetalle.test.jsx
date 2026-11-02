import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AnalistaSolicitudDetalle from './AnalistaSolicitudDetalle.jsx';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';
import { obtenerSolicitud } from '../../services/solicitudesApi.js';

vi.mock('../../services/solicitudesApi.js', () => ({
  obtenerSolicitud: vi.fn(),
}));

vi.mock('../../services/candidatosApi.js', () => ({
  descargarCv: vi.fn(),
}));

describe('AnalistaSolicitudDetalle', () => {
  beforeEach(() => {
    obtenerSolicitud.mockReset();
    obtenerSolicitud.mockResolvedValue({ ok: false, mensaje: 'Solicitud no encontrada.' });
  });

  it('muestra el estado de solicitud no disponible y permite volver', async () => {
    render(
      <MemoryRouter initialEntries={['/analista/solicitudes/99']} future={FUTURO_ROUTER}>
        <Routes>
          <Route path="/analista/solicitudes/:id" element={<AnalistaSolicitudDetalle />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Solicitud no disponible')).toBeInTheDocument();
    expect(screen.getByText('Solicitud no encontrada.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver a solicitudes/i })).toHaveAttribute('href', '/analista/solicitudes');
  });
});
