// apps/frontend/app/root.tsx
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, Link } from "@remix-run/react";
import { AppProvider, Frame } from "@shopify/polaris";
import ptBR from "@shopify/polaris/locales/pt-BR.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

/**
 * Carrega CSS do Polaris (Shopify Design System)
 */
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: polarisStyles }
];

/**
 * Loader global enterprise-ready.
 * Injeta informações seguras no contexto da app.
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
 * Root da aplicação (contexto global, tema, idioma e roteamento).
 * Enterprise: Provider Polaris, fallback, outlet e menu superior.
 */
export default function AppRoot() {
  const { shop, isAdmin, mainShopDomain } = useLoaderData<typeof loader>();

  // Fallback amigável se a loja não está definida na URL
  if (!shop) {
    return (
      <div style={fallbackStyle}>
        <span role="img" aria-label="Atenção" style={{ fontSize: 28 }}>⚠️</span>
        <div style={{ marginTop: 8 }}>
          Parâmetro <b>?shop=</b> ausente na URL.<br />
          Exemplo: <code>?shop=sualoja.myshopify.com</code>
        </div>
      </div>
    );
  }

  return (
    <AppProvider i18n={ptBR}>
      <Frame>
        <HeaderMenu isAdmin={isAdmin} />
        {/* Outlet recebe o contexto global do loader */}
        <Outlet context={{ shop, isAdmin, mainShopDomain }} />
      </Frame>
    </AppProvider>
  );
}

/**
 * Menu superior enterprise, fácil de migrar para Navigation lateral.
 * Usa Link do Remix para SSR e hidratação correta.
 */
function HeaderMenu({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav
      style={navBarStyle}
      role="navigation"
      aria-label="Menu principal"
    >
      <Link style={navStyle} to="/app/catalog">Catálogo</Link>
      {isAdmin && <Link style={navStyle} to="/app/shops">Lojas Conectadas</Link>}
      <Link style={navStyle} to="/app/sync">Sincronizar</Link>
      <Link style={navStyle} to="/app/settings">Configurações</Link>
      <Link style={navStyle} to="/app/support">Suporte</Link>
    </nav>
  );
}

// --- Enterprise styles isolados ---
const fallbackStyle = {
  color: "#B00020",
  padding: 48,
  fontWeight: 700,
  fontFamily: "Inter, Arial, sans-serif",
  background: "#FFF4F4",
  border: "2px solid #B00020",
  borderRadius: 12,
  maxWidth: 520,
  margin: "64px auto",
  textAlign: "center" as const,
  boxShadow: "0 4px 24px #b0002020"
};

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