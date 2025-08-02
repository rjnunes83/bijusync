/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />

// Tipagem explícita das variáveis de ambiente expostas no frontend
interface ImportMetaEnv {
  readonly VITE_SHOPIFY_APP_URL: string;
  readonly VITE_PUBLIC_APP_CLIENT_ID: string;
  // Adicione aqui outras envs públicas utilizadas no frontend
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
