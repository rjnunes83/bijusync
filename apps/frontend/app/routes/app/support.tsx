// /apps/frontend/app/routes/app/support.tsx
import {
  Page,
  Card,
  Banner,
  Stack,
  Button,
  TextContainer,
  Icon,
  Layout,
  List,
} from "@shopify/polaris";
import {
  ChatMajor,
  EmailMajor,
  QuestionMarkMajor,
  ClockMajor,
  CircleTickMajor,
} from "@shopify/polaris-icons";

/**
 * Página de Suporte e Atendimento - Classe Mundial Enterprise
 */
export default function SupportPage() {
  return (
    <Page
      title="Suporte e Atendimento"
      subtitle="Conte sempre com nosso time para tirar dúvidas, resolver problemas e impulsionar seu sucesso."
      fullWidth
    >
      <Layout>
        <Layout.Section>
          <Banner
            status="info"
            title="Precisa de ajuda?"
            icon={QuestionMarkMajor}
            tone="info"
          >
            <TextContainer>
              <p>
                Atendimento rápido, humanizado e com foco total no seu sucesso. Nossa equipe está disponível por múltiplos canais:
              </p>
              <Stack spacing="extraLoose" distribution="fillEvenly">
                <Button
                  url="mailto:suporte@bijuecia.com"
                  icon={EmailMajor}
                  external
                  size="large"
                  accessibilityLabel="Enviar email para o suporte"
                  rel="noopener noreferrer"
                >
                  Email
                </Button>
                <Button
                  url="https://wa.me/351912345678"
                  icon={ChatMajor}
                  external
                  size="large"
                  accessibilityLabel="Abrir conversa no WhatsApp"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </Button>
                <Button
                  url="https://faq.bijuecia.com"
                  icon={CircleTickMajor}
                  external
                  size="large"
                  disabled
                  accessibilityLabel="FAQ online em breve"
                  rel="noopener noreferrer"
                >
                  FAQ Online
                </Button>
              </Stack>
            </TextContainer>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned title="Horário de Atendimento" >
            <Stack alignment="center" spacing="tight">
              <Icon source={ClockMajor} accessibilityLabel="Horário de atendimento" />
              <TextContainer>
                <p>
                  <strong>Segunda a Sexta:</strong> 09h às 18h <br />
                  <strong>Sábado:</strong> 09h às 13h <br />
                  <span style={{ color: "#637381" }}>(Horário de Lisboa)</span>
                </p>
              </TextContainer>
            </Stack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned title="FAQ & Autoatendimento (em breve)">
            <List>
              <List.Item>
                Respostas instantâneas para dúvidas comuns
              </List.Item>
              <List.Item>
                Tutoriais, dicas e vídeos passo a passo
              </List.Item>
              <List.Item>
                Solicitação de suporte 24h direto pelo painel
              </List.Item>
            </List>
            <p style={{ color: "#637381", marginTop: 8 }}>
              Nossa central de ajuda está sendo desenvolvida para você resolver tudo online, rápido e sem complicação.
            </p>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}