import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminDashboard from './AdminDashboard.jsx';
import { AuthContext } from '../../context/AuthContext.js';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';
import { obtenerResumenAdmin } from '../../services/adminApi.js';

vi.mock('../../services/adminApi.js', () => ({
  obtenerResumenAdmin: vi.fn(),
}));

describe('AdminDashboard', () => {
  beforeEach(() => {
    obtenerResumenAdmin.mockReset();
    obtenerResumenAdmin.mockResolvedValue({
      ok: true,
      resumen: { externas: 3, internas: 2, pendientes: 1, en_proceso: 2, finalizadas: 2, total_candidatos: 5, solicitudes_total: 5 },
      porEstado: [],
      porFamilia: [],
      topCargos: [],
      porEvaluador: [],
      recientes: [],
      actividad: [],
    });
  });

  it('muestra las metricas principales con datos del resumen', async () => {
    render(
      <AuthContext.Provider value={{ usuario: { nombre: 'Admin Demo' }, rolActivo: 'administrador' }}>
        <MemoryRouter future={FUTURO_ROUTER}>
          <AdminDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(await screen.findByText('Postulaciones externas')).toBeInTheDocument();
    expect(screen.getByText('Postulaciones internas')).toBeInTheDocument();
    expect(screen.getAllByText('Evaluaciones finalizadas').length).toBeGreaterThan(0);
  });
});
