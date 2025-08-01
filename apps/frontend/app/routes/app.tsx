// apps/frontend/app/routes/app.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useRouteError, useLocation } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider, Frame, Navigation, TopBar } from "@shopify/polaris";
import ptBR from "@shopify/polaris/locales/pt-BR.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { admin } from "../shopify.server";
import { useState } from "react";

// Polaris CSS
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

// Loader para autenticação e variáveis
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await admin.authenticate.admin(request);
  return json({});
};

export default function App() {
  const location = useLocation();
  const [userMenuActive, setUserMenuActive] = useState(false);

  // Menu Polaris Navigation
  const navItems = [
    { label: "Dashboard",            icon: "HomeMajor",          url: "/app",           selected: location.pathname === "/app" },
    { label: "Sincronizar Catálogo", icon: "ImportMajor",        url: "/app/sync",      selected: location.pathname === "/app/sync" },
    { label: "Lojas",                icon: "OrdersMajor",        url: "/app/shops",     selected: location.pathname === "/app/shops" },
    { label: "Configurações",        icon: "SettingsMajor",      url: "/app/settings",  selected: location.pathname === "/app/settings" },
    { label: "Suporte",              icon: "QuestionMarkMajor",  url: "/app/support",   selected: location.pathname === "/app/support" }
  ];

  // TopBar para futuro multiusuário
  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={
        <TopBar.UserMenu
          name="Rodrigo"
          detail="Biju & Cia."
          initials="R"
          open={userMenuActive}
          onToggle={() => setUserMenuActive(!userMenuActive)}
          actions={[
            {
              items: [
                {
                  content: "Sair",
                  onAction: () => {
                    // TODO: Integração real com sessão/Shopify Auth
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
    <AppProvider i18n={ptBR}>
      <Frame
        logo={{
          width: 124,
          topBarSource: "https://cdn.shopify.com/shopifycloud/web/assets/v1/logo/shopify/logo.svg",
          url: "/app",
          accessibilityLabel: "Biju & Cia. Connector"
        }}
        navigation={
          <Navigation location={location.pathname}>
            {navItems.map((item) => (
              <Navigation.Item
                key={item.url}
                url={item.url}
                label={item.label}
                icon={item.icon}
                selected={item.selected}
              />
            ))}
          </Navigation>
        }
        topBar={topBarMarkup}
      >
        <Outlet />
      </Frame>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs: any) => {
  return boundary.headers(headersArgs);
};