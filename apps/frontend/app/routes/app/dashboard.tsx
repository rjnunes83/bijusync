// apps/frontend/app/routes/app/dashboard.tsx
import { Page, Card, Layout, Banner, TextContainer, Button } from "@shopify/polaris";
import { Link } from "@remix-run/react";

/**
 * DashboardPage
 * Visão geral para o admin ou revendedora (modular)
 */
export default function DashboardPage() {
  return (
    <Page
      title="Dashboard Biju & Cia."
      subtitle="Controle total do seu ecossistema de revenda"
      fullWidth
    >
      <Layout>
        <Layout.Section>
          <Card sectioned title="Bem-vindo à Plataforma Biju & Cia.">
            <TextContainer>
              <p>
                Gerencie a <b>sincronização de produtos</b>, <b>lojas conectadas</b> e todas as <b>configurações</b> do seu ecossistema de revenda em um só lugar.
              </p>
              <div style={{ marginTop: 16 }}>
                <Link to="/app/shops">
                  <Button primary>Gerenciar Lojas</Button>
                </Link>
                <span style={{ margin: "0 8px" }} />
                <Link to="/app/sync">
                  <Button>Sincronizar Catálogo</Button>
                </Link>
              </div>
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card title="Status do Sistema" sectioned>
            <Banner title="Dica rápida!" status="info">
              Acesse as <Link to="/app/settings">Configurações</Link> para personalizar sua experiência.
            </Banner>
            {/* [Enterprise] Espaço para futuras métricas, alertas ou status de sincronismo */}
          </Card>
          <Card title="Suporte rápido" sectioned>
            <p>
              Dúvidas ou problemas? Fale com nosso suporte pelo e-mail <a href="mailto:suporte@bijuecia.com">suporte@bijuecia.com</a>
            </p>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}