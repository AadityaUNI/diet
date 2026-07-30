import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), 
    VitePWA({
      manifest: {
        display: "standalone",
        prefer_related_applications: false,
        short_name: "dietgrid",
        start_url: "/",
        icons: [
          {
            src: "512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
          ,
          {
            src: "192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})