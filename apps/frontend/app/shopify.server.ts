import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import prisma from "./db.server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const sessionStorage = new PrismaSessionStorage(prisma, {
  sessionModel: "Session", // Case sensitive!
  schema: "public",        // Adicione isso!
});

// Checagem das principais variáveis de ambiente
if (
  !process.env.SHOPIFY_API_KEY ||
  !process.env.SHOPIFY_API_SECRET ||
  !process.env.SHOPIFY_APP_URL
) {
  throw new Error(
    "Missing one or more required Shopify ENV variables (SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL)"
  );
}

// Instancia o app Shopify com configuração correta do Prisma Session Storage
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL,
  authPathPrefix: "/auth",
  sessionStorage,
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;