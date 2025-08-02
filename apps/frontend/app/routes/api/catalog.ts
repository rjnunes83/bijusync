// biju-cia-connector/app/routes/api/catalog.ts

import { json, LoaderFunctionArgs } from "@remix-run/node";

/**
 * @description
 * Endpoint de catálogo de produtos (mock).
 * Pronto para evolução: basta substituir pelo fetch dos produtos reais.
 */

// 1. Tipagem dos produtos
type Produto = {
  id: string;
  image: string;
  title: string;
  category: string;
  price: number;
};

export async function loader({ request }: LoaderFunctionArgs) {
  // MOCK de produtos para testar integração
  const products: Produto[] = [
    {
      id: "1",
      image: "https://via.placeholder.com/50x50?text=Produto+1",
      title: "Colar Prata",
      category: "Acessórios",
      price: 49.90,
    },
    {
      id: "2",
      image: "https://via.placeholder.com/50x50?text=Produto+2",
      title: "Pulseira Ouro",
      category: "Acessórios",
      price: 69.90,
    },
  ];

  // Mock de categorias
  const categories: string[] = ["Acessórios", "Anéis", "Pulseiras", "Brincos"];

  // Mock de paginação (pronto para escalar)
  const totalPages = 1;

  // 2. Estrutura de resposta robusta (REST padrão)
  return json({
    success: true,
    message: "Catálogo retornado com sucesso (mock).",
    data: {
      products,
      totalPages,
      categories,
    },
  });
}