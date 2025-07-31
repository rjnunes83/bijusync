// apps/frontend/app/routes/app/index.tsx
import { Page, Card, Layout, Banner, TextContainer, Button } from "@shopify/polaris";
import { Link } from "@remix-run/react";

/**
 * Dashboard principal da plataforma Biju & Cia. (Enterprise Ready)
 * - Mostra ações principais, dicas e integração perfeita Polaris + Remix
 * - Agora atuando como rota filha, renderizando dentro do AppLayout de app.tsx
 */
export default function DashboardPage() {
  return (
    <Page title="Dashboard Biju & Cia.">
      <Layout>
        <Layout.Section>
          <Card sectioned title="Bem-vindo à Plataforma Biju & Cia.">
            <TextContainer>
              <p>
                Gerencie a sincronização de produtos, lojas conectadas e todas as configurações do seu ecossistema de revenda num só lugar.
              </p>
              <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
                <Link to="/app/shops">
                  <Button primary>Gerenciar Lojas</Button>
                </Link>
                <Link to="/app/sync">
                  <Button>Sincronizar Catálogo</Button>
                </Link>
              </div>
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Banner title="Dica" status="info">
            Personalize sua experiência acessando as <Link to="/app/settings">Configurações</Link> do sistema!
          </Banner>
        </Layout.Section>
      </Layout>
    </Page>
  );
}