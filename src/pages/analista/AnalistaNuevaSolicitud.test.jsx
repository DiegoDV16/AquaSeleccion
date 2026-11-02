import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AnalistaNuevaSolicitud from './AnalistaNuevaSolicitud.jsx';
import { AuthContext } from '../../context/AuthContext.js';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';
import { listarCandidatos } from '../../services/candidatosApi.js';
import { crearSolicitud, listarEvaluadores } from '../../services/solicitudesApi.js';

vi.mock('../../services/candidatosApi.js', () => ({
  listarCandidatos: vi.fn(),
}));

vi.mock('../../services/solicitudesApi.js', () => ({
  crearSolicitud: vi.fn(),
  listarEvaluadores: vi.fn(),
}));

const CANDIDATOS = [
  {
    id: 12,
    nombreCompleto: 'Camila Rojas Pérez',
    cargo: 'Analista de Personas',
    estado: 'pendiente',
    tieneSolicitudActiva: false,
  },
];

const EVALUADORES = [
  {
    id: 3,
    nombre: 'Rodrigo Salazar',
    correo: 'rodrigo.salazar@aquachile.cl',
  },
];

function renderizarFormulario() {
  return render(
    <AuthContext.Provider value={{ usuario: { id: 1, nombre: 'Analista Demo' } }}>
      <MemoryRouter initialEntries={['/analista/nueva-solicitud']} future={FUTURO_ROUTER}>
        <AnalistaNuevaSolicitud />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('AnalistaNuevaSolicitud', () => {
  beforeEach(() => {
    listarCandidatos.mockReset();
    listarEvaluadores.mockReset();
    crearSolicitud.mockReset();
    listarCandidatos.mockResolvedValue({ ok: true, candidatos: CANDIDATOS });
    listarEvaluadores.mockResolvedValue({ ok: true, evaluadores: EVALUADORES });
    crearSolicitud.mockResolvedValue({ ok: true, idSolicitud: 99 });
  });

  it('valida candidato y evaluador obligatorios', async () => {
    const user = userEvent.setup();
    renderizarFormulario();

    await screen.findByRole('option', { name: /Camila Rojas Pérez/ });
    await user.click(screen.getByRole('button', { name: /Crear solicitud/ }));

    expect(await screen.findByText('Selecciona el candidato a evaluar.')).toBeInTheDocument();
    expect(screen.getByText('Asigna un evaluador responsable.')).toBeInTheDocument();
    expect(crearSolicitud).not.toHaveBeenCalled();
  });

  it('envia la solicitud con candidato y evaluador seleccionados', async () => {
    const user = userEvent.setup();
    renderizarFormulario();

    await screen.findByRole('option', { name: /Camila Rojas Pérez/ });
    await user.selectOptions(screen.getByLabelText(/Candidato/), '12');
    await user.selectOptions(screen.getByLabelText(/Evaluador responsable/), '3');
    await user.click(screen.getByRole('button', { name: /Crear solicitud/ }));

    await waitFor(() => {
      expect(crearSolicitud).toHaveBeenCalledWith(
        expect.objectContaining({
          idCandidato: 12,
          idEvaluador: 3,
          prioridad: 'normal',
        })
      );
    });
  });
});
