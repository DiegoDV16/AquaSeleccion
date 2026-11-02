import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthContext } from '../context/AuthContext.js';
import RutaProtegida from './RutaProtegida.jsx';
import { FUTURO_ROUTER } from './futuroRouter.js';

function renderizarRuta(valorAuth, roles = ['administrador']) {
  return render(
    <AuthContext.Provider value={valorAuth}>
      <MemoryRouter initialEntries={['/admin/dashboard']} future={FUTURO_ROUTER}>
        <Routes>
          <Route path="/login" element={<p>Pantalla de login</p>} />
          <Route path="/sin-permisos" element={<p>Pantalla sin permisos</p>} />
          <Route
            path="/admin/dashboard"
            element={
              <RutaProtegida rolesPermitidos={roles}>
                <p>Contenido protegido</p>
              </RutaProtegida>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('RutaProtegida', () => {
  it('muestra un indicador mientras se restaura la sesion', () => {
    renderizarRuta({ autenticado: false, rolActivo: null, cargando: true });

    expect(screen.getByText('Restaurando sesión...')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('redirige a login cuando no hay sesion', () => {
    renderizarRuta({ autenticado: false, rolActivo: null, cargando: false });

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('redirige a sin-permisos cuando el rol no esta autorizado', () => {
    renderizarRuta({ autenticado: true, rolActivo: 'analista', cargando: false });

    expect(screen.getByText('Pantalla sin permisos')).toBeInTheDocument();
  });

  it('muestra el contenido cuando el rol esta autorizado', () => {
    renderizarRuta({ autenticado: true, rolActivo: 'administrador', cargando: false });

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});
