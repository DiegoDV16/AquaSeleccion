import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext } from '../../context/AuthContext.js';
import { obtenerRol } from '../../mock/catalogoRoles.js';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';
import Navbar from './Navbar.jsx';

const usuario = {
  id: 4,
  nombre: 'Maria Jose Rojas',
  correo: 'mariajose.rojas@aquachile.cl',
  unidad: 'Personas / Reclutamiento',
  estado: 'activo',
};

function renderizarNavbar({ logout = vi.fn(), rol = obtenerRol('analista') } = {}) {
  return render(
    <AuthContext.Provider value={{ usuario, rol, logout }}>
      <MemoryRouter initialEntries={['/analista/candidatos']} future={FUTURO_ROUTER}>
        <Routes>
          <Route path="/analista/candidatos" element={<Navbar sidebarAbierto={false} onToggleSidebar={vi.fn()} />} />
          <Route path="/login" element={<p>Pantalla login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('Navbar', () => {
  it('muestra el modulo asignado al rol', () => {
    renderizarNavbar();

    expect(screen.getByText('Analista de Reclutamiento')).toBeInTheDocument();
  });

  it('la marca lleva al modulo de inicio del rol', () => {
    renderizarNavbar();

    expect(screen.getByRole('link', { name: /AquaSeleccion/ })).toHaveAttribute('href', '/analista/candidatos');
  });

  it('el menu de usuario esta cerrado al inicio', () => {
    renderizarNavbar();

    expect(screen.queryByText('Cerrar sesion')).not.toBeInTheDocument();
  });

  it('al abrir el menu muestra correo, modulo y acciones', () => {
    renderizarNavbar();

    fireEvent.click(screen.getByRole('button', { name: /Maria Jose Rojas/ }));

    expect(screen.getByText('mariajose.rojas@aquachile.cl')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir a mi modulo/ })).toHaveAttribute('href', '/analista/candidatos');
    expect(screen.getByText('Cerrar sesion')).toBeInTheDocument();
  });

  it('cerrar sesion llama a logout y lleva a login', () => {
    const logout = vi.fn();
    renderizarNavbar({ logout });

    fireEvent.click(screen.getByRole('button', { name: /Maria Jose Rojas/ }));
    fireEvent.click(screen.getByText('Cerrar sesion'));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Pantalla login')).toBeInTheDocument();
  });
});
