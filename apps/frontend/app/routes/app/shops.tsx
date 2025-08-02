// apps/frontend/app/routes/app/shops.tsx
import { useEffect, useState } from "react";
import {
  Page,
  Card,
  DataTable,
  Spinner,
  Banner,
  EmptyState,
  TextContainer,
  Button,
} from "@shopify/polaris";

/**
 * [Enterprise] Tipagem da loja conectada
 */
type Shop = {
  shopify_domain: string;
  created_at?: string;
  updated_at?: string;
  access_token?: string;
};

/**
 * Enterprise: Lista de lojas conectadas à plataforma
 */
export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch robusto (Enterprise Ready)
  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch("/api/shops")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (active) setShops(data.shops || []);
      })
      .catch((err) => {
        if (active) setError(err.toString());
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false };
  }, []);

  // Formatação robusta e extensível
  const rows = shops.map((shop) => [
    shop.shopify_domain,
    shop.created_at ? new Date(shop.created_at).toLocaleString() : "—",
    shop.updated_at ? new Date(shop.updated_at).toLocaleString() : "—",
    shop.access_token ? "Ativo" : "Inativo",
  ]);

  // Modularização dos estados de tela
  function renderContent() {
    if (loading) {
      return (
        <Card sectioned>
          <Spinner size="large" accessibilityLabel="Carregando lojas..." />
        </Card>
      );
    }

    if (error) {
      return (
        <Banner
          status="critical"
          title="Erro ao carregar lojas"
          action={{
            content: "Tentar novamente",
            onAction: () => window.location.reload(),
          }}
        >
          <TextContainer>
            {error}
            <br />
            Se o problema persistir, contate o suporte técnico.
          </TextContainer>
        </Banner>
      );
    }

    if (shops.length === 0) {
      return (
        <EmptyState
          heading="Nenhuma loja conectada ainda"
          action={{
            content: "Conectar nova loja",
            url: "/app/onboarding",
            accessibilityLabel: "Conectar uma nova loja Shopify",
          }}
          image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
          imageAlt="Nenhuma loja conectada"
        >
          <p>
            Adicione sua primeira loja para começar a sincronizar produtos e automatizar processos em todo o seu ecossistema.
          </p>
        </EmptyState>
      );
    }

    return (
      <Card sectioned title="Lojas integradas" actions={[
        { content: "Conectar nova loja", url: "/app/onboarding", primary: true }
      ]}>
        <DataTable
          columnContentTypes={["text", "text", "text", "text"]}
          headings={["Domínio", "Criada em", "Atualizada em", "Status"]}
          rows={rows}
          // Pronto para paginação, filtros e ações em massa no futuro!
        />
      </Card>
    );
  }

  return (
    <Page
      title="Lojas Conectadas"
      subtitle="Acompanhe todas as lojas integradas ao seu ecossistema Biju Sync."
      fullWidth
    >
      {renderContent()}
    </Page>
  );
}