import { Page, Card, Button, Layout, TextContainer } from "@shopify/polaris";

export default function SettingsPage() {
  return (
    <Page title="Configurações">
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
            }}
          >
            <TextContainer>
              <p>
                Gerencie as configurações de sincronização dos seus dados e
                integrações automáticas.
              </p>
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
            }}
          >
            <TextContainer>
              <p>
                Controle o acesso, permissões e gerenciamento de usuários da
                aplicação.
              </p>
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
            }}
          >
            <TextContainer>
              <p>
                Configure chaves de API, webhooks e integrações com serviços
                externos.
              </p>
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
            }}
          >
            <TextContainer>
              <p>
                Ajuste temas, cores e outros aspectos visuais para personalizar
                sua experiência.
              </p>
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
            }}
          >
            <TextContainer>
              <p>
                Acesse opções de suporte, documentação e ajuda para sua
                aplicação.
              </p>
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}