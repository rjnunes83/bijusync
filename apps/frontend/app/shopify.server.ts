// apps/frontend/app/shopify.server.ts

import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { SequelizeSessionStorage } from "./services/sequelizeSessionStorage.server";

/**
 * Enterprise: Validação robusta das variáveis de ambiente essenciais.
 */
const requiredEnv = [
  "SHOPIFY_API_KEY",
  "SHOPIFY_API_SECRET",
  "SHOPIFY_APP_URL",
  "SCOPES"
];
for (const env of requiredEnv) {
  if (!process.env[env]) {
    throw new Error(
      `[shopify.server.ts] Missing required environment variable: ${env}`
    );
  }
}

/**
 * Enterprise: Instancia a app Shopify, já pronta para App Store/Public App,
 * suporta sessão via banco (Sequelize), domínios customizados e feature flags v13+.
 */
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES!.split(","),
  appUrl: process.env.SHOPIFY_APP_URL!,
  authPathPrefix: "/auth",
  sessionStorage: new SequelizeSessionStorage(),
  distribution: "AppStore",
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;

// **Enterprise Export Pattern:** Sempre exporte helpers explicitamente para evitar erros de importação
export const admin = shopify.admin;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;