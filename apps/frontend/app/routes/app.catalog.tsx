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
} from "@shopify/polaris";
import { useState, useEffect, useCallback } from "react";

// Categorias disponíveis para filtro
const categorias = [
  { label: "Todos", value: "" },
  { label: "Brincos", value: "Brincos" },
  { label: "Pulseiras", value: "Pulseiras" },
  { label: "Anéis", value: "Anéis" },
  { label: "Colares", value: "Colares" },
];

// Componente para filtro de produtos
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
}) {
  return (
    <Filters
      queryValue={sku}
      filters={[
        {
          key: "categoria",
          label: "Categoria",
          filter: (
            <Select
              label="Categoria"
              options={categorias}
              onChange={setCategoria}
              value={categoria}
            />
          ),
        },
        {
          key: "precoMin",
          label: "Preço mínimo",
          filter: (
            <TextField
              label="Preço mínimo"
              type="number"
              value={precoMin}
              onChange={setPrecoMin}
              autoComplete="off"
              suffix="R$"
            />
          ),
        },
        {
          key: "precoMax",
          label: "Preço máximo",
          filter: (
            <TextField
              label="Preço máximo"
              type="number"
              value={precoMax}
              onChange={setPrecoMax}
              autoComplete="off"
              suffix="R$"
            />
          ),
        },
        {
          key: "disponibilidade",
          label: "Disponibilidade",
          filter: (
            <Select
              label="Disponibilidade"
              options={[
                { label: "Todas", value: "" },
                { label: "Disponível", value: "disponivel" },
                { label: "Indisponível", value: "indisponivel" },
              ]}
              onChange={setDisponibilidade}
              value={disponibilidade}
            />
          ),
        },
      ]}
      onQueryChange={setSku}
      queryPlaceholder="Buscar por SKU"
      onQueryClear={() => setSku("")}
      onClearAll={onClearAll}
    />
  );
}

// Componente para exibir cada produto em formato card
function ProductCard({ item, onImport }) {
  return (
    <ResourceItem
      id={item.id}
      media={<Thumbnail source={item.image} alt={item.title} size="large" />}
      accessibilityLabel={`Ver detalhes para ${item.title}`}
    >
      <Text variant="headingMd">{item.title}</Text>
      <div>
        <Text as="span" tone="subdued">
          SKU: {item.sku}
        </Text>
        <Text as="span" tone="subdued" style={{ marginLeft: 10 }}>
          Categoria: {item.category}
        </Text>
      </div>
      <div>
        <Badge tone={item.available ? "success" : "critical"}>
          {item.available ? "Disponível" : "Indisponível"}
        </Badge>
        <Text
          as="span"
          style={{ marginLeft: 16, fontWeight: 700, fontSize: 16 }}
        >
          R$ {item.price.toFixed(2)}
        </Text>
      </div>
      <Button
        variant="primary"
        disabled={!item.available}
        onClick={() => onImport(item)}
        style={{ marginTop: 8 }}
      >
        Importar produto
      </Button>
    </ResourceItem>
  );
}

export default function CatalogPage() {
  // Estados de produtos, filtros, paginação, loading e erro
  const [produtos, setProdutos] = useState([]);
  const [categoria, setCategoria] = useState("");
  const [sku, setSku] = useState("");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paginação futura (plugável)
  const [page, setPage] = useState(1);
  const pageSize = 10; // número de itens por página

  // Função para importar produto (separada para escalabilidade)
  const handleImportProduct = useCallback((item) => {
    alert(`Importar produto ${item.title}`);
  }, []);

  // Busca os produtos da API simulada
  useEffect(() => {
    async function fetchProdutos() {
      setLoading(true);
      setError(null);
      try {
        // Simulação de fetch para /api/catalog
        const response = await fetch("/api/catalog");
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.statusText}`);
        }
        const data = await response.json();
        setProdutos(data);
      } catch (err) {
        // Caso a API não exista, simula dados mock
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
          // Pode adicionar mais produtos mock aqui se desejar
        ]);
        // Também registra o erro para exibir banner
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProdutos();
  }, []);

  // Filtra produtos conforme filtros aplicados
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

  // Paginação dos produtos filtrados
  const paginatedProdutos = produtosFiltrados.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Funções para controle da paginação
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

  return (
    <Page title="Catálogo de Produtos">
      <Card>
        <BlockStack gap="400">
          {/* Filtros de produtos */}
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
              />
            </Layout.Section>
          </Layout>

          {/* Estado de loading */}
          {loading && (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <Spinner accessibilityLabel="Carregando produtos" size="large" />
            </div>
          )}

          {/* Estado de erro */}
          {error && (
            <Banner status="critical" title="Erro ao carregar produtos">
              <p>{error}</p>
            </Banner>
          )}

          {/* Lista de produtos */}
          {!loading && !error && (
            <>
              <ResourceList
                items={paginatedProdutos}
                renderItem={(item) => (
                  <ProductCard item={item} onImport={handleImportProduct} />
                )}
              />

              {/* Paginação plugável */}
              <Pagination
                hasPrevious={page > 1}
                hasNext={page * pageSize < produtosFiltrados.length}
                onPrevious={handlePreviousPage}
                onNext={handleNextPage}
              />
            </>
          )}
        </BlockStack>
      </Card>
    </Page>
  );
}