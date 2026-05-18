import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      'react-is': 'react-is'
    }
  },
  optimizeDeps: {
    include: ['react-is'],
    exclude: ['pdfjs-dist']
  },
  build: {
    commonjsOptions: {
      include: [/react-is/, /node_modules/]
    },
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        // Suppress specific warnings
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        // Use default handler for other warnings
        defaultHandler(warning);
      }
    },
    chunkSizeWarningLimit: 1500,
  },
  server: {
    port: 5176,
    proxy: {
      "/api": {
        target: "http://localhost:8082",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
