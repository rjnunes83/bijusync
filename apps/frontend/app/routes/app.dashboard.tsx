// apps/frontend/app/routes/app.dashboard.tsx

import {
  Page,
  Layout,
  BlockStack,
  Card,
  Text,
  Badge,
  Button,
  Frame,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  Banner,
  EmptyState,
  Grid,
  Box,
  Icon,
} from "@shopify/polaris";
import {
  StoreIcon,
  ProductIcon,
  OrderIcon,
  AlertCircleIcon,
  RefreshIcon,
  CheckCircleIcon,
  QuestionCircleIcon,
} from "@shopify/polaris-icons";
import { useEffect, useState } from "react";

// Mock de indicadores
const indicadoresMae = [
  {
    title: "Lojas Revendedoras Ativas",
    value: 13,
    icon: StoreIcon,
    tone: "success",
  },
  {
    title: "Produtos Sincronizados",
    value: 2941,
    icon: ProductIcon,
    tone: "info",
  },
  {
    title: "Pedidos nas Lojas Revendedoras",
    value: 107,
    icon: OrderIcon,
    tone: "highlight",
  },
  {
    title: "Erros/Pendências",
    value: 2,
    icon: AlertCircleIcon,
    tone: "critical",
  },
];

const indicadoresRevendedora = [
  {
    title: "Produtos Sincronizados",
    value: 97,
    icon: ProductIcon,
    tone: "success",
  },
  {
    title: "Pedidos",
    value: 7,
    icon: OrderIcon,
    tone: "info",
  },
  {
    title: "Última Sincronização",
    value: "Há 2h",
    icon: RefreshIcon,
    tone: "highlight",
  },
  {
    title: "Status da Loja",
    value: "Ativa",
    icon: CheckCircleIcon,
    tone: "success",
  },
];

// Mock de atividades recentes
const atividadesRecentesMae = [
  { text: "Sincronização concluída: Loja Bella Joias", date: "02/08, 10:14" },
  { text: "Nova revendedora aprovada: Pri Semijoias", date: "01/08, 19:42" },
  { text: "Produto atualizado: Colar Elo Grumet", date: "01/08, 15:02" },
  { text: "Sincronização falhou: Loja Luna Bijoux", date: "31/07, 23:16", error: true },
];

const atividadesRecentesRevendedora = [
  { text: "Importação de 13 produtos concluída", date: "02/08, 10:05" },
  { text: "Sincronização automática realizada", date: "01/08, 21:00" },
  { text: "Pedido #1092 sincronizado", date: "01/08, 17:15" },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [indicadores, setIndicadores] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [isLojaMae, setIsLojaMae] = useState(false);

  useEffect(() => {
    // Executa só no client
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      setIsLojaMae(host === "revenda-biju.myshopify.com");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setIndicadores(isLojaMae ? indicadoresMae : indicadoresRevendedora);
      setAtividades(isLojaMae ? atividadesRecentesMae : atividadesRecentesRevendedora);
      setLoading(false);
    }, 900);
  }, [isLojaMae]);

  return (
    <Frame>
      <Page
        title={isLojaMae ? "Dashboard — Loja Mãe" : "Dashboard da Revendedora"}
        subtitle={
          isLojaMae
            ? "Visão geral das operações, status das lojas e KPIs da plataforma."
            : "Acompanhe sua performance, sincronizações e pedidos em tempo real."
        }
        fullWidth
      >
        {loading ? (
          <SkeletonPage primaryAction>
            <Layout>
              <Layout.Section>
                <SkeletonDisplayText size="large" />
                <SkeletonBodyText lines={4} />
              </Layout.Section>
            </Layout>
          </SkeletonPage>
        ) : (
          <BlockStack gap="400">
            {/* KPIs principais */}
            <Grid columns={{ xs: 1, sm: 2, md: 4 }}>
              {indicadores.map((kpi) => (
                <Box key={kpi.title} padding="200">
                  <Card>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <Icon source={kpi.icon} tone={kpi.tone} />
                      <div>
                        <Text variant="bodySm" tone="subdued">
                          {kpi.title}
                        </Text>
                        <Text variant="headingLg" as="p">
                          {kpi.value}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Box>
              ))}
            </Grid>

            {/* Atividades Recentes */}
            <Card title="Atividades Recentes">
              {atividades.length === 0 ? (
                <EmptyState
                  heading="Nenhuma atividade registrada ainda"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/empty-state.svg"
                >
                  <p>Suas atividades recentes aparecerão aqui assim que houver movimentação na plataforma.</p>
                </EmptyState>
              ) : (
                <BlockStack gap="200">
                  {atividades.map((a, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Icon
                        source={a.error ? AlertCircleIcon : CheckCircleIcon}
                        tone={a.error ? "critical" : "success"}
                      />
                      <Text as="span">{a.text}</Text>
                      <Text as="span" tone="subdued" style={{ marginLeft: "auto" }}>
                        {a.date}
                      </Text>
                    </div>
                  ))}
                </BlockStack>
              )}
            </Card>

            {/* Ações rápidas / Ajuda */}
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="200">
                    <Text variant="headingMd">
                      <Icon source={QuestionCircleIcon} tone="base" /> Precisa de ajuda?
                    </Text>
                    <Button
                      variant="primary"
                      url={isLojaMae ? "/app/shops" : "/app/support"}
                    >
                      {isLojaMae ? "Ver lojas revendedoras" : "Falar com suporte"}
                    </Button>
                    {isLojaMae && (
                      <Button variant="secondary" url="/app/sync">
                        Sincronizar Catálogo Agora
                      </Button>
                    )}
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
          </BlockStack>
        )}
      </Page>
    </Frame>
  );
}