// apps/frontend/app/root.tsx

import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, Link, Links } from "@remix-run/react";
import { AppProvider, Frame, Banner, Page } from "@shopify/polaris";
import ptBR from "~/app/locales/pt-BR.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

/**
 * Enterprise: Carrega CSS global do Polaris.
 */
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: polarisStyles }
];

/**
 * Enterprise: Loader global, injeta contexto seguro (shop, admin).
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const mainShopDomain = process.env.MAIN_SHOP_DOMAIN;
  return json({
    shop,
    isAdmin: shop === mainShopDomain,
    mainShopDomain,
  });
}

/**
 * Enterprise Root da app:
 * - Provider Polaris global
 * - Fallback visual amigável
 * - HeaderMenu isolado para fácil refatoração futura
 */
export default function AppRoot() {
  const { shop, isAdmin, mainShopDomain } = useLoaderData<typeof loader>();

  // Fallback enterprise: orientação clara se faltar parâmetro shop
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
    <AppProvider i18n={ptBR}>
      {/* Só o Outlet, pois o Frame é responsabilidade das rotas internas */}
      <Outlet context={{ shop, isAdmin, mainShopDomain }} />
    </AppProvider>
  );
}

/**
 * Enterprise HeaderMenu (pode migrar para Sidebar facilmente)
 */
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

// --- Enterprise styles isolados para fácil manutenção ---
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