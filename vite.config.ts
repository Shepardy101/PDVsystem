import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
          secure: false
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Separar bibliotecas por categoria para melhor cache
            if (id.includes('node_modules')) {
              // Core React (sempre necessário)
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              // Ícones Lucide (grande biblioteca de ícones)
              if (id.includes('lucide-react')) {
                return 'icons-vendor';
              }
              // Biblioteca de gráficos (usada em Reports)
              if (id.includes('recharts') || id.includes('victory') || id.includes('d3-')) {
                return 'charts-vendor';
              }
              // UI Components (Radix)
              if (id.includes('@radix-ui')) {
                return 'ui-vendor';
              }
              // Biblioteca de datas
              if (id.includes('date-fns')) {
                return 'date-vendor';
              }
              // Resto das dependências
              return 'vendor';
            }
          }
        }
      },
      // Otimizações adicionais
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
    }
  };
});
