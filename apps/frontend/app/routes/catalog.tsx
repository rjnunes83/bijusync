import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useSubmit } from "@remix-run/react";
import { Card, Page, DataTable, TextField, Button, Filters, Pagination, Toast, Banner } from "@shopify/polaris";
import { useState, useEffect } from "react";

type Product = {
  id: string;
  image?: string;
  title: string;
  category: string;
  price?: number;
};

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
  const { products, totalPages, categories } = useLoaderData<{ products: Product[]; totalPages: number; categories: string[] }>();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const submit = useSubmit();

  // Sincroniza os estados de search, category e activePage com a URL e loader
  useEffect(() => {
    const formData = new FormData();
    formData.set("search", search);
    formData.set("category", category);
    formData.set("page", activePage.toString());
    submit(formData, { method: "get" });
  }, [search, category, activePage, submit]);

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
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/import", {
        method: "POST",
        body: JSON.stringify({ productIds: selectedProducts }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro na importação");
      }
      setShowToast(true);
      setSelectedProducts([]);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // DataTable Polaris
  const rows = products.map((product) => [
    <input
      type="checkbox"
      checked={selectedProducts.includes(product.id)}
      onChange={() => handleSelectProduct(product.id)}
    />,
    <img src={product.image || "https://via.placeholder.com/40"} alt={product.title} width={40} />,
    product.title,
    product.category,
    product.price !== undefined ? `€${product.price.toFixed(2)}` : "",
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
          <input type="hidden" name="page" value={activePage} />
          <input type="hidden" name="category" value={category} />
        </Form>
        {error && <Banner status="critical">{error}</Banner>}
        <DataTable
          columnContentTypes={["text", "image", "text", "text", "text"]}
          headings={["Selecionar", "Imagem", "Produto", "Categoria", "Preço"]}
          rows={rows}
        />
        <Button
          onClick={handleImport}
          disabled={selectedProducts.length === 0 || navigation.state === "submitting" || loading}
          primary
          loading={loading}
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