import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";


// https://vite.dev/config/
export default defineConfig({

  plugins: [

    react(),

    VitePWA({

      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png"
      ],

      manifest: {

        name: "Café de Origen",

        short_name: "Café Origen",

        description:
          "Compra café colombiano de origen: Lavado, Honey Dorado y Honey Rojo.",

        theme_color: "#4b2e1f",

        background_color: "#ffffff",

        display: "standalone",

        orientation: "portrait",

        start_url: "/",

        icons: [

          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },

          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }

        ]

      }

    })

  ],


  server: {

    host: "0.0.0.0",

    port: 5173,

    strictPort: true

  }

});