// apps/frontend/app/routes/app/settings.tsx
import { Page, Card, Button, Layout, TextContainer, Banner } from "@shopify/polaris";

/**
 * SettingsPage — Enterprise Ready!
 * Centraliza configurações futuras e mantém UX transparente ao usuário.
 */
export default function SettingsPage() {
  return (
    <Page title="Configurações" subtitle="Personalize todos os aspectos da sua plataforma Biju & Cia.">
      {/* Banner informativo global */}
      <Banner status="info" title="Novidades em breve!">
        Em breve, novas opções de configuração estarão disponíveis para personalizar ainda mais sua experiência.
      </Banner>
      <Layout>
        <SettingsSection
          title="Sincronização"
          description="Gerencie as configurações de sincronização dos seus dados e integrações automáticas."
        />
        <SettingsSection
          title="Usuários e Permissões"
          description="Controle o acesso, permissões e gerenciamento de usuários da aplicação."
        />
        <SettingsSection
          title="API & Integrações"
          description="Configure chaves de API, webhooks e integrações com serviços externos."
        />
        <SettingsSection
          title="Personalização Visual"
          description="Ajuste temas, cores e outros aspectos visuais para personalizar sua experiência."
        />
        <SettingsSection
          title="Suporte"
          description="Acesse opções de suporte, documentação e ajuda para sua aplicação."
        />
      </Layout>
    </Page>
  );
}

/**
 * SettingsSection — Componente reutilizável para cada área de configuração.
 */
function SettingsSection({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Layout.Section>
      <Card
        title={title}
        sectioned
        primaryFooterAction={{
          content: "Configurar",
          disabled: true,
          onAction: () => {},
          accessibilityLabel: "Configuração em breve disponível",
        }}
      >
        <TextContainer>
          <p>{description}</p>
          <small style={{ color: "#888" }}>Funcionalidade em breve.</small>
        </TextContainer>
      </Card>
    </Layout.Section>
  );
}