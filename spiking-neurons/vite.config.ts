import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/CSIM-30860/spiking-neurons/',
  plugins: [react()],
})
