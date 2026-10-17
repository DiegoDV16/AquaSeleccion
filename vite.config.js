import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      // Redirige las llamadas de autenticacion al backend PHP servido por XAMPP.
      // El proyecto vive en htdocs/AquaSeleccion, por eso el target incluye ese prefijo.
      '/backend': {
        target: 'http://localhost/AquaSeleccion',
        changeOrigin: true,
      },
    },
  },
});
