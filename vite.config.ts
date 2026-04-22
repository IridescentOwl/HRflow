import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    // Adding comment to force Vite PostCSS hard-reboot
    plugins: [react()],
})
