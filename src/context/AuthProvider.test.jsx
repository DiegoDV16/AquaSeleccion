import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from './AuthProvider.jsx';
import { useAuth } from './AuthContext.js';
import { cerrarSesion, iniciarSesion, sesionActual } from '../services/authApi.js';

vi.mock('../services/authApi.js', () => ({
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
  sesionActual: vi.fn(),
}));

const usuarioAnalista = {
  id: 4,
  nombre: 'Maria Jose Rojas',
  correo: 'mariajose.rojas@aquachile.cl',
  rol_id: 'analista',
};

let auth;

function Espia() {
  auth = useAuth();
  return null;
}

async function renderizarYEsperar() {
  render(
    <AuthProvider>
      <Espia />
    </AuthProvider>,
  );
  await waitFor(() => expect(auth.cargando).toBe(false));
}

beforeEach(() => {
  vi.clearAllMocks();
  auth = null;
  sesionActual.mockResolvedValue({ ok: true, autenticado: false });
});

describe('AuthProvider: restaurar sesion', () => {
  it('empieza cargando y termina al consultar la sesion', async () => {
    render(
      <AuthProvider>
        <Espia />
      </AuthProvider>,
    );

    expect(auth.cargando).toBe(true);
    await waitFor(() => expect(auth.cargando).toBe(false));
  });

  it('restaura el usuario cuando hay sesion activa', async () => {
    sesionActual.mockResolvedValue({ ok: true, autenticado: true, usuario: usuarioAnalista });

    await renderizarYEsperar();

    expect(auth.autenticado).toBe(true);
    expect(auth.rolActivo).toBe('analista');
    expect(auth.rol.nombre).toBe('Analista de Reclutamiento');
  });

  it('queda sin sesion cuando el servidor no tiene una activa', async () => {
    await renderizarYEsperar();

    expect(auth.autenticado).toBe(false);
    expect(auth.usuario).toBeNull();
  });
});

describe('AuthProvider: login', () => {
  it('rechaza el login sin correo o contrasena sin llamar al backend', async () => {
    await renderizarYEsperar();

    let resultado;
    await act(async () => {
      resultado = await auth.login({ correo: '', clave: '' });
    });

    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toBe('Ingresa tu correo institucional y contrasena.');
    expect(iniciarSesion).not.toHaveBeenCalled();
  });

  it('muestra el mensaje del backend cuando las credenciales son incorrectas', async () => {
    iniciarSesion.mockResolvedValue({ ok: false, mensaje: 'La contrasena es incorrecta.' });
    await renderizarYEsperar();

    let resultado;
    await act(async () => {
      resultado = await auth.login({ correo: 'mariajose.rojas@aquachile.cl', clave: 'mala' });
    });

    expect(resultado).toEqual({ ok: false, mensaje: 'La contrasena es incorrecta.' });
    expect(auth.autenticado).toBe(false);
  });

  it('inicia sesion con el correo sin espacios y devuelve el rol', async () => {
    iniciarSesion.mockResolvedValue({ ok: true, usuario: usuarioAnalista });
    await renderizarYEsperar();

    let resultado;
    await act(async () => {
      resultado = await auth.login({ correo: '  mariajose.rojas@aquachile.cl ', clave: 'Vicente2026' });
    });

    expect(iniciarSesion).toHaveBeenCalledWith({
      correo: 'mariajose.rojas@aquachile.cl',
      contrasena: 'Vicente2026',
    });
    expect(resultado.ok).toBe(true);
    expect(resultado.rol.clave).toBe('analista');
    expect(auth.autenticado).toBe(true);
    expect(auth.usuario).toEqual(usuarioAnalista);
  });
});

describe('AuthProvider: logout', () => {
  it('cierra la sesion en el servidor y limpia el usuario', async () => {
    iniciarSesion.mockResolvedValue({ ok: true, usuario: usuarioAnalista });
    cerrarSesion.mockResolvedValue({ ok: true });
    await renderizarYEsperar();

    await act(async () => {
      await auth.login({ correo: 'mariajose.rojas@aquachile.cl', clave: 'Vicente2026' });
    });
    await act(async () => {
      await auth.logout();
    });

    expect(cerrarSesion).toHaveBeenCalledTimes(1);
    expect(auth.autenticado).toBe(false);
    expect(auth.usuario).toBeNull();
  });
});
