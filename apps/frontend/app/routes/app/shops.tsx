// /apps/frontend/app/routes/app/shops.tsx
import { useEffect, useState } from "react";
import { Page, Card, DataTable, Spinner, Banner } from "@shopify/polaris";

export default function ShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  const rows = shops.map((shop) => [
    shop.shopify_domain,
    shop.created_at ? new Date(shop.created_at).toLocaleString() : "",
    shop.updated_at ? new Date(shop.updated_at).toLocaleString() : "",
    shop.access_token ? "Ativo" : "Inativo",
  ]);

  return (
    <Page title="Lojas Conectadas">
      {loading && <Spinner />}
      {error && <Banner status="critical">{error}</Banner>}
      {!loading && !error && (
        <Card>
          <DataTable
            columnContentTypes={["text", "text", "text", "text"]}
            headings={["Domínio", "Criada em", "Atualizada em", "Status"]}
            rows={rows}
          />
        </Card>
      )}
    </Page>
  );
}