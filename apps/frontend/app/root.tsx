// apps/frontend/app/root.tsx

import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, Links } from "@remix-run/react";
import { AppProvider, Banner, Page } from "@shopify/polaris";
import ptBR from "./locales/pt-BR.json";
import en from "./locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

/**
 * Enterprise: Carrega CSS global do Polaris.
 */
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: polarisStyles },
];

/**
 * Detecta o idioma ideal (header, query param, fallback).
 */
function detectLocale(request: Request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang");
  if (lang === "en") return "en";
  if (lang === "pt-BR") return "pt-BR";
  const acceptLanguage = request.headers.get("accept-language") || "";
  if (acceptLanguage.includes("en")) return "en";
  return "pt-BR";
}

/**
 * Loader global: injeta contexto seguro (shop, admin, i18n).
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const mainShopDomain = process.env.MAIN_SHOP_DOMAIN || "";
  const locale = detectLocale(request);
  const i18n = locale === "en" ? en : ptBR;

  return json({
    shop,
    isAdmin: !!mainShopDomain && shop === mainShopDomain,
    mainShopDomain,
    i18n,
    locale,
  });
}

/**
 * Root da app:
 * - Polaris AppProvider global (contexto SSR seguro)
 * - Fallback visual amigável para ausência do parâmetro ?shop
 * - Outlet para rotas filhas já dentro do Provider
 */
export default function AppRoot() {
  const { shop, isAdmin, mainShopDomain, i18n } = useLoaderData<typeof loader>();

  // Fallback visual quando falta o parâmetro shop (UX top)
  if (!shop) {
    return (
      <>
        <Links />
        <Page>
          <div style={{ maxWidth: 560, margin: "60px auto" }}>
            <Banner
              status="critical"
              title="Parâmetro ?shop= ausente na URL"
            >
              Por favor, adicione <b>?shop=sualoja.myshopify.com</b> à URL para iniciar.<br />
              Exemplo: <code>?shop=sualoja.myshopify.com</code>
            </Banner>
          </div>
        </Page>
      </>
    );
  }

  return (
    <AppProvider i18n={i18n}>
      <Outlet context={{ shop, isAdmin, mainShopDomain }} />
    </AppProvider>
  );
}