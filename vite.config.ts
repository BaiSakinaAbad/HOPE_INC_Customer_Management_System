/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // Inject fake environment variables specifically to bypass the dev's safety check
    env: {
      VITE_SUPABASE_URL: 'https://fake-testing-url.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'fake-testing-anon-key'
    }
  },
})