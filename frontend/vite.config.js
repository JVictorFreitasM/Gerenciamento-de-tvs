import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// OS 12-C, secao 3.2: porta propria (5002), sem colidir com o backend
// (5001), IdP (3000), Bot (3001/5173/5174) nem Farol. Alvo do proxy lido de
// VITE_BACKEND_URL (frontend/.env), sem valor fixo no arquivo.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5001';

  return {
    plugins: [react()],
    server: {
      port: 5002,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
