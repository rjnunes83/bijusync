// apps/frontend/app/routes/app.admin.tsx
import { useOutletContext } from "@remix-run/react";
import { Card, Page, Text } from "@shopify/polaris";

export default function DashboardAdmin() {
  const { mainShopDomain } = useOutletContext<{ mainShopDomain: string }>();
  return (
    <Page title="Painel Administrativo - Loja-Mãe">
      <Card>
        <Text variant="headingLg">
          Bem-vindo ao Painel da Loja-Mãe ({mainShopDomain})
        </Text>
        <Text>
          Aqui você pode ver todas as lojas conectadas, status dos tokens, sincronização global, estatísticas e auditoria.
        </Text>
        {/* Adicione cards de métricas, gráficos, etc, conforme necessário */}
      </Card>
    </Page>
  );
}