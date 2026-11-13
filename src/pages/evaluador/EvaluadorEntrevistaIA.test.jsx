import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EvaluadorEntrevistaIA from './EvaluadorEntrevistaIA.jsx';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';
import { abrirEntrevista, guardarEntrevista } from '../../services/entrevistasApi.js';

vi.mock('../../services/entrevistasApi.js', () => ({
  abrirEntrevista: vi.fn(),
  guardarEntrevista: vi.fn(),
  generarDocumentoEntrevista: vi.fn(),
}));

function renderizarEntrevista() {
  return render(
    <MemoryRouter initialEntries={['/evaluador/entrevista/2']} future={FUTURO_ROUTER}>
      <Routes>
        <Route path="/evaluador/entrevista/:id" element={<EvaluadorEntrevistaIA />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EvaluadorEntrevistaIA', () => {
  beforeEach(() => {
    abrirEntrevista.mockReset();
    guardarEntrevista.mockReset();
    abrirEntrevista.mockResolvedValue({
      ok: true,
      solicitud: {
        idSolicitud: 2,
        idCandidato: 3,
        candidato: 'Camila Entrevista Demo',
        cargo: 'Asistente Social Faena',
        estado: 'pendiente',
      },
      entrevista: {
        idEntrevista: 1,
        consentimiento: false,
        transcripcion: '',
        documento: '',
        estado: 'en_curso',
      },
    });
    guardarEntrevista.mockResolvedValue({
      ok: true,
      mensaje: 'Entrevista guardada correctamente.',
    });
  });

  it('carga la solicitud y muestra el formulario de entrevista', async () => {
    renderizarEntrevista();

    expect(await screen.findByText('Camila Entrevista Demo')).toBeInTheDocument();
    expect(screen.getByLabelText(/El postulante autorizó/)).not.toBeChecked();
    expect(screen.getByLabelText('Transcripción de la entrevista')).toBeInTheDocument();
  });

  it('guarda la transcripción de la entrevista', async () => {
    const user = userEvent.setup();
    renderizarEntrevista();

    await screen.findByText('Camila Entrevista Demo');
    await user.click(screen.getByLabelText(/El postulante autorizó/));
    await user.type(
      screen.getByLabelText('Transcripción de la entrevista'),
      'Experiencia en atención de personas y trabajo en equipo.'
    );
    await user.click(screen.getByRole('button', { name: 'Guardar transcripción' }));

    await waitFor(() => {
      expect(guardarEntrevista).toHaveBeenCalledWith(
        expect.objectContaining({
          idSolicitud: '2',
          consentimiento: '1',
          transcripcion: 'Experiencia en atención de personas y trabajo en equipo.',
        })
      );
    });
  });
});
