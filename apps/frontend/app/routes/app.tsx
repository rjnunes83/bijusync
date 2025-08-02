// apps/frontend/app/routes/app.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteError, useLocation } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-remix/react";
import { AppProvider as PolarisAppProvider, Frame, Navigation, TopBar } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import ptBR from "../locales/pt-BR.json";
import { admin } from "../shopify.server";
import { useState } from "react";

// Polaris CSS
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

// Loader: autentica e determina se é loja-mãe ou revendedora
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Autentica
  const { shopDomain } = await admin.authenticate.admin(request);

  // Defina o domínio da loja-mãe no seu .env (ex: revenda-biju.myshopify.com)
  const mainStoreDomain = process.env.SHOPIFY_MAIN_STORE_DOMAIN;

  // Verifica se a loja atual é a loja-mãe
  const isMainStore = shopDomain === mainStoreDomain;

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    isMainStore,
    polarisTranslations: ptBR, // Adicione isto
  });
};

export default function App() {
  const { apiKey, isMainStore, polarisTranslations } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [userMenuActive, setUserMenuActive] = useState(false);

  // Menu dinâmico conforme loja-mãe ou revendedora
  const navItemsMain = [
    { label: "Dashboard",            url: "/app",         icon: "HomeMajor" },
    { label: "Sincronizar Catálogo", url: "/app/sync",    icon: "ImportMajor" },
    { label: "Lojas",                url: "/app/shops",   icon: "OrdersMajor" },
    { label: "Configurações",        url: "/app/settings",icon: "SettingsMajor" },
    { label: "Suporte",              url: "/app/support", icon: "QuestionMarkMajor" }
  ];
  const navItemsReseller = [
    { label: "Dashboard",            url: "/app",         icon: "HomeMajor" },
    { label: "Suporte",              url: "/app/support", icon: "QuestionMarkMajor" }
    // Pode adicionar "Configurações" se for apenas perfil
  ];
  const navItems = isMainStore ? navItemsMain : navItemsReseller;

  // Navigation polaris estilizado
  const navigation = (
    <Navigation location={location.pathname}>
      {navItems.map(item => (
        <Navigation.Item
          key={item.url}
          url={item.url}
          label={item.label}
          icon={item.icon}
          selected={location.pathname === item.url}
        />
      ))}
    </Navigation>
  );

  // TopBar com menu do usuário
  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={
        <TopBar.UserMenu
          name="Rodrigo"
          detail={isMainStore ? "Administrador" : "Revendedora"}
          initials="R"
          open={userMenuActive}
          onToggle={() => setUserMenuActive(!userMenuActive)}
          actions={[
            {
              items: [
                {
                  content: "Sair",
                  onAction: () => {
                    // TODO: integração real com Auth
                    alert("Logout!");
                  }
                }
              ]
            }
          ]}
        />
      }
    />
  );

  return (
    <ShopifyAppProvider isEmbeddedApp apiKey={apiKey}>
      <PolarisAppProvider i18n={polarisTranslations}>
        <Frame
          logo={{
            width: 124,
            topBarSource: "https://cdn.shopify.com/shopifycloud/web/assets/v1/logo/shopify/logo.svg",
            url: "/app",
            accessibilityLabel: "Biju & Cia. Connector"
          }}
          navigation={navigation}
          topBar={topBarMarkup}
        >
          <Outlet />
        </Frame>
      </PolarisAppProvider>
    </ShopifyAppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs: any) => {
  return boundary.headers(headersArgs);
};