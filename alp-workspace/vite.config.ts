import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components/ui': resolve(__dirname, './src/lib/registry/new-york/ui')
    }
  },
  server: {
    port: 8080,
    host: true
  }
})