import { Page, Card, Button, Layout, TextContainer, Banner } from "@shopify/polaris";

export default function SettingsPage() {
  return (
    <Page title="Configurações" subtitle="Personalize todos os aspectos da sua plataforma Biju & Cia.">
      {/* Banner global informativo */}
      <Banner status="info" title="Em breve!">
        Em breve, novas opções de configuração estarão disponíveis aqui para você personalizar ainda mais sua experiência.
      </Banner>
      <Layout>
        {/* Sincronização */}
        <Layout.Section>
          <Card
            title="Sincronização"
            sectioned
            primaryFooterAction={{
              content: "Configurar",
              disabled: true,
              onAction: () => {},
              accessibilityLabel: "Configuração em breve disponível",
            }}
          >
            <TextContainer>
              <p>
                Gerencie as configurações de sincronização dos seus dados e integrações automáticas.
              </p>
              <small style={{ color: "#888" }}>Funcionalidade em breve.</small>
            </TextContainer>
          </Card>
        </Layout.Section>

        {/* Usuários e Permissões */}
        <Layout.Section>
          <Card
            title="Usuários e Permissões"
            sectioned
            primaryFooterAction={{
              content: "Configurar",
              disabled: true,
              onAction: () => {},
              accessibilityLabel: "Configuração em breve disponível",
            }}
          >
            <TextContainer>
              <p>
                Controle o acesso, permissões e gerenciamento de usuários da aplicação.
              </p>
              <small style={{ color: "#888" }}>Funcionalidade em breve.</small>
            </TextContainer>
          </Card>
        </Layout.Section>

        {/* API & Integrações */}
        <Layout.Section>
          <Card
            title="API & Integrações"
            sectioned
            primaryFooterAction={{
              content: "Configurar",
              disabled: true,
              onAction: () => {},
              accessibilityLabel: "Configuração em breve disponível",
            }}
          >
            <TextContainer>
              <p>
                Configure chaves de API, webhooks e integrações com serviços externos.
              </p>
              <small style={{ color: "#888" }}>Funcionalidade em breve.</small>
            </TextContainer>
          </Card>
        </Layout.Section>

        {/* Personalização Visual */}
        <Layout.Section>
          <Card
            title="Personalização Visual"
            sectioned
            primaryFooterAction={{
              content: "Configurar",
              disabled: true,
              onAction: () => {},
              accessibilityLabel: "Configuração em breve disponível",
            }}
          >
            <TextContainer>
              <p>
                Ajuste temas, cores e outros aspectos visuais para personalizar sua experiência.
              </p>
              <small style={{ color: "#888" }}>Funcionalidade em breve.</small>
            </TextContainer>
          </Card>
        </Layout.Section>

        {/* Suporte */}
        <Layout.Section>
          <Card
            title="Suporte"
            sectioned
            primaryFooterAction={{
              content: "Configurar",
              disabled: true,
              onAction: () => {},
              accessibilityLabel: "Configuração em breve disponível",
            }}
          >
            <TextContainer>
              <p>
                Acesse opções de suporte, documentação e ajuda para sua aplicação.
              </p>
              <small style={{ color: "#888" }}>Funcionalidade em breve.</small>
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}