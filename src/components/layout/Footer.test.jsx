import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import Footer from './Footer.jsx';

function renderizarFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe('Footer', () => {
  it('muestra el año actual en el copyright', () => {
    renderizarFooter();

    expect(screen.getByText(/AquaChile S\.A\./)).toHaveTextContent(String(new Date().getFullYear()));
  });

  it('muestra la version del MVP', () => {
    renderizarFooter();

    expect(screen.getByText('v0.1.0 (MVP)')).toBeInTheDocument();
  });

  it('enlaza a la postulacion publica', () => {
    renderizarFooter();

    expect(screen.getByRole('link', { name: 'Postular' })).toHaveAttribute('href', '/postular');
  });
});
