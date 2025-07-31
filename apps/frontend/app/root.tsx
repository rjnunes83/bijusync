// apps/frontend/app/root.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, Link } from "@remix-run/react";
import { AppProvider, Frame, TopBar } from "@shopify/polaris";
import ptBR from "@shopify/polaris/locales/pt-BR.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// Padrão Remix para incluir CSS global
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

/**
 * Loader global - injeta domínio da loja e se é admin/loja-mãe.
 * Padrão enterprise: nunca deixe informação sensível fora do loader.
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
 * Root global do app: aplica provider, tema, idioma e roteamento.
 */
export default function AppRoot() {
  const { shop, isAdmin, mainShopDomain } = useLoaderData<typeof loader>();

  // Enterprise: fallback de erro elegante e didático
  if (!shop) {
    return (
      <div style={{
        color: "#B00020",
        padding: 48,
        fontWeight: 700,
        fontFamily: "Inter, Arial, sans-serif",
        background: "#FFF4F4",
        border: "2px solid #B00020",
        borderRadius: 12
      }}>
        ⚠️ Parâmetro <b>?shop=</b> ausente na URL.<br />
        Exemplo: <code>?shop=sualoja.myshopify.com</code>
      </div>
    );
  }

  return (
    <AppProvider i18n={ptBR}>
      <Frame>
        <HeaderMenu isAdmin={isAdmin} />
        {/* O Outlet recebe contexto global */}
        <Outlet context={{ shop, isAdmin, mainShopDomain }} />
      </Frame>
    </AppProvider>
  );
}

/**
 * Menu superior - pronto para ser evoluído para Navigation Polaris,
 * mas usando Link do Remix para SSR/hidratação perfeita.
 */
function HeaderMenu({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav style={{
      display: "flex",
      gap: 32,
      padding: "24px 32px 0 32px",
      background: "#F6F6F7",
      borderBottom: "1px solid #E3E3E3"
    }}>
      <Link style={navStyle} to="/app/catalog">Catálogo</Link>
      {isAdmin && <Link style={navStyle} to="/app/shops">Lojas Conectadas</Link>}
      <Link style={navStyle} to="/app/sync">Sincronizar</Link>
      <Link style={navStyle} to="/app/settings">Configurações</Link>
      <Link style={navStyle} to="/app/support">Suporte</Link>
    </nav>
  );
}

// Estilo enterprise para o menu, isolado para fácil manutenção
const navStyle = {
  fontWeight: 600,
  color: "#313133",
  textDecoration: "none",
  fontSize: 17,
  padding: "2px 8px",
  borderRadius: 6,
  transition: "background 0.12s",
};