// apps/frontend/app/routes/app/index.tsx
import { Outlet, useLocation } from "@remix-run/react";
import {
  Frame,
  Navigation,
  TopBar
} from "@shopify/polaris";
import { useState } from "react";

/**
 * Enterprise: Configuração do logo (pode evoluir para dinâmico).
 */
const logo = {
  width: 124,
  topBarSource: "https://cdn.shopify.com/shopifycloud/web/assets/v1/logo/shopify/logo.svg",
  url: "/app",
  accessibilityLabel: "Biju & Cia. Connector"
};

/**
 * Enterprise Layout da dashboard:
 * - Sidebar Navigation Polaris (ícones por string!)
 * - TopBar com menu do usuário (futuro multiuser)
 * - Outlet para render das rotas filhas
 * - Não importa AppProvider aqui, pois já vem do root!
 */
export default function AppLayout() {
  const location = useLocation();
  const [userMenuActive, setUserMenuActive] = useState(false);

  // Menu lateral enterprise, pronto para expansão por roles/scopes
  const navItems = [
    { label: "Dashboard",           icon: "HomeMajor",        url: "/app",         selected: location.pathname === "/app" },
    { label: "Sincronizar Catálogo",icon: "ImportMajor",      url: "/app/sync",    selected: location.pathname === "/app/sync" },
    { label: "Lojas",               icon: "OrdersMajor",      url: "/app/shops",   selected: location.pathname === "/app/shops" },
    { label: "Configurações",       icon: "SettingsMajor",    url: "/app/settings",selected: location.pathname === "/app/settings" },
    { label: "Suporte",             icon: "QuestionMarkMajor",url: "/app/support", selected: location.pathname === "/app/support" }
  ];

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
                    // TODO: Integrar logout real com sessão/Shopify Auth
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
    // Não precisa do AppProvider aqui, já está no root.tsx!
    <Frame
      logo={logo}
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
      {/* Renderiza a rota filha: dashboard, sync, etc */}
      <Outlet />
    </Frame>
  );
}