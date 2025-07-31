// apps/frontend/app/routes/app.admin.tsx
import { useOutletContext } from "@remix-run/react";
import { Page, Card, Layout, Text, ResourceList, SkeletonPage, SkeletonBodyText } from "@shopify/polaris";

/**
 * Painel administrativo da loja-mãe.
 * Pronto para evolução: cards de métricas, auditoria, gestão multi-loja.
 * O contexto fornece domínio da loja principal (mainShopDomain).
 */
export default function DashboardAdmin() {
  const { mainShopDomain } = useOutletContext<{ mainShopDomain: string }>();

  // Mock para loading/futuro fetch (exemplo enterprise)
  const loading = false; // Troque para estado real se precisar
  const lojasConectadas = [
    { domain: "revenda1.myshopify.com", status: "Ativa", sync: "Ok" },
    { domain: "revenda2.myshopify.com", status: "Pendente", sync: "Falha" }
  ]; // Troque para fetch real depois

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
    <Page title="Painel Administrativo - Loja-Mãe" subtitle={`Gestão centralizada (${mainShopDomain})`}>
      <Layout>
        <Layout.Section>
          <Card title="Bem-vindo ao Painel da Loja-Mãe" sectioned>
            <Text variant="headingMd" as="h2">
              Gerencie todas as suas revendas Shopify num só lugar!
            </Text>
            <Text>
              Visualize métricas, auditoria, status das lojas conectadas e inicie sincronizações globais.
            </Text>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Resumo da Operação" sectioned>
            <div style={{ display: "flex", gap: 40, justifyContent: "start", marginBottom: 16 }}>
              <Metric title="Lojas Conectadas" value={lojasConectadas.length} />
              <Metric title="Sincronizações hoje" value={8} />
              <Metric title="Erros detectados" value={1} status="critical" />
              {/* Adicione mais métricas aqui */}
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Lojas conectadas" sectioned>
            <ResourceList
              resourceName={{ singular: 'loja', plural: 'lojas' }}
              items={lojasConectadas}
              renderItem={(item) => (
                <ResourceList.Item id={item.domain} accessibilityLabel={`Detalhes da loja ${item.domain}`}>
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 16 }}>
                    <Text variant="bodyStrong">{item.domain}</Text>
                    <StatusPill status={item.status} />
                    <Text color={item.sync === "Ok" ? "success" : "critical"}>
                      {item.sync === "Ok" ? "Sincronizada" : "Falha na sync"}
                    </Text>
                  </div>
                </ResourceList.Item>
              )}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// --- COMPONENTES ENTERPRISE ISOLADOS ---

/**
 * Componente de métrica para painéis
 */
function Metric({ title, value, status = "default" }: { title: string, value: number | string, status?: "default" | "critical" | "success" }) {
  const color = status === "critical" ? "#B00020" : status === "success" ? "#007F5F" : "#313133";
  return (
    <div style={{
      minWidth: 120, padding: 16, background: "#F7F7F8", borderRadius: 12,
      textAlign: "center", boxShadow: "0 2px 8px #b0002010"
    }}>
      <div style={{ color, fontSize: 34, fontWeight: 700, marginBottom: 2 }}>{value}</div>
      <div style={{ color: "#888", fontSize: 15 }}>{title}</div>
    </div>
  );
}

/**
 * Pill/Status visual para status das lojas (enterprise ready)
 */
function StatusPill({ status }: { status: string }) {
  let color, label;
  switch (status) {
    case "Ativa": color = "#007F5F"; label = "Ativa"; break;
    case "Pendente": color = "#FFD600"; label = "Pendente"; break;
    case "Inativa": color = "#B00020"; label = "Inativa"; break;
    default: color = "#B6B6B6"; label = status;
  }
  return (
    <span style={{
      background: color, color: "#fff", borderRadius: 8, padding: "2px 12px", fontWeight: 600, fontSize: 13
    }}>{label}</span>
  );
}