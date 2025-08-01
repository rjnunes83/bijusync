import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-remix/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// Importa as traduções em inglês do Polaris.
import enTranslations from '@shopify/polaris/locales/en.json';

import { admin } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Autentica o utilizador para TODAS as rotas dentro de /app/*
  await admin.authenticate.admin(request);
  
  // Retorna as variáveis de ambiente e as traduções necessárias para o frontend
  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    polarisTranslations: enTranslations,
  });
};

export default function App() {
  const { apiKey, polarisTranslations } = useLoaderData<typeof loader>();

  return (
    <ShopifyAppProvider isEmbeddedApp apiKey={apiKey}>
      {/* O PolarisAppProvider embrulha toda a UI e recebe as traduções */}
      <PolarisAppProvider i18n={polarisTranslations}>
        {/* A navegação principal da sua aplicação pode viver aqui */}
        <nav style={{ padding: '10px 20px', borderBottom: '1px solid #E1E3E5' }}>
          <Link to="/app">Dashboard</Link> | {" "}
          <Link to="/app/sync">Sincronização</Link> | {" "}
          <Link to="/app/settings">Configurações</Link>
        </nav>
        {/* O Outlet renderiza a rota-filha correspondente */}
        <Outlet />
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
