// apps/frontend/app/routes/app.admin.tsx
import { useOutletContext } from "@remix-run/react";
import {
  Page,
  Card,
  Layout,
  Text,
  ResourceList,
  SkeletonPage,
  SkeletonBodyText
} from "@shopify/polaris";

// Types
interface LojaConectada {
  domain: string;
  status: "Ativa" | "Pendente" | "Inativa" | string;
  sync: "Ok" | "Falha" | string;
}

// Enterprise: Painel administrativo da loja-mãe (escalável, multi-loja)
export default function AdminPanel() {
  const { mainShopDomain } = useOutletContext<{ mainShopDomain: string }>();

  // TODO: Trocar para loading dinamico se precisar fetch real
  const loading = false;

  // TODO: Substituir para fetch real no backend
  const lojasConectadas: LojaConectada[] = [
    { domain: "revenda1.myshopify.com", status: "Ativa", sync: "Ok" },
    { domain: "revenda2.myshopify.com", status: "Pendente", sync: "Falha" }
  ];

  if (loading) {
    return (
      <SkeletonPage primaryAction title="Painel Administrativo - Loja-Mãe">
        <Card sectioned>
          <SkeletonBodyText />
        </Card>
      </SkeletonPage>
    );
  }

  return (
    <Page
      title="Painel Administrativo - Loja-Mãe"
      subtitle={`Gestão centralizada (${mainShopDomain})`}
      fullWidth
    >
      <Layout>
        <Layout.Section>
          <Card sectioned title="Bem-vindo ao Painel da Loja-Mãe">
            <Text as="h2" variant="headingMd">
              Gerencie todas as suas revendas Shopify em um só lugar!
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Visualize métricas, auditorias, status das lojas conectadas, e inicie sincronizações globais.
            </Text>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned title="Resumo da Operação">
            <div style={{
              display: "flex",
              gap: 40,
              justifyContent: "start",
              flexWrap: "wrap",
              marginBottom: 16
            }}>
              <Metric title="Lojas Conectadas" value={lojasConectadas.length} />
              <Metric title="Sincronizações Hoje" value={8} />
              <Metric title="Erros Detectados" value={1} status="critical" />
              {/* Ganchos para mais métricas (ex: vendas, uptime, logins, etc) */}
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned title="Lojas conectadas">
            <ResourceList
              resourceName={{ singular: "loja", plural: "lojas" }}
              items={lojasConectadas}
              renderItem={(item: LojaConectada) => (
                <ResourceList.Item id={item.domain} accessibilityLabel={`Detalhes da loja ${item.domain}`}>
                  <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 18,
                    flexWrap: "wrap"
                  }}>
                    <Text variant="bodyStrong">{item.domain}</Text>
                    <StatusPill status={item.status} />
                    <Text color={item.sync === "Ok" ? "success" : "critical"}>
                      {item.sync === "Ok" ? "Sincronizada" : "Falha na sync"}
                    </Text>
                    {/* Ganchos para ações (ex: botão de detalhes, re-sync, logs, etc) */}
                  </div>
                </ResourceList.Item>
              )}
              // Placeholder para loading futuro
              loading={loading}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// --- COMPONENTES REUTILIZÁVEIS (ENTERPRISE-READY) ---

type MetricStatus = "default" | "critical" | "success";
interface MetricProps {
  title: string;
  value: number | string;
  status?: MetricStatus;
}
function Metric({ title, value, status = "default" }: MetricProps) {
  const color =
    status === "critical"
      ? "#B00020"
      : status === "success"
      ? "#007F5F"
      : "#313133";
  return (
    <div style={{
      minWidth: 120,
      padding: 16,
      background: "#F7F7F8",
      borderRadius: 12,
      textAlign: "center",
      boxShadow: "0 2px 8px #b0002010"
    }}>
      <div style={{ color, fontSize: 34, fontWeight: 700, marginBottom: 2 }}>
        {value}
      </div>
      <div style={{ color: "#888", fontSize: 15 }}>{title}</div>
    </div>
  );
}

interface StatusPillProps {
  status: string;
}
function StatusPill({ status }: StatusPillProps) {
  let color, label;
  switch (status) {
    case "Ativa":
      color = "#007F5F";
      label = "Ativa";
      break;
    case "Pendente":
      color = "#FFD600";
      label = "Pendente";
      break;
    case "Inativa":
      color = "#B00020";
      label = "Inativa";
      break;
    default:
      color = "#B6B6B6";
      label = status;
  }
  return (
    <span style={{
      background: color,
      color: "#fff",
      borderRadius: 8,
      padding: "2px 12px",
      fontWeight: 600,
      fontSize: 13
    }}>
      {label}
    </span>
  );
}