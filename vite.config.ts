import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/cadence-2/',
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate CodeMirror into its own chunk
          'codemirror': [
            '@codemirror/state',
            '@codemirror/view',
            '@codemirror/language',
            '@uiw/react-codemirror',
          ],
          // Separate React into its own chunk
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
  },
})
