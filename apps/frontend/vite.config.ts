// apps/frontend/vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Vite config Enterprise-ready para Remix + Shopify Polaris v13+
 * - Paths absolutos, DX top
 * - Pronto para SaaS global: build otimizado, fácil debug e expansão
 * - Zero hacks de JSON, pronto para produção
 */

export default defineConfig({
  plugins: [
    remix(),
    tsconfigPaths(),
    // Adicione plugins de análise, compressão, etc. aqui no futuro!
    // ex: viteCompression(), visualizer(), sentryVitePlugin(), etc.
  ],
  build: {
    outDir: "build/client",         // Define saída clara do build
    assetsDir: "assets",            // Mantém assets organizados
    target: "esnext",               // JS moderno para melhor performance
    sourcemap: true,                // Facilita debug em produção (desative se não quiser)
  },
  resolve: {
    alias: {
      // Atalho para internacionalização (opcional, só se for usar!)
      "@locales": "/app/locales",
      // Adicione outros atalhos aqui se necessário
    },
  },
  server: {
    strictPort: true,               // Garante erro claro se porta já estiver em uso
    port: 5173,                     // Padrão do Remix, mude se necessário
    open: false,                    // Evita abrir browser automaticamente (opcional)
  },
});