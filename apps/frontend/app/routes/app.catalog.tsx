// apps/frontend/app/routes/app.catalog.tsx

import {
  Page,
  Layout,
  BlockStack,
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Thumbnail,
  Badge,
  Pagination,
  Button,
  Select,
  TextField,
  Filters,
  Spinner,
  Banner,
  Toast,
  SkeletonDisplayText,
  SkeletonBodyText,
  SkeletonThumbnail,
  AppProvider as PolarisAppProvider,
} from "@shopify/polaris";
import { useState, useEffect, useCallback } from "react";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import ptBR from "../locales/pt-BR.json";
import en from "../locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// Polaris Styles
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

// --- ENTERPRISE: Loader para internacionalização
function detectLocale(request: Request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang");
  if (lang === "en") return "en";
  if (lang === "pt-BR") return "pt-BR";
  const acceptLanguage = request.headers.get("accept-language") || "";
  if (acceptLanguage.includes("en")) return "en";
  return "pt-BR";
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = detectLocale(request);
  const i18n = locale === "en" ? en : ptBR;
  return json({ i18n, locale });
};

// --- Categorias disponíveis para filtro (pode vir do backend futuro)
const categorias = [
  { label: "Todos", value: "" },
  { label: "Brincos", value: "Brincos" },
  { label: "Pulseiras", value: "Pulseiras" },
  { label: "Anéis", value: "Anéis" },
  { label: "Colares", value: "Colares" },
];

// Filtros
function ProductFilters({
  categoria,
  setCategoria,
  sku,
  setSku,
  precoMin,
  setPrecoMin,
  precoMax,
  setPrecoMax,
  disponibilidade,
  setDisponibilidade,
  onClearAll,
  i18n,
}) {
  return (
    <Filters
      queryValue={sku}
      filters={[
        {
          key: "categoria",
          label: i18n.filterCategory,
          filter: (
            <Select
              label={i18n.filterCategory}
              options={categorias}
              onChange={setCategoria}
              value={categoria}
            />
          ),
        },
        {
          key: "precoMin",
          label: i18n.filterPriceMin,
          filter: (
            <TextField
              label={i18n.filterPriceMin}
              type="number"
              value={precoMin}
              onChange={setPrecoMin}
              autoComplete="off"
              suffix={i18n.priceSuffix}
            />
          ),
        },
        {
          key: "precoMax",
          label: i18n.filterPriceMax,
          filter: (
            <TextField
              label={i18n.filterPriceMax}
              type="number"
              value={precoMax}
              onChange={setPrecoMax}
              autoComplete="off"
              suffix={i18n.priceSuffix}
            />
          ),
        },
        {
          key: "disponibilidade",
          label: i18n.filterAvailability,
          filter: (
            <Select
              label={i18n.filterAvailability}
              options={[
                { label: i18n.availabilityAll, value: "" },
                { label: i18n.availabilityAvailable, value: "disponivel" },
                { label: i18n.availabilityUnavailable, value: "indisponivel" },
              ]}
              onChange={setDisponibilidade}
              value={disponibilidade}
            />
          ),
        },
      ]}
      onQueryChange={setSku}
      queryPlaceholder={i18n.searchSKU}
      onQueryClear={() => setSku("")}
      onClearAll={onClearAll}
    />
  );
}

// Exibição do produto
function ProductCard({ item, onImport, i18n }) {
  return (
    <ResourceItem
      id={item.id}
      media={
        <Thumbnail
          source={item.image}
          alt={item.title}
          size="large"
          transparent
          loading="lazy"
        />
      }
      accessibilityLabel={`Ver detalhes para ${item.title}`}
    >
      <Text variant="headingMd">{item.title}</Text>
      <div>
        <Text as="span" tone="subdued">
          {i18n.sku}: {item.sku}
        </Text>
        <Text as="span" tone="subdued" style={{ marginLeft: 10 }}>
          {i18n.category}: {item.category}
        </Text>
      </div>
      <div>
        <Badge tone={item.available ? "success" : "critical"}>
          {item.available ? i18n.available : i18n.unavailable}
        </Badge>
        <Text
          as="span"
          style={{ marginLeft: 16, fontWeight: 700, fontSize: 16 }}
        >
          {i18n.priceSuffix} {item.price.toFixed(2)}
        </Text>
      </div>
      <Button
        variant="primary"
        disabled={!item.available}
        onClick={() => onImport(item)}
        style={{ marginTop: 8 }}
      >
        {i18n.importProduct}
      </Button>
    </ResourceItem>
  );
}

// Skeleton loader para UX top
function ProductSkeleton() {
  return (
    <Card>
      <ResourceList
        items={[...Array(3).keys()]}
        renderItem={() => (
          <ResourceItem
            id="loading"
            media={<SkeletonThumbnail size="large" />}
            accessibilityLabel="Carregando produto"
          >
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={2} />
          </ResourceItem>
        )}
      />
    </Card>
  );
}

