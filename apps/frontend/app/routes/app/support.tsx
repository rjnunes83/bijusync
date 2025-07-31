// /apps/frontend/app/routes/app/support.tsx
import { Page, Card, Banner, Stack, Button, TextContainer } from "@shopify/polaris";
import { ChatMajor, EmailMajor, QuestionMarkMajor } from "@shopify/polaris-icons";

export default function SupportPage() {
  return (
    <Page title="Suporte e Atendimento">
      <Stack vertical spacing="loose">
        <Card sectioned>
          <Banner
            status="info"
            title="Precisa de ajuda?"
            icon={QuestionMarkMajor}
          >
            <TextContainer>
              <p>
                Nossa equipe está pronta para te atender por múltiplos canais. Seu sucesso é nossa prioridade!
              </p>
              <Stack spacing="loose">
                <Button
                  url="mailto:suporte@bijuecia.com"
                  icon={EmailMajor}
                  external
                >
                  suporte@bijuecia.com
                </Button>
                <Button
                  url="https://wa.me/351912345678"
                  icon={ChatMajor}
                  external
                >
                  WhatsApp Suporte
                </Button>
              </Stack>
            </TextContainer>
          </Banner>
        </Card>

        <Card sectioned title="FAQ (em breve)">
          <p>
            Em breve você encontrará respostas rápidas para dúvidas frequentes e um painel de autoatendimento 24h.
          </p>
        </Card>

        <Card sectioned title="Horário de Atendimento">
          <p>
            <strong>Segunda a Sexta:</strong> 09h às 18h<br />
            <strong>Sábado:</strong> 09h às 13h<br />
            (Horário de Lisboa)
          </p>
        </Card>
      </Stack>
    </Page>
  );
}