// apps/frontend/app/routes/app/sync.tsx
import {
  Page,
  Card,
  Banner,
  Button,
  Spinner,
  TextContainer,
  Stack,
  Icon,
  List,
} from "@shopify/polaris";
import {
  RefreshMajor,
  CircleTickMajor,
} from "@shopify/polaris-icons";
import { useState } from "react";

/**
 * Página de Sincronização de Catálogo [Classe Mundial]
 * - UX refinada, status detalhado, tratamento de erros, pronto para logs, SaaS e multi-idiomas.
 */
export default function SyncPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  // Handler de sincronização
  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setStatus("Sincronizando catálogo...");
    setLog([]);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      setStatus("Sincronização concluída!");
      setLog([
        "✔️ Catálogo sincronizado com sucesso.",
        ...(text ? [text] : []),
      ]);
    } catch (err: any) {
      setError("Erro ao sincronizar: " + (err.message || err.toString()));
      setStatus(null);
      setLog([
        "❌ Falha durante o processo.",
        err?.stack || "",
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page
      title="Sincronizar Catálogo"
      subtitle="Atualize os produtos das lojas revendedoras em tempo real."
    >
      <Card sectioned>
        <TextContainer>
          <p>
            Mantenha o catálogo das revendedoras 100% alinhado com a loja-mãe. A sincronização pode levar alguns minutos, dependendo do volume de produtos e das regras personalizadas de cada revenda.
          </p>
          <List>
            <List.Item>Sincroniza todos os produtos, variantes e estoque</List.Item>
            <List.Item>Respeita regras de markup de cada revenda</List.Item>
            <List.Item>Pronto para SaaS e expansão futura</List.Item>
          </List>
        </TextContainer>
        <div style={{
          marginTop: 32,
          display: "flex",
          gap: 24,
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          <Button
            onClick={handleSync}
            primary
            icon={RefreshMajor}
            disabled={loading}
            accessibilityLabel="Iniciar sincronização do catálogo"
            size="large"
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Spinner accessibilityLabel="Sincronizando..." size="small" />
                <span>Sincronizando...</span>
              </span>
            ) : (
              "Sincronizar Agora"
            )}
          </Button>

          {/* Status banner */}
          {!loading && status && !error && (
            <Banner
              status="success"
              icon={CircleTickMajor}
              title="Catálogo atualizado!"
            >
              <TextContainer>
                {status}
                {log.length > 0 && (
                  <List>
                    {log.map((item, idx) =>
                      <List.Item key={idx}>{item}</List.Item>
                    )}
                  </List>
                )}
              </TextContainer>
            </Banner>
          )}

          {error && (
            <Banner
              status="critical"
              title="Erro ao sincronizar"
              action={{ content: "Tentar novamente", onAction: handleSync }}
            >
              <TextContainer>
                {error}
                {log.length > 0 && (
                  <List>
                    {log.map((item, idx) =>
                      <List.Item key={idx}>{item}</List.Item>
                    )}
                  </List>
                )}
              </TextContainer>
            </Banner>
          )}
        </div>
      </Card>
    </Page>
  );
}