// apps/frontend/app/routes/app.dashboard.tsx
import { useOutletContext } from "@remix-run/react";
import { Card, Page, Text } from "@shopify/polaris";

export default function DashboardReseller() {
  const { shop } = useOutletContext<{ shop: string }>();
  return (
    <Page title="Dashboard da Revendedora">
      <Card>
        <Text variant="headingLg">
          Bem-vinda, parceira {shop}
        </Text>
        <Text>
          Importe produtos, gerencie pedidos e acompanhe o status da sua loja revendedora.
        </Text>
        {/* Adicione cards de importação, status de pedidos, suporte etc */}
      </Card>
    </Page>
  );
}