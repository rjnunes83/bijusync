// apps/frontend/app/routes/app/dashboard.tsx

import {
  Page,
  Card,
  Layout,
  Banner,
  TextContainer,
  Button
} from "@shopify/polaris";
import { Link } from "@remix-run/react";

/**
 * DashboardPage (Classe Mundial Enterprise)
 * Visão geral do ecossistema. Modular, internacionalizável e fácil de evoluir.
 *
 * Para menus/ações dinâmicas: basta passar tipoLoja via loader/context.
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
          <WelcomeCard />
        </Layout.Section>

        <Layout.Section secondary>
          <SystemStatusCard />
          <SupportCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

/**
 * Bloco de boas-vindas e ações rápidas
 */
function WelcomeCard() {
  return (
    <Card sectioned title="Bem-vindo à Plataforma Biju & Cia.">
      <TextContainer>
        <p>
          Gerencie a <b>sincronização de produtos</b>, <b>lojas conectadas</b> e todas as <b>configurações</b> do seu ecossistema de revenda em um só lugar.
        </p>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 16,
            flexWrap: "wrap"
          }}
        >
          <Link to="/app/shops" aria-label="Gerenciar Lojas">
            <Button primary>Gerenciar Lojas</Button>
          </Link>
          <Link to="/app/sync" aria-label="Sincronizar Catálogo">
            <Button>Sincronizar Catálogo</Button>
          </Link>
          {/* Exemplo de ação dinâmica, menu da loja-mãe pode ter mais ações */}
          {/* <Link to="/app/relatorios" aria-label="Ver Relatórios">
            <Button>Relatórios</Button>
          </Link> */}
        </div>
      </TextContainer>
    </Card>
  );
}

/**
 * Status do sistema e sugestões rápidas
 */
function SystemStatusCard() {
  return (
    <Card title="Status do Sistema" sectioned>
      <Banner
        title="Dica rápida!"
        status="info"
        aria-live="polite"
      >
        Acesse as{" "}
        <Link to="/app/settings" aria-label="Configurações">
          Configurações
        </Link>{" "}
        para personalizar sua experiência.
      </Banner>
      {/* Espaço reservado para métricas, alertas, healthchecks etc. */}
    </Card>
  );
}

/**
 * Bloco de suporte institucional
 */
function SupportCard() {
  return (
    <Card title="Suporte rápido" sectioned>
      <p>
        Dúvidas ou problemas? Fale com nosso suporte:
        <br />
        <a
          href="mailto:suporte@bijuecia.com"
          style={{
            color: "#004C92",
            fontWeight: 500,
            wordBreak: "break-all"
          }}
          aria-label="Enviar email para suporte"
        >
          suporte@bijuecia.com
        </a>
      </p>
    </Card>
  );
}