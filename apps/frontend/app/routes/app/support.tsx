// /apps/frontend/app/routes/app/support.tsx
import { Page, Card, Banner } from "@shopify/polaris";

export default function SupportPage() {
  return (
    <Page title="Suporte">
      <Card sectioned>
        <Banner status="info" title="Precisa de ajuda?">
          Envie um e-mail para <a href="mailto:suporte@bijuecia.com">suporte@bijuecia.com</a> ou entre em contato via WhatsApp.
        </Banner>
      </Card>
    </Page>
  );
}