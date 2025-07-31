import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider, Card, Page, Layout, Spinner, Banner, DataTable, Frame } from "@shopify/polaris";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

// Componente global de debug
function Debugger({ error, data, loading }: any) {
  if (loading) return <Banner status="info" title="Carregando informações..." />;
  if (error) {
    if (process.env.NODE_ENV === "development") console.error("DASHBOARD ERROR:", error);
    return <Banner status="critical" title="Erro!" >{error.toString()}</Banner>;
  }
  if (!data || !data.shops) {
    if (process.env.NODE_ENV === "development") console.warn("Nenhum dado de lojas retornado pelo backend.");
    return <Banner status="warning" title="Sem dados">Não foi possível carregar as lojas. Tente novamente mais tarde.</Banner>;
  }
  if (data.shops.length === 0) {
    return <Banner status="warning" title="Nenhuma loja conectada">Conecte uma loja para iniciar a sincronização.</Banner>;
  }
  return null;
}

// Dashboard principal (pode ser refatorado depois para admin e revenda)
function Dashboard() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/shops")
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((data) => {
        setShops(data.shops || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  // Prepara dados para DataTable Polaris
  const rows = shops.map((shop: any) => [
    shop.shopify_domain,
    shop.created_at ? new Date(shop.created_at).toLocaleString() : "",
    shop.updated_at ? new Date(shop.updated_at).toLocaleString() : "",
    shop.access_token ? "Ativo" : "Inativo",
  ]);

  return (
    <Page
      title="Dashboard Biju & Cia. Connector"
      subtitle="Gerencie lojas conectadas e sincronize seu catálogo!"
    >
      <Debugger error={error} data={{ shops }} loading={loading} />
      <Layout>
        <Layout.Section>
          {loading && <Spinner accessibilityLabel="Carregando lojas..." size="large" />}
          {!loading && !error && shops.length > 0 && (
            <Card title="Lojas Conectadas" sectioned>
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text']}
                headings={['Domínio', 'Criada em', 'Atualizada em', 'Status']}
                rows={rows}
              />
              <div style={{ marginTop: 20 }}>
                <Link to="/app/sync">
                  <Banner status="success">Clique aqui para sincronizar produtos agora!</Banner>
                </Link>
              </div>
            </Card>
          )}
        </Layout.Section>
        <Layout.Section secondary>
          <Card title="Próximos Passos" sectioned>
            <ul>
              <li>1. Instale a app nas lojas revendedoras</li>
              <li>2. Sincronize o catálogo</li>
              <li>3. Gerencie preços e configurações</li>
              <li>4. Entre em contato com suporte se necessário</li>
            </ul>
          </Card>
          <Card title="Suporte" sectioned>
            <p>Dúvidas? <a href="mailto:suporte@bijuecia.com">suporte@bijuecia.com</a></p>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// Este componente é o layout padrão de /app e subrotas
export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  if (!apiKey) {
    // Banner amigável se faltar configuração
    return (
      <div style={{ padding: 40 }}>
        <Banner status="critical" title="Erro de configuração">
          API Key da Shopify não encontrada! Confira as variáveis de ambiente.
        </Banner>
      </div>
    );
  }

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <Frame>
        <NavMenu>
          <Link to="/app" rel="home">Dashboard</Link>
          <Link to="/app/sync">Sincronizar Catálogo</Link>
          <Link to="/app/settings">Configurações</Link>
          <Link to="/app/support">Suporte</Link>
        </NavMenu>
        {/* Outlet para subrotas */}
        <Outlet />
      </Frame>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};