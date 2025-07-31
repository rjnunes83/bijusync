// apps/frontend/app/root.tsx

import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import ptBrTranslations from "./locales/pt-BR.json";
import "@shopify/polaris/build/esm/styles.css";

export default function App() {
  return (
    <Document>
      <AppProvider i18n={ptBrTranslations}>
        <Outlet />
      </AppProvider>
    </Document>
  );
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}