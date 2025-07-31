// apps/frontend/app/routes/app/dashboard.tsx

import { Page, Card, Layout, Banner, TextContainer, Button } from "@shopify/polaris";
import { Link } from "@remix-run/react";

/**
 * DashboardPage (Enterprise-ready)
 * Visão geral, CTAs e status. Modular e fácil de evoluir.
 */
export default function DashboardPage() {
  return (
    <Page
      title="Dashboard Biju & Cia."
      subtitle="Controle total do seu ecossistema de revenda"
      fullWidth
    >
      <Layout>
        {/* Seção principal: Ações rápidas para o usuário */}
        <Layout.Section>
          <Card sectioned title="Bem-vindo à Plataforma Biju & Cia.">
            <TextContainer>
              <p>
                Gerencie a <b>sincronização de produtos</b>, <b>lojas conectadas</b> e todas as <b>configurações</b> do seu ecossistema de revenda em um só lugar.
              </p>
              <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
                {/* Botões de navegação usando Remix Link para SSR */}
                <Link to="/app/shops" aria-label="Gerenciar Lojas">
                  <Button primary>Gerenciar Lojas</Button>
                </Link>
                <Link to="/app/sync" aria-label="Sincronizar Catálogo">
                  <Button>Sincronizar Catálogo</Button>
                </Link>
              </div>
            </TextContainer>
          </Card>
        </Layout.Section>

        {/* Sidebar: Status do sistema e suporte */}
        <Layout.Section secondary>
          <Card title="Status do Sistema" sectioned>
            <Banner title="Dica rápida!" status="info">
              Acesse as <Link to="/app/settings" aria-label="Configurações">Configurações</Link> para personalizar sua experiência.
            </Banner>
            {/* [Enterprise] Espaço para métricas, alertas, healthchecks, etc. */}
          </Card>
          <SupportCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

/**
 * Componente isolado de suporte.
 * Enterprise: Fácil de migrar para NotificationCenter ou modal.
 */
function SupportCard() {
  return (
    <Card title="Suporte rápido" sectioned>
      <p>
        Dúvidas ou problemas? Fale com nosso suporte:
        <br />
        <a
          href="mailto:suporte@bijuecia.com"
          style={{ color: "#004C92", fontWeight: 500, wordBreak: "break-all" }}
          aria-label="Enviar email para suporte"
        >
          suporte@bijuecia.com
        </a>
      </p>
    </Card>
  );
}