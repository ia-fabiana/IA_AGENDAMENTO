import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ✅ CORREÇÃO: Configurar proxy para Evolution API
  server: {
    proxy: {
      '/evolution-api': {
        target: process.env.VITE_EVOLUTION_API_URL || 'http://95.217.232.92:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/evolution-api/, ''),
        secure: false,
      }
    }
  },
  
  // ✅ Configuração adicional para produção
  preview: {
    proxy: {
      '/evolution-api': {
        target: process.env.VITE_EVOLUTION_API_URL || 'http://95.217.232.92:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/evolution-api/, ''),
        secure: false,
      }
    }
  }
});
