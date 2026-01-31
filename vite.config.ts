import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
    const supabaseUrl = env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';
    const evolutionApiUrl = env.VITE_EVOLUTION_API_URL || '';
    const evolutionApiKey = env.VITE_EVOLUTION_API_KEY || '';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(geminiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
        'process.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
        'process.env.VITE_EVOLUTION_API_URL': JSON.stringify(evolutionApiUrl),
        'process.env.VITE_EVOLUTION_API_KEY': JSON.stringify(evolutionApiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
