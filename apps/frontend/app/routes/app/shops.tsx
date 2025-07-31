// apps/frontend/app/routes/app/shops.tsx
import { useEffect, useState } from "react";
import {
  Page,
  Card,
  DataTable,
  Spinner,
  Banner,
  EmptyState,
  TextContainer
} from "@shopify/polaris";

/**
 * Lista de lojas conectadas à plataforma.
 * [Enterprise] Pronto para paginação, filtro e exportação futura.
 */
export default function ShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/shops")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setShops(data.shops || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.toString());
        setLoading(false);
      });
  }, []);

  // [Enterprise] Formatação robusta e extensível do DataTable
  const rows = shops.map((shop) => [
    shop.shopify_domain,
    shop.created_at ? new Date(shop.created_at).toLocaleString() : "—",
    shop.updated_at ? new Date(shop.updated_at).toLocaleString() : "—",
    shop.access_token ? "Ativo" : "Inativo",
  ]);

  return (
    <Page
      title="Lojas Conectadas"
      subtitle="Acompanhe todas as lojas integradas ao seu ecossistema."
      fullWidth
    >
      {loading && (
        <Card sectioned>
          <Spinner size="large" accessibilityLabel="Carregando lojas..." />
        </Card>
      )}

      {error && (
        <Banner status="critical" title="Erro ao carregar lojas" action={{ content: "Tentar novamente", onAction: () => window.location.reload() }}>
          <TextContainer>{error}</TextContainer>
        </Banner>
      )}

      {!loading && !error && (
        shops.length === 0 ? (
          <EmptyState
            heading="Nenhuma loja conectada ainda"
            action={{ content: "Conectar nova loja", url: "/app/onboarding" }}
            image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
          >
            <p>Adicione sua primeira loja para começar a sincronizar produtos!</p>
          </EmptyState>
        ) : (
          <Card sectioned title="Lojas integradas">
            <DataTable
              columnContentTypes={["text", "text", "text", "text"]}
              headings={["Domínio", "Criada em", "Atualizada em", "Status"]}
              rows={rows}
              // [Enterprise] Adapte para paginação/ações se necessário
            />
          </Card>
        )
      )}
    </Page>
  );
}