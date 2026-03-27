import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/nat': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nat/, ''),
      },
      '/api/isw': {
        target: 'https://qa.interswitchng.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/isw/, ''),
      },
      '/api/isw-routing': {
        target: 'https://api-marketplace-routing.k8.isw.la',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/isw-routing/, ''),
      },
      '/api/isw-sandbox': {
        target: 'https://sandbox.interswitchng.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/isw-sandbox/, ''),
      },
      '/api/backend': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/backend/, ''),
      },

    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
