import { afterEach, describe, expect, it, vi } from 'vitest';

import { peticionFormulario, peticionJson } from './http.js';

describe('http: proteccion CSRF', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it('guarda el token de la sesion y lo envia en la siguiente mutacion', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        json: async () => ({ ok: true, csrfToken: 'token-prueba' }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ ok: true }),
      });

    await peticionJson('backend/api/auth/session.php', { method: 'GET' });
    await peticionFormulario('backend/api/solicitudes/crear.php', { idCandidato: 1 });

    const opciones = fetchMock.mock.calls[1][1];

    expect(opciones.headers['X-CSRF-Token']).toBe('token-prueba');
  });
});
