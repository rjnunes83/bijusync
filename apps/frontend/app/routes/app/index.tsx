// /apps/frontend/app/routes/app/index.tsx
import { Outlet, useLocation } from "@remix-run/react";
import {
  AppProvider,
  Frame,
  Navigation,
  TopBar
} from "@shopify/polaris";
import { useState } from "react";
// Importação dos ícones Polaris
import {
  HomeMajor,
  ImportMajor,
  OrdersMajor,
  SettingsMajor,
  QuestionMarkMajor
} from "@shopify/polaris-icons";

// Exemplo de logo (pode personalizar)
const logo = {
  width: 124,
  topBarSource:
    "https://cdn.shopify.com/shopifycloud/web/assets/v1/logo/shopify/logo.svg", // Mude para sua marca se quiser
  url: "/app",
  accessibilityLabel: "Biju & Cia. Connector"
};

export default function AppLayout() {
  const location = useLocation();
  // Menu lateral
  const navItems = [
    {
      label: "Dashboard",
      icon: HomeMajor,
      url: "/app",
      selected: location.pathname === "/app"
    },
    {
      label: "Sincronizar Catálogo",
      icon: ImportMajor,
      url: "/app/sync",
      selected: location.pathname === "/app/sync"
    },
    {
      label: "Lojas",
      icon: OrdersMajor,
      url: "/app/shops",
      selected: location.pathname === "/app/shops"
    },
    {
      label: "Configurações",
      icon: SettingsMajor,
      url: "/app/settings",
      selected: location.pathname === "/app/settings"
    },
    {
      label: "Suporte",
      icon: QuestionMarkMajor,
      url: "/app/support",
      selected: location.pathname === "/app/support"
    }
  ];

  // TopBar padrão (pode personalizar)
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
      i18n={{}} // Adapte depois se for multilíngue
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
        {/* Aqui carrega o conteúdo da página selecionada */}
        <Outlet />
      </Frame>
    </AppProvider>
  );
}