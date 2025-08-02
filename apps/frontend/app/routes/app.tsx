import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-remix/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// A sintaxe "?url" é um sufixo especial do Vite que importa o URL do asset.
// No entanto, para JSON, precisamos do conteúdo. A importação direta deve funcionar,
// mas para garantir, usamos um caminho relativo limpo.
import polarisTranslations from "../locales/pt-BR.json";

import { admin } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await admin.authenticate.admin(request);
  
  // O loader retorna o próprio objeto de tradução.
  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    polarisTranslations,
  });
};

export default function App() {
  const { apiKey, polarisTranslations } = useLoaderData<typeof loader>();

  return (
    <ShopifyAppProvider isEmbeddedApp apiKey={apiKey}>
      <PolarisAppProvider i18n={polarisTranslations}>
        <nav style={{ padding: '10px 20px', borderBottom: '1px solid #E1E3E5' }}>
          <Link to="/app">Dashboard</Link> | {" "}
          <Link to="/app/sync">Sincronização</Link> | {" "}
          <Link to="/app/settings">Configurações</Link>
        </nav>
        <Outlet />
      </PolarisAppProvider>
    </ShopifyAppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs: any) => {
  return boundary.headers(headersArgs);
};