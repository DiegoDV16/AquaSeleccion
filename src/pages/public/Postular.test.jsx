import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Postular from './Postular.jsx';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';

const FAMILIAS = [
  {
    id: 1,
    nombre: 'Personas',
    cargos: [{ id: 1, nombre: 'Analista de Personas' }],
  },
];

function renderizarPostulacion() {
  return render(
    <MemoryRouter future={FUTURO_ROUTER}>
      <Postular />
    </MemoryRouter>
  );
}

describe('Postular: validacion del formulario', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra errores cuando se envia sin datos obligatorios', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, familias: FAMILIAS }),
    });

    const { container } = renderizarPostulacion();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Personas' })).toBeInTheDocument();
    });

    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByText('Ingresa tus nombres.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu apellido paterno.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa un correo valido.')).toBeInTheDocument();
    expect(screen.getByText('Adjunta tu currículum en formato PDF o Word.')).toBeInTheDocument();
  });

  it('carga las familias y cargos desde el endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, familias: FAMILIAS }),
    });

    renderizarPostulacion();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Personas' })).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('c_listaCargosDisponibles.php'),
      expect.any(Object)
    );
  });
});
