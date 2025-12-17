import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  // Base path pour GitHub Pages - correspond au nom du repository
  // Utilise HashRouter donc le base path n'est pas critique, mais on le garde pour les assets
  base: '/EasyBuisnessTask/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})

