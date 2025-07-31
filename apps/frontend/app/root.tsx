// apps/frontend/app/root.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider, Frame } from "@shopify/polaris";
import ptBR from "@shopify/polaris/locales/pt-BR.json";

// ⚡️ Loader que passa o domínio da loja e se é admin (loja-mãe)
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

export default function AppRoot() {
  const { shop, isAdmin, mainShopDomain } = useLoaderData<typeof loader>();

  // Debug visual fácil para não perder tempo
  if (!shop) {
    return (
      <div style={{ color: "red", padding: 40, fontWeight: 700 }}>
        ⚠️ Shop param não encontrado! Adicione <b>?shop=sualoja.myshopify.com</b> na URL para iniciar.
      </div>
    );
  }

  return (
    <AppProvider i18n={ptBR}>
      <Frame>
        <HeaderMenu isAdmin={isAdmin} />
        <Outlet context={{ shop, isAdmin, mainShopDomain }} />
      </Frame>
    </AppProvider>
  );
}

// Menu superior dinâmico
function HeaderMenu({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav style={{ display: "flex", gap: 24, padding: 24 }}>
      <a href="/app/catalog">Catálogo</a>
      {isAdmin && <a href="/app/shops">Lojas Conectadas</a>}
      <a href="/app/sync">Sincronizar</a>
      <a href="/app/settings">Configurações</a>
    </nav>
  );
}