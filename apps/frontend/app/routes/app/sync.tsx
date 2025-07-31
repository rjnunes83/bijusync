// /apps/frontend/app/routes/app/sync.tsx
import { Page, Card, Banner, Button } from "@shopify/polaris";
import { useState } from "react";

export default function SyncPage() {
  const [status, setStatus] = useState<string | null>(null);

  const handleSync = async () => {
    setStatus("Sincronizando...");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      setStatus("Sincronização concluída com sucesso!");
    } catch (err: any) {
      setStatus("Erro ao sincronizar: " + err.message);
    }
  };

  return (
    <Page title="Sincronizar Catálogo">
      <Card sectioned>
        <Button onClick={handleSync} primary>
          Sincronizar Agora
        </Button>
        {status && (
          <Banner status={status.startsWith("Erro") ? "critical" : "success"}>
            {status}
          </Banner>
        )}
      </Card>
    </Page>
  );
}