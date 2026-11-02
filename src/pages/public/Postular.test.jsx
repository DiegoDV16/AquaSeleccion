import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Postular from './Postular.jsx';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';
import { crearPostulacionPublica } from '../../services/candidatosApi.js';

vi.mock('../../services/candidatosApi.js', () => ({
  crearPostulacionPublica: vi.fn(),
}));

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

async function completarFormulario() {
  fireEvent.change(screen.getByLabelText(/Nombres completos/), { target: { value: 'Camila' } });
  fireEvent.change(screen.getByLabelText(/Apellido paterno/), { target: { value: 'Rojas' } });
  fireEvent.change(screen.getByLabelText(/Apellido materno/), { target: { value: 'Pérez' } });
  fireEvent.change(screen.getByLabelText(/Correo electrónico/), {
    target: { value: 'camila.rojas@example.cl' },
  });
  fireEvent.change(screen.getByLabelText(/Teléfono móvil/), {
    target: { value: '+56912345678' },
  });

  fireEvent.change(screen.getByLabelText(/Familia de cargo/), { target: { value: '1' } });

  await waitFor(() => {
    expect(screen.getByRole('option', { name: 'Analista de Personas' })).toBeInTheDocument();
  });

  fireEvent.change(screen.getByLabelText(/Cargo al que postula/), { target: { value: '1' } });

  const archivo = new File(['%PDF-1.4 prueba'], 'cv.pdf', { type: 'application/pdf' });
  fireEvent.change(screen.getByLabelText(/Adjuntar Curriculum Vitae/), {
    target: { files: [archivo] },
  });
  fireEvent.click(screen.getByRole('checkbox', { name: /Autorizo/ }));
}

describe('Postular: validacion del formulario', () => {
  beforeEach(() => {
    crearPostulacionPublica.mockReset();
  });

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

  it('muestra el modal de éxito sin número de seguimiento', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, familias: FAMILIAS }),
    });
    crearPostulacionPublica.mockResolvedValue({
      ok: true,
      mensaje: 'Tu postulación fue enviada correctamente. El equipo de Personas revisará tus antecedentes.',
    });

    renderizarPostulacion();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Personas' })).toBeInTheDocument();
    });

    await completarFormulario();
    fireEvent.click(screen.getByRole('button', { name: /Enviar postulación/ }));

    expect(await screen.findByRole('heading', { name: 'Postulación enviada' })).toBeInTheDocument();
    expect(
      screen.getByText('Tu postulación fue enviada correctamente. El equipo de Personas revisará tus antecedentes.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/seguimiento/i)).not.toBeInTheDocument();
    expect(crearPostulacionPublica).toHaveBeenCalledWith(
      expect.objectContaining({
        correo: 'camila.rojas@example.cl',
        idCargo: '1',
        autorizacion: '1',
      })
    );
  });

  it('muestra el modal de error y conserva el formulario', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, familias: FAMILIAS }),
    });
    crearPostulacionPublica.mockResolvedValue({
      ok: false,
      mensaje: 'No se pudo registrar la postulación. Inténtalo nuevamente.',
    });

    renderizarPostulacion();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Personas' })).toBeInTheDocument();
    });

    await completarFormulario();
    fireEvent.click(screen.getByRole('button', { name: /Enviar postulación/ }));

    expect(await screen.findByRole('heading', { name: 'No pudimos enviar tu postulación' })).toBeInTheDocument();
    expect(
      screen.getByText('No se pudo registrar la postulación. Inténtalo nuevamente.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombres completos/)).toHaveValue('Camila');
  });
});
