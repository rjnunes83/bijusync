// apps/frontend/vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Vite config padrão ouro para apps Remix + Polaris 13+
 * Sem hacks de JSON, pronto para produção enterprise
 */
export default defineConfig({
  plugins: [
    remix(),
    tsconfigPaths(),
  ],
  // Adicione configs extras conforme o crescimento do projeto
  // ex: server, build, define, etc.
});