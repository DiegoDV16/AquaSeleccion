import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext } from '../../context/AuthContext.js';
import Sidebar from './Sidebar.jsx';

function renderizarSidebar({ rolActivo = null, usuario = null, colapsado = false, onToggleColapsado = vi.fn() } = {}) {
  return render(
    <AuthContext.Provider value={{ rolActivo, usuario }}>
      <MemoryRouter>
        <Sidebar colapsado={colapsado} abierto={false} onNavegar={vi.fn()} onToggleColapsado={onToggleColapsado} />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

const analista = { rolActivo: 'analista', usuario: { id: 4 } };
const evaluador = { rolActivo: 'evaluador', usuario: { id: 8 } };
const administrador = { rolActivo: 'administrador', usuario: { id: 1 } };

describe('Sidebar: items por rol', () => {
  it('el analista ve sus modulos y no los del administrador', () => {
    renderizarSidebar(analista);

    expect(screen.getByRole('link', { name: 'Candidatos' })).toHaveAttribute('href', '/analista/candidatos');
    expect(screen.getByRole('link', { name: 'Nueva solicitud' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('el administrador ve sus modulos y no los del analista', () => {
    renderizarSidebar(administrador);

    expect(screen.getByRole('link', { name: 'Usuarios del sistema' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Nueva solicitud' })).not.toBeInTheDocument();
  });

  it('sin rol activo no muestra ningun item', () => {
    renderizarSidebar({ rolActivo: null, usuario: null });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('Sidebar: contadores', () => {
  it('el analista ve el total de solicitudes pendientes', () => {
    renderizarSidebar(analista);

    const enlace = screen.getByRole('link', { name: 'Solicitudes' });
    expect(within(enlace).getByText('5')).toBeInTheDocument();
  });

  it('el evaluador ve solo sus solicitudes pendientes', () => {
    renderizarSidebar(evaluador);

    const enlace = screen.getByRole('link', { name: 'Mis solicitudes' });
    expect(within(enlace).getByText('2')).toBeInTheDocument();
  });

  it('un item sin contador no muestra badge', () => {
    renderizarSidebar(analista);

    const enlace = screen.getByRole('link', { name: 'Candidatos' });
    expect(enlace.querySelector('.badge')).toBeNull();
  });
});

describe('Sidebar: plegado', () => {
  it('el boton ofrece plegar cuando esta desplegado y llama al handler', () => {
    const onToggleColapsado = vi.fn();
    renderizarSidebar({ ...analista, onToggleColapsado });

    const boton = screen.getByRole('button', { name: 'Plegar menu lateral' });
    boton.click();

    expect(onToggleColapsado).toHaveBeenCalledTimes(1);
  });

  it('cuando esta plegado ofrece expandir y cada enlace tiene tooltip', () => {
    renderizarSidebar({ ...analista, colapsado: true });

    expect(screen.getByRole('button', { name: 'Expandir menu lateral' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Candidatos' })).toHaveAttribute('data-tooltip', 'Candidatos');
  });

  it('cuando esta desplegado no agrega tooltip', () => {
    renderizarSidebar(analista);

    expect(screen.getByRole('link', { name: 'Candidatos' })).not.toHaveAttribute('data-tooltip');
  });
});
