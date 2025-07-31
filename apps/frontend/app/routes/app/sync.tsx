// /apps/frontend/app/routes/app/sync.tsx
import { Page, Card, Banner, Button, Spinner, TextContainer } from "@shopify/polaris";
import { useState } from "react";

/**
 * Página de sincronização de catálogo [Enterprise Ready].
 * Inclui UX aprimorada, loading, tratamento de erros e extensibilidade.
 */
export default function SyncPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setStatus("Sincronizando...");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      setStatus("Sincronização concluída com sucesso!");
    } catch (err: any) {
      setError("Erro ao sincronizar: " + (err.message || err.toString()));
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Sincronizar Catálogo" subtitle="Atualize instantaneamente os produtos nas lojas revendedoras.">
      <Card sectioned>
        <TextContainer>
          <p>
            Clique em <b>Sincronizar Agora</b> para importar ou atualizar o catálogo da loja-mãe em todas as revendas conectadas.
            Esse processo pode demorar alguns minutos dependendo do volume de produtos.
          </p>
        </TextContainer>
        <div style={{ margin: "32px 0 0 0", display: "flex", gap: 24, alignItems: "center" }}>
          <Button onClick={handleSync} primary disabled={loading}>
            {loading ? <Spinner accessibilityLabel="Sincronizando..." size="small" /> : "Sincronizar Agora"}
          </Button>
          {status && !loading && (
            <Banner status="success" title="Sincronização realizada!">
              {status}
            </Banner>
          )}
          {error && (
            <Banner
              status="critical"
              title="Ocorreu um erro"
              action={{ content: "Tentar novamente", onAction: handleSync }}
            >
              <TextContainer>{error}</TextContainer>
            </Banner>
          )}
        </div>
      </Card>
    </Page>
  );
}