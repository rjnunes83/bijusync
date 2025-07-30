import type { LoginError } from "@shopify/shopify-app-remix/server";
import { LoginErrorType } from "@shopify/shopify-app-remix/server";

interface LoginErrorMessage {
  shop?: string;
  general?: string;
}

// Mensagens podem ser facilmente adaptadas para multilíngue se necessário
const messages = {
  en: {
    missingShop: "Please enter your shop domain to log in",
    invalidShop: "Please enter a valid shop domain to log in",
    unknown: "An unknown error occurred. Please try again or contact support.",
  },
  // pt: {
  //   missingShop: "Por favor, insira o domínio da sua loja para entrar",
  //   invalidShop: "Por favor, insira um domínio de loja válido para entrar",
  //   unknown: "Ocorreu um erro desconhecido. Tente novamente ou contate o suporte.",
  // },
};

export function loginErrorMessage(loginErrors: LoginError, locale: keyof typeof messages = "en"): LoginErrorMessage {
  if (!loginErrors) return {};

  switch (loginErrors.shop) {
    case LoginErrorType.MissingShop:
      return { shop: messages[locale].missingShop };
    case LoginErrorType.InvalidShop:
      return { shop: messages[locale].invalidShop };
    default:
      if (loginErrors.shop) {
        return { general: messages[locale].unknown };
      }
      return {};
  }
}
