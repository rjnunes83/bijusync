/**
 * Shopify App - Classe Mundial Enterprise
 * Polaris v13.9.5 | Multilinguagem dinâmica | Menu dinâmico (mãe/revendedora)
 * Última revisão: 2025-08-02 | Revisado por ChatGPT Enterprise AI
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-remix/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// Importação das traduções no caminho correto
import ptBR from "../locales/pt-BR.json";
import en from "../locales/en.json";
import { admin } from "../shopify.server";

/**
 * Links de CSS global Polaris (enterprise)
 */
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

/**
 * Detecta o idioma ideal via Accept-Language ou query param.
 * Future-proof: permite expansão para outros idiomas.
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
 * Detecta o tipo de loja de acordo com o domínio.
 * Considera também localhost/staging para dev.
 */
function getTipoLoja(request: Request): "mae" | "revendedora" {
  const hostname = new URL(request.url).hostname;
  if (
    hostname === "revenda-biju.myshopify.com" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".ngrok-free.app") // Para facilitar debug remoto
  ) {
    return "mae";
  }
  return "revendedora";
}

/**
 * Loader global enterprise:
 * - Autentica via Shopify
 * - Injeta i18n, API key e tipo de loja
 * - Protege contra variáveis ausentes em produção
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await admin.authenticate.admin(request);

  const apiKey = process.env.SHOPIFY_API_KEY || "";
  if (!apiKey && process.env.NODE_ENV === "production") {
    throw new Error("FATAL: Variável de ambiente SHOPIFY_API_KEY não definida em produção.");
  }

  const locale = detectLocale(request);
  const i18n = locale === "en" ? en : ptBR;
  const tipoLoja = getTipoLoja(request);

  return json({
    apiKey,
    i18n,
    locale,
    tipoLoja,
  });
};

/**
 * Menu dinâmico conforme papel da loja
 * - Menu completo para loja-mãe
 * - Menu enxuto para revendedora
 * Fácil expansão para futuros perfis.
 */
function Menu({ tipoLoja }: { tipoLoja: "mae" | "revendedora" }) {
  if (tipoLoja === "mae") {
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
  return (
    <nav style={menuStyle}>
      <Link to="/app" style={linkStyle}>Dashboard</Link>
      <Link to="/app/sync" style={linkStyle}>Sincronização</Link>
      <Link to="/app/conta" style={linkStyle}>Minha Conta</Link>
    </nav>
  );
}

// --- Styles: pronto para migração para CSS-in-JS ou Tailwind ---
const menuStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderBottom: "1px solid #E1E3E5",
  background: "#fff",
  marginBottom: 24,
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
};

const linkStyle: React.CSSProperties = {
  fontWeight: 600,
  marginRight: 18,
  color: "#313133",
  textDecoration: "none",
  fontSize: 16,
  borderRadius: 6,
  transition: "background 0.12s",
  padding: "4px 12px",
  lineHeight: 2,
};

/**
 * App principal: Provider Polaris + App Bridge + Menu dinâmico
 * Sempre provê i18n para rotas filhas!
 */
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

/**
 * Tratamento global de erros: delega para o boundary oficial da Shopify,
 * mas pode ser personalizado para UX amigável, logs, Sentry etc.
 */
export function ErrorBoundary() {
  const error = useRouteError();
  return boundary.error(error);
}

/**
 * Headers HTTP padrão. Expansível para Security Headers.
 */
export const headers = (headersArgs: any) => {
  return boundary.headers(headersArgs);
};