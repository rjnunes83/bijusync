// biju-cia-connector/app/routes/api/catalog.ts

import { json } from "@remix-run/node";

export async function loader() {
  // MOCK de produtos para testar a integração.
  const products = [
    {
      id: "1",
      image: "https://via.placeholder.com/50x50?text=Produto+1",
      title: "Colar Prata",
      category: "Acessórios",
      price: 49.90
    },
    {
      id: "2",
      image: "https://via.placeholder.com/50x50?text=Produto+2",
      title: "Pulseira Ouro",
      category: "Acessórios",
      price: 69.90
    }
  ];

  // Mock de categorias
  const categories = ["Acessórios", "Anéis", "Pulseiras", "Brincos"];

  // Mock de paginação (foco em testar o fluxo)
  return json({
    products,
    totalPages: 1,
    categories
  });
}
