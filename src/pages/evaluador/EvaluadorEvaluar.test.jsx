import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EvaluadorEvaluar from './EvaluadorEvaluar.jsx';
import { AuthContext } from '../../context/AuthContext.js';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';
import { guardarEvaluacion, obtenerMiSolicitud } from '../../services/solicitudesApi.js';

vi.mock('../../services/solicitudesApi.js', () => ({
  guardarEvaluacion: vi.fn(),
  obtenerMiSolicitud: vi.fn(),
}));

vi.mock('../../services/candidatosApi.js', () => ({
  descargarCv: vi.fn(),
}));

const SOLICITUD = {
  id: 1,
  estado: 'pendiente',
  fechaAsignacion: '2026-11-01',
  candidato: {
    nombreCompleto: 'Camila Rojas Pérez',
    nombres: 'Camila',
    apellidoPaterno: 'Rojas',
    apellidoMaterno: 'Pérez',
    correo: 'camila.rojas@example.cl',
    telefono: '+56912345678',
    cargo: 'Analista de Personas',
    familiaCargo: 'Personas',
    tipoPostulacion: 'externa',
    fechaPostulacion: '2026-10-30',
    cvArchivo: null,
  },
  evaluacion: null,
};

function renderizarEvaluacion() {
  return render(
    <AuthContext.Provider value={{ usuario: { id: 3, nombre: 'Rodrigo Salazar' } }}>
      <MemoryRouter initialEntries={['/evaluador/evaluar/1']} future={FUTURO_ROUTER}>
        <Routes>
          <Route path="/evaluador/evaluar/:id" element={<EvaluadorEvaluar />} />
          <Route path="/evaluador/mis-solicitudes" element={<p>Listado de solicitudes</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('EvaluadorEvaluar', () => {
  beforeEach(() => {
    guardarEvaluacion.mockReset();
    obtenerMiSolicitud.mockReset();
    obtenerMiSolicitud.mockResolvedValue({ ok: true, solicitud: SOLICITUD });
    guardarEvaluacion.mockResolvedValue({ ok: true, mensaje: 'Evaluación guardada.' });
  });

  it('valida resultado y observaciones antes de finalizar', async () => {
    const user = userEvent.setup();
    renderizarEvaluacion();

    await screen.findByRole('heading', { name: /Evaluación psicológica/ });
    await user.click(screen.getByRole('button', { name: /Finalizar evaluación/ }));

    expect(await screen.findByText('Selecciona el resultado de la evaluacion.')).toBeInTheDocument();
    expect(
      screen.getByText('Detalla las observaciones (minimo 20 caracteres).')
    ).toBeInTheDocument();
    expect(guardarEvaluacion).not.toHaveBeenCalled();
  });

  it('envía la evaluación finalizada con resultado y observaciones', async () => {
    const user = userEvent.setup();
    renderizarEvaluacion();

    await screen.findByRole('heading', { name: /Evaluación psicológica/ });
    await user.selectOptions(screen.getByLabelText(/Resultado/), 'apto');
    await user.type(
      screen.getByLabelText(/Observaciones psicolaborales/),
      'Cumple con las competencias requeridas para el cargo.'
    );
    await user.click(screen.getByRole('button', { name: /Finalizar evaluación/ }));

    await waitFor(() => {
      expect(guardarEvaluacion).toHaveBeenCalledWith(
        expect.objectContaining({
          idSolicitud: '1',
          accion: 'finalizar',
          resultado: 'apto',
          observaciones: 'Cumple con las competencias requeridas para el cargo.',
        })
      );
    });
  });
});
