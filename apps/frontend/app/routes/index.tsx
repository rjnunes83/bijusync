// apps/frontend/app/routes/index.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
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

// Enterprise: Link de estilos Polaris para SSR (mantém padrão)
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

// Detecta idioma via header ou querystring
function detectLocale(request: Request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang");
  if (lang === "en") return "en";
  if (lang === "pt-BR") return "pt-BR";
  const acceptLanguage = request.headers.get("accept-language") || "";
  if (acceptLanguage.includes("en")) return "en";
  return "pt-BR";
}

// Loader enterprise: injeta tradução para SSR/SPA
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Redireciona imediatamente para o dashboard
  if (!process.env.BIJUSYNC_ALLOW_INDEX_PAGE) {
    throw redirect("/app");
  }
  const locale = detectLocale(request);
  const polarisTranslations = locale === "en" ? en : ptBR;
  return json({ locale, polarisTranslations });
};

// Página inicial enterprise (fallback para SSR)
export default function Index() {
  const data = useLoaderData<typeof loader>();
  if (!data) {
    // Fallback: enquanto carrega, mostra um spinner centralizado
    return (
      <div style={{ display: "flex", height: "80vh", alignItems: "center", justifyContent: "center" }}>
        <Spinner accessibilityLabel="Carregando..." size="large" />
      </div>
    );
  }
  const { polarisTranslations, locale } = data;
  return (
    <PolarisAppProvider i18n={polarisTranslations}>
      <Page>
        <Card sectioned>
          <Text variant="headingLg" as="h1">
            BijuSync para Shopify
          </Text>
          <Text as="p" color="subdued">
            Bem-vindo! Você será redirecionado automaticamente para o Dashboard.<br />
            Caso não seja redirecionado, <a href="/app">clique aqui</a>.
          </Text>
        </Card>
      </Page>
    </PolarisAppProvider>
  );
}