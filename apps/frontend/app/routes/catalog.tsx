import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import { Card, Page, DataTable, TextField, Button, Filters, Pagination, Toast } from "@shopify/polaris";
import { useState } from "react";

// Loader chama a API do backend para trazer os produtos da loja-mãe
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || 1);
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";

  // Pega a URL base do .env ou usa o endereço local padrão
  const baseUrl =
    process.env.BASE_URL || "http://localhost:55072";

  const apiUrl = `${baseUrl}/api/catalog?page=${page}&search=${search}&category=${category}`;
  const response = await fetch(apiUrl);
  const data = await response.json();

  return json(data); // { products, totalPages, categories }
}

export default function Catalog() {
  const { products, totalPages, categories } = useLoaderData<typeof loader>();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const navigation = useNavigation();

  // Selecionar/Deselecionar produtos
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Importar selecionados
  const handleImport = async () => {
    await fetch("/import", {
      method: "POST",
      body: JSON.stringify({ productIds: selectedProducts }),
      headers: { "Content-Type": "application/json" },
    });
    setShowToast(true);
    setSelectedProducts([]);
  };

  // DataTable Polaris
  const rows = products.map((product: any) => [
    <input
      type="checkbox"
      checked={selectedProducts.includes(product.id)}
      onChange={() => handleSelectProduct(product.id)}
    />,
    <img src={product.image} alt={product.title} width={40} />,
    product.title,
    product.category,
    product.price ? `€${product.price.toFixed(2)}` : "",
  ]);

  // Filtros Polaris
  const filters = [
    {
      key: "category",
      label: "Categoria",
      filter: (
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas</option>
          {categories.map((cat: string) => (
            <option value={cat} key={cat}>
              {cat}
            </option>
          ))}
        </select>
      ),
      shortcut: true,
    },
  ];

  return (
    <Page title="Catálogo de Produtos">
      <Card sectioned>
        <Form method="get">
          <Filters
            queryValue={search}
            filters={filters}
            onQueryChange={setSearch}
            onClearAll={() => {
              setSearch("");
              setCategory("");
            }}
          />
        </Form>
        <DataTable
          columnContentTypes={["text", "image", "text", "text", "text"]}
          headings={["Selecionar", "Imagem", "Produto", "Categoria", "Preço"]}
          rows={rows}
        />
        <Button
          onClick={handleImport}
          disabled={selectedProducts.length === 0 || navigation.state === "submitting"}
          primary
        >
          Importar para minha loja ({selectedProducts.length})
        </Button>
        <Pagination
          hasPrevious={activePage > 1}
          onPrevious={() => setActivePage((p) => Math.max(p - 1, 1))}
          hasNext={activePage < totalPages}
          onNext={() => setActivePage((p) => p + 1)}
        />
      </Card>
      {showToast && <Toast content="Produtos importados com sucesso!" onDismiss={() => setShowToast(false)} />}
    </Page>
  );
}