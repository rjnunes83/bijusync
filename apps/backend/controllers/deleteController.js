// apps/backend/controllers/deleteController.js

import Product from '../models/Product.js'; // Ajuste o caminho conforme sua estrutura

// Exclui produtos do banco (pode ser adaptado para deletar da Shopify também)
export async function deleteObsoleteProducts(shopDomain, productIds = []) {
  if (!shopDomain || !Array.isArray(productIds) || productIds.length === 0) {
    throw new Error('Domínio da loja e lista de produtos obrigatórios!');
  }

  // Remove do banco
  const deletedCount = await Product.destroy({
    where: {
      shopDomain,
      id: productIds
    }
  });

  console.log(`Deletados ${deletedCount} produtos da loja: ${shopDomain}`);
  return deletedCount;
}