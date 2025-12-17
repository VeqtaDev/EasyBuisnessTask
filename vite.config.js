import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  // Base path pour GitHub Pages - correspond au nom du repository
  base: process.env.NODE_ENV === 'production' ? '/EasyBuisnessTask/' : '/',
})

