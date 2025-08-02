// apps/frontend/app/root.tsx

import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, Links } from "@remix-run/react";
import { AppProvider, Banner, Page } from "@shopify/polaris";
// Polaris v13+ - Traduções via arquivo local (AJUSTE: caminho correto)
import ptBR from "./locales/pt-BR.json";
import en from "./locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

/**
 * Enterprise: Carrega CSS global do Polaris.
 */
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: polarisStyles }
];

/**
 * Detecta o idioma ideal (header, query, fallback).
 */
function detectLocale(request: Request) {
  const url = new URL(request.url);
  // Força via query param
  const lang = url.searchParams.get("lang");
  if (lang === "en") return "en";
  if (lang === "pt-BR") return "pt-BR";
  // Ou tenta pelo header Accept-Language
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
  // TODO: regex para validar domínio Shopify, se quiser segurança máxima

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
 * - Provider Polaris global
 * - Fallback visual amigável
 */
export default function AppRoot() {
  const { shop, isAdmin, mainShopDomain, i18n } = useLoaderData<typeof loader>();

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

/* 
// HeaderMenu pode ser migrado para um componente separado futuramente. 
function HeaderMenu({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav
      style={navBarStyle}
      role="navigation"
      aria-label="Menu principal"
    >
      <Link style={navStyle} to="/app">Dashboard</Link>
      <Link style={navStyle} to="/app/sync">Sincronizar</Link>
      {isAdmin && <Link style={navStyle} to="/app/shops">Lojas Conectadas</Link>}
      <Link style={navStyle} to="/app/settings">Configurações</Link>
      <Link style={navStyle} to="/app/support">Suporte</Link>
    </nav>
  );
}

const navBarStyle = {
  display: "flex",
  gap: 32,
  padding: "24px 32px 0 32px",
  background: "#F6F6F7",
  borderBottom: "1px solid #E3E3E3",
  alignItems: "center",
  flexWrap: "wrap" as const,
};

const navStyle = {
  fontWeight: 600,
  color: "#313133",
  textDecoration: "none",
  fontSize: 17,
  padding: "2px 8px",
  borderRadius: 6,
  transition: "background 0.12s",
  lineHeight: 2.3,
  letterSpacing: 0.1,
};
*/