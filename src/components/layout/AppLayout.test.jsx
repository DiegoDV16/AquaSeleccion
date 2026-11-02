import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext } from '../../context/AuthContext.js';
import { obtenerRol } from '../../mock/catalogoRoles.js';
import AppLayout from './AppLayout.jsx';

function renderizarLayout({ cargando = false, autenticado = true } = {}) {
  const rol = autenticado ? obtenerRol('analista') : null;
  const valor = {
    cargando,
    autenticado,
    usuario: autenticado ? { id: 4, nombre: 'Maria Jose Rojas', correo: 'mariajose.rojas@aquachile.cl', estado: 'activo' } : null,
    rolActivo: autenticado ? 'analista' : null,
    rol,
    logout: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={valor}>
      <MemoryRouter initialEntries={['/analista/candidatos']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/analista/candidatos" element={<p>Vista interna</p>} />
          </Route>
          <Route path="/login" element={<p>Pantalla login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('AppLayout: estados de sesion', () => {
  it('muestra el indicador mientras se restaura la sesion', () => {
    renderizarLayout({ cargando: true });

    expect(screen.getByText('Restaurando sesion...')).toBeInTheDocument();
    expect(screen.queryByText('Vista interna')).not.toBeInTheDocument();
  });

  it('sin sesion muestra solo la vista, sin navbar ni sidebar', () => {
    renderizarLayout({ autenticado: false });

    expect(screen.getByText('Vista interna')).toBeInTheDocument();
    expect(screen.queryByText('AquaSeleccion')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Plegar menu lateral' })).not.toBeInTheDocument();
  });

  it('con sesion muestra navbar, sidebar, vista y footer', () => {
    renderizarLayout();

    expect(screen.getByText('AquaSeleccion')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Candidatos' })).toBeInTheDocument();
    expect(screen.getByText('Vista interna')).toBeInTheDocument();
    expect(screen.getByText('v0.1.0 (MVP)')).toBeInTheDocument();
  });
});

describe('AppLayout: sidebar', () => {
  it('plegar el sidebar agrega la clase collapsed', () => {
    const { container } = renderizarLayout();
    const sidebar = container.querySelector('aside');

    expect(sidebar).not.toHaveClass('collapsed');

    fireEvent.click(screen.getByRole('button', { name: 'Plegar menu lateral' }));

    expect(sidebar).toHaveClass('collapsed');
  });

  it('el boton de menu en movil abre el sidebar y muestra el fondo', () => {
    const { container } = renderizarLayout();
    const sidebar = container.querySelector('aside');

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar u ocultar menu de navegacion' }));

    expect(sidebar).toHaveClass('show');
    expect(container.querySelector('.offcanvas-backdrop')).not.toBeNull();
  });

  it('tocar el fondo cierra el sidebar', () => {
    const { container } = renderizarLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar u ocultar menu de navegacion' }));
    fireEvent.click(container.querySelector('.offcanvas-backdrop'));

    expect(container.querySelector('aside')).not.toHaveClass('show');
  });
});
