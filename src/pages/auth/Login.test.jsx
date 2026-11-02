import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Login from './Login.jsx';
import { AuthContext } from '../../context/AuthContext.js';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';

function renderizarLogin(valorAuth) {
  return render(
    <AuthContext.Provider value={valorAuth}>
      <MemoryRouter initialEntries={['/login']} future={FUTURO_ROUTER}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<p>Panel administrador</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('Login', () => {
  const login = vi.fn();

  beforeEach(() => {
    login.mockReset();
  });

  it('valida credenciales y redirige segun el rol devuelto', async () => {
    const user = userEvent.setup();
    login.mockResolvedValue({ ok: true, rol: { rutaInicio: '/admin/dashboard' } });
    renderizarLogin({ login, autenticado: false, cargando: false, rol: null });

    await user.type(screen.getByLabelText(/Correo institucional/i), 'admin@aquachile.cl');
    await user.type(screen.getByLabelText(/^Contraseña/i), 'secreto');
    await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ correo: 'admin@aquachile.cl', clave: 'secreto' });
      expect(screen.getByText('Panel administrador')).toBeInTheDocument();
    });
  });

  it('muestra el mensaje cuando las credenciales son rechazadas', async () => {
    const user = userEvent.setup();
    login.mockResolvedValue({ ok: false, mensaje: 'Usuario o contraseña incorrectos.' });
    renderizarLogin({ login, autenticado: false, cargando: false, rol: null });

    await user.type(screen.getByLabelText(/Correo institucional/i), 'admin@aquachile.cl');
    await user.type(screen.getByLabelText(/^Contraseña/i), 'incorrecta');
    await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.');
  });
});
