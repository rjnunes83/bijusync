// apps/frontend/app/routes/app/index.tsx
import { Outlet, useLocation } from "@remix-run/react";
import {
  AppProvider,
  Frame,
  Navigation,
  TopBar
} from "@shopify/polaris";
import { useState } from "react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// [Enterprise] Export para Remix coletar o CSS Polaris na rota (caso não esteja global)
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

/**
 * Logo da marca - pronto para ser customizado
 */
const logo = {
  width: 124,
  topBarSource:
    "https://cdn.shopify.com/shopifycloud/web/assets/v1/logo/shopify/logo.svg",
  url: "/app",
  accessibilityLabel: "Biju & Cia. Connector"
};

/**
 * Enterprise Dashboard Layout
 * - Sidebar com Navigation Polaris (ícones por string!)
 * - TopBar com user menu
 * - Outlet para render das rotas filhas
 */
export default function AppLayout() {
  const location = useLocation();
  const [userMenuActive, setUserMenuActive] = useState(false);

  // Definição centralizada do menu, pronto para controle de permissões/scopes
  const navItems = [
    {
      label: "Dashboard",
      icon: "HomeMajor",
      url: "/app",
      selected: location.pathname === "/app"
    },
    {
      label: "Sincronizar Catálogo",
      icon: "ImportMajor",
      url: "/app/sync",
      selected: location.pathname === "/app/sync"
    },
    {
      label: "Lojas",
      icon: "OrdersMajor",
      url: "/app/shops",
      selected: location.pathname === "/app/shops"
    },
    {
      label: "Configurações",
      icon: "SettingsMajor",
      url: "/app/settings",
      selected: location.pathname === "/app/settings"
    },
    {
      label: "Suporte",
      icon: "QuestionMarkMajor",
      url: "/app/support",
      selected: location.pathname === "/app/support"
    }
  ];

  // TopBar customizável para multiuser/app future
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
                    // Aqui pode evoluir para função real de logout
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
    <AppProvider
      i18n={{}} // Pronto para multilíngue depois (ex: ptBR)
      logo={logo}
    >
      <Frame
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
        {/* Conteúdo da rota filha (dashboard, sync, etc) */}
        <Outlet />
      </Frame>
    </AppProvider>
  );
}