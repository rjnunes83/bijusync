// apps/frontend/app/routes/app.admin.tsx

import { useOutletContext, useLoaderData } from "@remix-run/react";
import {
  Page,
  Card,
  Layout,
  Text,
  ResourceList,
  SkeletonPage,
  SkeletonBodyText,
  AppProvider as PolarisAppProvider,
} from "@shopify/polaris";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import ptBR from "../locales/pt-BR.json";
import en from "../locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// --- ENTERPRISE: links Polaris ---
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

// --- ENTERPRISE: Loader para traduções ---
function detectLocale(request: Request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang");
  if (lang === "en") return "en";
  if (lang === "pt-BR") return "pt-BR";
  const acceptLanguage = request.headers.get("accept-language") || "";
  if (acceptLanguage.includes("en")) return "en";
  return "pt-BR";
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Você pode expandir para buscar métricas reais via API/backend aqui no futuro
  const locale = detectLocale(request);
  const i18n = locale === "en" ? en : ptBR;
  return json({ i18n, locale });
}

// Types
interface LojaConectada {
  domain: string;
  status: "Ativa" | "Pendente" | "Inativa" | string;
  sync: "Ok" | "Falha" | string;
}

// --- PAINEL ADMIN ---
export default function AdminPanel() {
  // Pega o contexto do Outlet, mas funciona mesmo se não houver (acesso direto)
  const outletContext = useOutletContext<{ mainShopDomain?: string }>();
  const { i18n } = useLoaderData<typeof loader>();
  const mainShopDomain = outletContext?.mainShopDomain || "revenda-biju.myshopify.com";

  // TODO: Trocar para loading dinamico se precisar fetch real
  const loading = false;

  // TODO: Substituir para fetch real no backend
  const lojasConectadas: LojaConectada[] = [
    { domain: "revenda1.myshopify.com", status: "Ativa", sync: "Ok" },
    { domain: "revenda2.myshopify.com", status: "Pendente", sync: "Falha" }
  ];

  // Garantia: Sempre Polaris AppProvider, nunca erro de contexto
  return (
    <PolarisAppProvider i18n={i18n}>
      {loading ? (
        <SkeletonPage primaryAction title="Painel Administrativo - Loja-Mãe">
          <Card sectioned>
            <SkeletonBodyText />
          </Card>
        </SkeletonPage>
      ) : (
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
                  loading={loading}
                />
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
      )}
    </PolarisAppProvider>
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