// /apps/frontend/app/routes/app/dashboard.tsx
import { Page, Card, Layout, Banner } from "@shopify/polaris";
import { Link } from "@remix-run/react";

export default function DashboardPage() {
  return (
    <Page title="Dashboard Biju & Cia.">
      <Layout>
        <Layout.Section>
          <Card sectioned title="Bem-vindo à Plataforma Biju & Cia.">
            <p>
              Aqui você gerencia a sincronização de produtos, lojas conectadas e configurações do seu ecossistema de revenda.
            </p>
            <Link to="/app/shops">Gerenciar Lojas</Link> |{" "}
            <Link to="/app/sync">Sincronizar Catálogo</Link>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Banner title="Dica!" status="info">
            Acesse as configurações para personalizar sua experiência.
          </Banner>
        </Layout.Section>
      </Layout>
    </Page>
  );
}