export default function CatalogPage() {
  const { i18n } = useLoaderData<typeof loader>();

  const [produtos, setProdutos] = useState<any[]>([]);
  const [categoria, setCategoria] = useState("");
  const [sku, setSku] = useState("");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UX: Toast para sucesso na importação
  const [toastActive, setToastActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Paginação
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Carrega produtos do localStorage só no navegador (corrige erro SSR)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("produtos");
        if (saved) setProdutos(JSON.parse(saved));
      } catch (e) {
        // Apenas loga o erro, não quebra a aplicação
        console.error("Erro ao ler produtos do localStorage:", e);
      }
    }
  }, []);

  // Salva no localStorage quando produtos mudam (safe, só no cliente)
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("produtos", JSON.stringify(produtos));
    }
  }, [produtos]);

  // Busca dos produtos (mock e fallback)
  useEffect(() => {
    async function fetchProdutos() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/catalog");
        if (!response.ok) throw new Error(`Erro na requisição: ${response.statusText}`);
        const data = await response.json();
        setProdutos(data);
      } catch (err: any) {
        setProdutos([
          {
            id: "1",
            title: "Brinco Dourado Luxo",
            category: "Brincos",
            sku: "BR-001",
            price: 59.9,
            available: true,
            image: "https://cdn.biju.store/img/brinco.jpg",
          },
          {
            id: "2",
            title: "Pulseira Pérola Elegance",
            category: "Pulseiras",
            sku: "PU-002",
            price: 79.0,
            available: false,
            image: "https://cdn.biju.store/img/pulseira.jpg",
          },
        ]);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchProdutos();
  }, []);

  // Filtros aplicados
  const produtosFiltrados = produtos.filter((p) => {
    return (
      (categoria === "" || p.category === categoria) &&
      (sku === "" || p.sku.toLowerCase().includes(sku.toLowerCase())) &&
      (precoMin === "" || p.price >= Number(precoMin)) &&
      (precoMax === "" || p.price <= Number(precoMax)) &&
      (disponibilidade === "" ||
        (disponibilidade === "disponivel" && p.available) ||
        (disponibilidade === "indisponivel" && !p.available))
    );
  });

  // Paginação
  const paginatedProdutos = produtosFiltrados.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Pagination handlers
  const handlePreviousPage = () => setPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () =>
    setPage((p) =>
      p * pageSize < produtosFiltrados.length ? p + 1 : p
    );

  // Limpa todos os filtros
  const handleClearAllFilters = () => {
    setCategoria("");
    setSku("");
    setPrecoMin("");
    setPrecoMax("");
    setDisponibilidade("");
  };

  // Importação com feedback
  const handleImportProduct = useCallback((item) => {
    setToastMsg(`"${item.title}" ${i18n.successImport}`);
    setToastActive(true);
    // Aqui entra a lógica real de importação futuramente
  }, [i18n]);

  return (
    <PolarisAppProvider i18n={i18n}>
      <Page title={i18n.title}>
        <Card>
          <BlockStack gap="400">
            <Layout>
              <Layout.Section>
                <ProductFilters
                  categoria={categoria}
                  setCategoria={setCategoria}
                  sku={sku}
                  setSku={setSku}
                  precoMin={precoMin}
                  setPrecoMin={setPrecoMin}
                  precoMax={precoMax}
                  setPrecoMax={setPrecoMax}
                  disponibilidade={disponibilidade}
                  setDisponibilidade={setDisponibilidade}
                  onClearAll={handleClearAllFilters}
                  i18n={i18n}
                />
              </Layout.Section>
            </Layout>
            {/* Estado de loading */}
            {loading && <ProductSkeleton />}
            {/* Estado de erro */}
            {error && (
              <Banner status="critical" title={i18n.error}>
                <p>{error}</p>
              </Banner>
            )}
            {/* Lista de produtos */}
            {!loading && !error && (
              <>
                <ResourceList
                  items={paginatedProdutos}
                  renderItem={(item) => (
                    <ProductCard item={item} onImport={handleImportProduct} i18n={i18n} />
                  )}
                />
                <Pagination
                  hasPrevious={page > 1}
                  hasNext={page * pageSize < produtosFiltrados.length}
                  onPrevious={handlePreviousPage}
                  onNext={handleNextPage}
                  previousTooltip={i18n.prev}
                  nextTooltip={i18n.next}
                />
              </>
            )}
          </BlockStack>
        </Card>
      </Page>
      {toastActive && (
        <Toast content={toastMsg} onDismiss={() => setToastActive(false)} />
      )}
    </PolarisAppProvider>
  );
}