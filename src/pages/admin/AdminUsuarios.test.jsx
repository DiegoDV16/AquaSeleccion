import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminUsuarios from './AdminUsuarios.jsx';
import { AuthContext } from '../../context/AuthContext.js';
import { FUTURO_ROUTER } from '../../routes/futuroRouter.js';
import { listarUsuarios } from '../../services/usuariosApi.js';

vi.mock('../../services/usuariosApi.js', () => ({
  listarUsuarios: vi.fn(),
  crearUsuario: vi.fn(),
  actualizarUsuario: vi.fn(),
  eliminarUsuario: vi.fn(),
}));

const USUARIOS = [
  {
    id: 1,
    nombre: 'Administrador Demo',
    correo: 'admin@example.cl',
    rol_id: 'administrador',
    rol_nombre: 'Administrador',
    estado: 'activo',
  },
];

describe('AdminUsuarios con perfil Jefatura', () => {
  beforeEach(() => {
    listarUsuarios.mockReset();
    listarUsuarios.mockResolvedValue({ ok: true, usuarios: USUARIOS });
  });

  it('muestra los usuarios sin acciones de escritura', async () => {
    render(
      <AuthContext.Provider value={{ rolActivo: 'jefatura', usuario: { id: 5 } }}>
        <MemoryRouter future={FUTURO_ROUTER}>
          <AdminUsuarios />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(await screen.findByText('Administrador Demo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nuevo usuario/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Editar usuario/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Eliminar usuario/ })).not.toBeInTheDocument();
  });
});
