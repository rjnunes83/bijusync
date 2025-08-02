/**
 * Shopify App - Classe Mundial Enterprise
 * Polaris v13.9.5 | Multilinguagem dinâmica | Menu dinâmico (mãe/revendedora)
 * Última revisão: 2025-08-02
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-remix/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// 🔥 IMPORT CORRETA: traduções locais, não do node_modules
import ptBR from "../locales/pt-BR.json";
import en from "../locales/en.json";
import { admin } from "../shopify.server";

// Link de estilos para Polaris
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

/**
 * Detecta o idioma mais adequado baseado no header Accept-Language
 */
function detectLocale(request: Request) {
  const acceptLanguage = request.headers.get("accept-language") || "";
  if (acceptLanguage.includes("pt-BR")) return "pt-BR";
  if (acceptLanguage.includes("en")) return "en";
  return "pt-BR"; // fallback
}

/**
 * Detecta o tipo de loja pelo domínio (Classe Mundial)
 * - Se domínio === revenda-biju.myshopify.com => "mae" (loja-mãe)
 * - Qualquer outro domínio => "revendedora"
 */
function getTipoLoja(request: Request): "mae" | "revendedora" {
  const hostname = new URL(request.url).hostname;
  if (hostname === "revenda-biju.myshopify.com") {
    return "mae";
  }
  return "revendedora";
}

// Loader global com idioma dinâmico e tipo de loja
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await admin.authenticate.admin(request);

  const apiKey = process.env.SHOPIFY_API_KEY || "";
  if (!apiKey && process.env.NODE_ENV === "production") {
    throw new Error("FATAL: Variável de ambiente SHOPIFY_API_KEY não definida em produção.");
  }

  const locale = detectLocale(request);
  let i18n = ptBR; // fallback padrão
  if (locale === "en") i18n = en;

  const tipoLoja = getTipoLoja(request);

  return json({
    apiKey,
    i18n,
    locale,
    tipoLoja,
  });
};

// Menu dinâmico de acordo com tipoLoja
function Menu({ tipoLoja }: { tipoLoja: string }) {
  if (tipoLoja === "mae") {
    // Menu completo para loja-mãe
    return (
      <nav style={menuStyle}>
        <Link to="/app" style={linkStyle}>Dashboard</Link>
        <Link to="/app/sync" style={linkStyle}>Sincronização</Link>
        <Link to="/app/settings" style={linkStyle}>Configurações</Link>
        <Link to="/app/usuarios" style={linkStyle}>Usuários</Link>
        <Link to="/app/relatorios" style={linkStyle}>Relatórios</Link>
      </nav>
    );
  }
  // Menu simplificado para revendedora
  return (
    <nav style={menuStyle}>
      <Link to="/app" style={linkStyle}>Dashboard</Link>
      <Link to="/app/sync" style={linkStyle}>Sincronização</Link>
      <Link to="/app/conta" style={linkStyle}>Minha Conta</Link>
    </nav>
  );
}

const menuStyle = {
  padding: "10px 20px",
  borderBottom: "1px solid #E1E3E5",
  background: "#fff",
  marginBottom: 24,
};

const linkStyle = { fontWeight: 600, marginRight: 18 };

// App principal
export default function App() {
  const { apiKey, i18n, tipoLoja } = useLoaderData<typeof loader>();

  return (
    <ShopifyAppProvider isEmbeddedApp apiKey={apiKey}>
      <PolarisAppProvider i18n={i18n}>
        <Menu tipoLoja={tipoLoja} />
        <Outlet />
      </PolarisAppProvider>
    </ShopifyAppProvider>
  );
}

// Tratamento global de erros
export function ErrorBoundary() {
  const error = useRouteError();
  return boundary.error(error);
}

// Headers HTTP padrão
export const headers = (headersArgs: any) => {
  return boundary.headers(headersArgs);
};