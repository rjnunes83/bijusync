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
} from "@shopify/polaris";
import { useState } from "react";

// Mock de produtos - apenas local!
const produtosMock = [
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
  // Adicione mais produtos mock conforme necessário
];

const categorias = [
  { label: "Todos", value: "" },
  { label: "Brincos", value: "Brincos" },
  { label: "Pulseiras", value: "Pulseiras" },
  { label: "Anéis", value: "Anéis" },
  { label: "Colares", value: "Colares" },
];

export default function CatalogPage() {
  const [produtos, setProdutos] = useState(produtosMock);
  const [categoria, setCategoria] = useState("");
  const [sku, setSku] = useState("");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");

  // Filtros dinâmicos
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

  return (
    <Page title="Catálogo de Produtos">
      <Card>
        <BlockStack gap="400">
          {/* Filtros */}
          <Layout>
            <Layout.Section>
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
                onClearAll={() => {
                  setCategoria("");
                  setSku("");
                  setPrecoMin("");
                  setPrecoMax("");
                  setDisponibilidade("");
                }}
              />
            </Layout.Section>
          </Layout>

          {/* Lista de Produtos */}
          <ResourceList
            items={produtosFiltrados}
            renderItem={(item) => (
              <ResourceItem
                id={item.id}
                media={
                  <Thumbnail source={item.image} alt={item.title} size="large" />
                }
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
                  onClick={() => alert("Importar produto " + item.title)}
                  style={{ marginTop: 8 }}
                >
                  Importar produto
                </Button>
              </ResourceItem>
            )}
          />

          {/* Paginação (futuro) */}
          <Pagination
            hasPrevious={false}
            hasNext={false}
            onPrevious={() => {}}
            onNext={() => {}}
          />
        </BlockStack>
      </Card>
    </Page>
  );
}