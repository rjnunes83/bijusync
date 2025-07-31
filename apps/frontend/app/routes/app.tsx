// apps/frontend/app/routes/app.tsx
import { Outlet, useLocation } from "@remix-run/react"; // <-- Import corrigido aqui ✅
import { Frame, Navigation, TopBar } from "@shopify/polaris";
import { useState } from "react";

/**
 * Configuração do logo - pronto para customização futura.
 */
const logo = {
  width: 124,
  topBarSource: "https://cdn.shopify.com/shopifycloud/web/assets/v1/logo/shopify/logo.svg",
  url: "/app",
  accessibilityLabel: "Biju & Cia. Connector"
};

/**
 * Layout principal da área logada do app (Enterprise Ready):
 * - Sidebar Polaris Navigation
 * - TopBar com user menu (futuro multiuser)
 * - Outlet para render das rotas filhas (/app/*)
 */
export default function AppLayout() {
  const location = useLocation();
  const [userMenuActive, setUserMenuActive] = useState(false);

  /**
   * Definição centralizada do menu lateral.
   * Pronto para expansão: controle por roles/scopes ou internacionalização.
   */
  const navItems = [
    { label: "Dashboard",            icon: "HomeMajor",          url: "/app",           selected: location.pathname === "/app" },
    { label: "Sincronizar Catálogo", icon: "ImportMajor",        url: "/app/sync",      selected: location.pathname === "/app/sync" },
    { label: "Lojas",                icon: "OrdersMajor",        url: "/app/shops",     selected: location.pathname === "/app/shops" },
    { label: "Configurações",        icon: "SettingsMajor",      url: "/app/settings",  selected: location.pathname === "/app/settings" },
    { label: "Suporte",              icon: "QuestionMarkMajor",  url: "/app/support",   selected: location.pathname === "/app/support" }
  ];

  /**
   * TopBar do usuário - prático para multiusuário no futuro.
   * TODO: Integrar logout real conectado ao Auth do Shopify.
   */
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
    // Polaris AppProvider JÁ está no root.tsx, não repita aqui!
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
      {/* Renderiza o conteúdo das rotas filhas: dashboard, sync, shops, settings, support */}
      <Outlet />
    </Frame>
  );
}