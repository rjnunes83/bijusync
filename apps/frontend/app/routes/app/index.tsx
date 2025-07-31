// /apps/frontend/app/routes/app/index.tsx
import { Outlet } from "@remix-run/react";
import { Frame, TopBar } from "@shopify/polaris";
import { useState } from "react";

export default function AppLayout() {
  // Exemplo de TopBar customizável
  const [userMenuActive, setUserMenuActive] = useState(false);
  const toggleUserMenu = () => setUserMenuActive((active) => !active);

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={
        <TopBar.UserMenu
          actions={[{ items: [{ content: "Sair", onAction: () => alert("Logout")}]}]}
          name="Admin"
          detail="Biju & Cia."
          open={userMenuActive}
          onToggle={toggleUserMenu}
        />
      }
    />
  );

  return (
    <Frame topBar={topBarMarkup}>
      <Outlet />
    </Frame>
  );
}