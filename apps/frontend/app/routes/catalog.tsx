import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useSubmit } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Card,
  Page,
  DataTable,
  TextField,
  Button,
  Filters,
  Pagination,
  Toast,
  Banner,
  Spinner,
} from "@shopify/polaris";
import ptBR from "../locales/pt-BR.json";
import en from "../locales/en.json";
import { useState, useEffect } from "react";

// --- Types
type Product = {
  id: string;
  image?: string;
  title: string;
  category: string;
  price?: number;
};

type LoaderData = {
  products: Product[];
  totalPages: number;
  categories: string[];
  i18n: any;
  locale: string;
};

// --- i18n helper (enterprise)
function detectLocale(request: Request): "pt-BR" | "en" {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang");
  if (lang === "en") return "en";
  if (lang === "pt-BR") return "pt-BR";
  const acceptLanguage = request.headers.get("accept-language") || "";
  if (acceptLanguage.includes("en")) return "en";
  return "pt-BR";
}

// --- Loader enterprise: i18n + catálogo
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || 1);
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const apiUrl = `${baseUrl}/api/catalog?page=${page}&search=${search}&category=${category}`;
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error("Erro ao buscar produtos do catálogo!");
  const data = await response.json();

  // i18n dinâmico
  const locale = detectLocale(request);
  const i18n = locale === "en" ? en : ptBR;

  return json({
    ...data, // { products, totalPages, categories }
    i18n,
    locale,
  });
}

export default function Catalog() {
  const { products, totalPages, categories, i18n, locale } = useLoaderData<LoaderData>();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const submit = useSubmit();

  // Loader automático ao alterar search/category/page
  useEffect(() => {
    // Evita submit duplicado em loading ou submit
    if (navigation.state === "submitting" || loading) return;
    const formData = new FormData();
    formData.set("search", search);
    formData.set("category", category);
    formData.set("page", activePage.toString());
    submit(formData, { method: "get" });
    // eslint-disable-next-line
  }, [search, category, activePage]);

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
      label: i18n["Categoria"] || "Categoria",
      filter: (
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">{i18n["Todas"] || "Todas"}</option>
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

  // Enterprise: proteção para loading inicial
  if (!products) {
    return (
      <PolarisAppProvider i18n={i18n}>
        <Page>
          <Spinner accessibilityLabel="Carregando catálogo" size="large" />
        </Page>
      </PolarisAppProvider>
    );
  }

  return (
    <PolarisAppProvider i18n={i18n}>
      <Page title={i18n["Catálogo de Produtos"] || "Catálogo de Produtos"}>
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
            headings={[
              i18n["Selecionar"] || "Selecionar",
              i18n["Imagem"] || "Imagem",
              i18n["Produto"] || "Produto",
              i18n["Categoria"] || "Categoria",
              i18n["Preço"] || "Preço",
            ]}
            rows={rows}
          />
          <Button
            onClick={handleImport}
            disabled={
              selectedProducts.length === 0 ||
              navigation.state === "submitting" ||
              loading
            }
            primary
            loading={loading}
          >
            {i18n["Importar para minha loja"] || "Importar para minha loja"} ({selectedProducts.length})
          </Button>
          <Pagination
            hasPrevious={activePage > 1}
            onPrevious={() => setActivePage((p) => Math.max(p - 1, 1))}
            hasNext={activePage < totalPages}
            onNext={() => setActivePage((p) => p + 1)}
          />
        </Card>
        {showToast && (
          <Toast
            content={i18n["Produtos importados com sucesso!"] || "Produtos importados com sucesso!"}
            onDismiss={() => setShowToast(false)}
          />
        )}
      </Page>
    </PolarisAppProvider>
  );
}