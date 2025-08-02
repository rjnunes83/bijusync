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
 * DashboardPage (Enterprise-ready)
 * Visão geral do ecossistema Biju & Cia.
 * Modular, internacionalizável e preparado para expansão (menus dinâmicos, métricas, etc).
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
 * Card de boas-vindas e ações rápidas.
 * Aceita futuras props para i18n, personalização ou contexto de loja-mãe/revendedora.
 */
function WelcomeCard() {
  return (
    <Card
      sectioned
      title="Bem-vindo à Plataforma Biju & Cia."
      actions={[
        {
          content: "Ajuda",
          url: "mailto:suporte@bijuecia.com",
          accessibilityLabel: "Contato do suporte por email"
        }
      ]}
    >
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
          {/* Futuro: menu dinâmico de acordo com tipo de loja */}
          {/* <Link to="/app/relatorios" aria-label="Ver Relatórios">
            <Button>Relatórios</Button>
          </Link> */}
        </div>
      </TextContainer>
    </Card>
  );
}

/**
 * Card de status do sistema e sugestões rápidas.
 * Pode receber props para healthcheck, alertas dinâmicos, etc.
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
      {/* [Futuro] Métricas do sistema, healthcheck e alertas em tempo real */}
    </Card>
  );
}

/**
 * Card de suporte institucional.
 * Endereço de email parametrizável via env/context no futuro.
 */
function SupportCard() {
  return (
    <Card title="Suporte rápido" sectioned>
      <TextContainer>
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
      </TextContainer>
    </Card>
  );
}