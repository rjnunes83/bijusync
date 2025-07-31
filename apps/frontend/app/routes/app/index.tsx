// /apps/frontend/app/routes/app/index.tsx
import { Outlet, useLocation } from "@remix-run/react";
import {
  AppProvider,
  Frame,
  Navigation,
  TopBar
} from "@shopify/polaris";
import { useState } from "react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// Importante: Polaris icons são strings na Navigation.Item! Não importa componentes aqui.
// [Enterprise] Importar o CSS global do Polaris (coloque o export links se não estiver no root.tsx)
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

/**
 * Config do logo (personalize depois)
 */
const logo = {
  width: 124,
  topBarSource:
    "https://cdn.shopify.com/shopifycloud/web/assets/v1/logo/shopify/logo.svg", // Troque para sua logo se quiser
  url: "/app",
  accessibilityLabel: "Biju & Cia. Connector"
};

/**
 * Dashboard layout padrão enterprise - Sidebar Polaris, TopBar Polaris, roteamento SSR
 */
export default function AppLayout() {
  const location = useLocation();

  // Menu lateral com ícones Polaris por string!
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

  // TopBar com menu do usuário
  const [userMenuActive, setUserMenuActive] = useState(false);

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
              items: [{ content: "Sair", onAction: () => alert("Logout!") }]
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
        {/* Carrega a rota filha (dashboard, sync, etc) */}
        <Outlet />
      </Frame>
    </AppProvider>
  );
}