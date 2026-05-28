import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,  // Change to 3000 to match docker
    host: true,  // گوش دادن به همه آدرس‌ها
    allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0'],
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
      overlay: false,  // غیرفعال کردن overlay خطاها در مرورگر
      clientPort: 3000,
    },
    proxy: {
      '/api': {
        target: 'http://backend:8000',  // Use service name in docker
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      }
    },
    watch: {
      usePolling: true,  // Set to true for Docker
      interval: 1000,
    }
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['recharts', 'react-icons'],
          'axios-vendor': ['axios'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'recharts', 'react-icons'],
    exclude: []
  },
  css: {
    devSourcemap: false,
    modules: {
      localsConvention: 'camelCase'
    }
  },
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
  }
})