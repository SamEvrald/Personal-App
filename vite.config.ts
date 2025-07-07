import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { resolve } from 'path'; 

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: { // <-- ADD OR MODIFY THIS BUILD BLOCK
        outDir: 'dist', // Ensure this is 'dist'
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html') // <-- ADD THIS LINE
          }
        }
      }
}));
