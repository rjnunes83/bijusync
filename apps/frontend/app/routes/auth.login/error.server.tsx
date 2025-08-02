// apps/frontend/app/routes/auth.login/error.server.tsx

import type { LoginError } from "@shopify/shopify-app-remix/server";
import { LoginErrorType } from "@shopify/shopify-app-remix/server";

/**
 * Formato padronizado dos erros de login
 */
export interface LoginErrorMessage {
  shop?: string;     // Erro específico no domínio da loja
  global?: string;   // Erro geral (não relacionado a campo)
}

// Dicionário de mensagens multilíngue, preparado para expansão
const messages = {
  en: {
    missingShop: "Please enter your shop domain to log in.",
    invalidShop: "Please enter a valid shop domain to log in.",
    unknown: "An unknown error occurred. Please try again or contact support.",
  },
  "pt-BR": {
    missingShop: "Por favor, insira o domínio da sua loja para entrar.",
    invalidShop: "Por favor, insira um domínio de loja válido para entrar.",
    unknown: "Ocorreu um erro desconhecido. Tente novamente ou contate o suporte.",
  },
  // Futuros idiomas:
  // es: { ... }
} as const;

type LocaleType = keyof typeof messages;

/**
 * Gera mensagem amigável de erro de login conforme locale, shape seguro.
 * @param loginErrors Erros retornados pelo Shopify Remix
 * @param locale "en" | "pt-BR" (default: "en")
 */
export function loginErrorMessage(
  loginErrors: LoginError,
  locale: LocaleType = "en"
): LoginErrorMessage {
  // Fallback seguro (sempre retorna objeto, nunca vazio)
  if (!loginErrors) return { global: messages[locale]?.unknown ?? messages["en"].unknown };

  // Dicionário multilíngue seguro
  const dict = messages[locale] ?? messages["en"];

  switch (loginErrors.shop) {
    case LoginErrorType.MissingShop:
      return { shop: dict.missingShop };
    case LoginErrorType.InvalidShop:
      return { shop: dict.invalidShop };
    default:
      if (loginErrors.shop) {
        return { global: dict.unknown };
      }
      // Sem erro: shape consistente
      return {};
  }
}