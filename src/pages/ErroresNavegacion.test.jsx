import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import NotFound from './NotFound.jsx';
import SinPermisos from './SinPermisos.jsx';
import { AuthContext } from '../context/AuthContext.js';
import { FUTURO_ROUTER } from '../routes/futuroRouter.js';

describe('Vistas de navegacion de error', () => {
  it('NotFound muestra la ruta solicitada y enlaces disponibles', () => {
    render(
      <MemoryRouter initialEntries={['/ruta-inexistente']} future={FUTURO_ROUTER}>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('/ruta-inexistente')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Iniciar sesión/i })).toBeInTheDocument();
  });

  it('SinPermisos informa el rol activo y permite volver al modulo', () => {
    render(
      <AuthContext.Provider value={{
        rol: { nombre: 'Analista de Reclutamiento', rutaInicio: '/analista/candidatos' },
        usuario: { nombre: 'Ana Pérez' },
      }}>
        <MemoryRouter
          initialEntries={[{ pathname: '/sin-permisos', state: { solicitado: '/admin/dashboard' } }]}
          future={FUTURO_ROUTER}
        >
          <SinPermisos />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Analista de Reclutamiento/i)).toBeInTheDocument();
    expect(screen.getByText('/admin/dashboard')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir a mi módulo/i })).toHaveAttribute('href', '/analista/candidatos');
  });
});
