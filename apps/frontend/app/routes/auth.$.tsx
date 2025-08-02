// apps/frontend/app/routes/auth.$.tsx

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Page,
  Card,
  Text,
  Spinner,
} from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import ptBR from "../locales/pt-BR.json";
import en from "../locales/en.json";
import { login } from "../shopify.server";

// Polaris styles para SSR (caso necessário)
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

/**
 * Detecta o idioma ideal (query, header, fallback)
 */
function detectLocale(request: Request): "pt-BR" | "en" {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang");
  if (lang === "en") return "en";
  if (lang === "pt-BR") return "pt-BR";
  const acceptLanguage = request.headers.get("accept-language") || "";
  if (acceptLanguage.includes("en")) return "en";
  return "pt-BR";
}

/**
 * Loader enterprise:
 * - Garante autenticação ou fallback
 * - Injeta traduções i18n corretas
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await login(request); // Executa lógica de login, se necessário
  const locale = detectLocale(request);
  const i18n = locale === "en" ? en : ptBR;
  return json({ locale, i18n });
};

/**
 * Rota universal para autenticação: sempre PolarisAppProvider + i18n.
 */
export default function AuthUniversal() {
  const { locale, i18n } = useLoaderData<typeof loader>();

  return (
    <PolarisAppProvider i18n={i18n}>
      <Page>
        <Card>
          <Text as="h1" variant="headingLg">
            {locale === "en" ? "Authenticating..." : "A ser autenticado..."}
          </Text>
          <Text as="p" color="subdued">
            {locale === "en"
              ? "You are being redirected to the Shopify authentication page."
              : "Você está sendo redirecionado para a autenticação da Shopify."}
          </Text>
          <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
            <Spinner accessibilityLabel="Carregando" size="large" />
          </div>
        </Card>
      </Page>
    </PolarisAppProvider>
  );
}