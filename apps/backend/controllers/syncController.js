// backend/controllers/syncController.js

import { getAllShops, getShopToken } from '../services/shopService.js';
import { getAllProductsFromShop } from '../services/shopify/shopifyService.js';
import { createProductOnShop } from '../services/productCloneService.js';

/**
 * Função utilitária para respeitar rate limit da Shopify
 * Pausa se necessário, de acordo com header
 */
async function handleShopifyRateLimit(response) {
  const header = response?.headers?.get
    ? response.headers.get('x-shopify-shop-api-call-limit')
    : null;

  if (header) {
    const [used, total] = header.split('/').map(Number);
    if (used >= total - 5) {
      // Se estiver perto do limite, espera 1.5s antes de seguir
      console.log(`[${new Date().toISOString()}] ⏸️ Rate limit próximo (${header}), aguardando...`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  } else {
    // Sem header, espera mínimo (Shopify recomenda 500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

/**
 * Sincroniza todos os produtos da loja-mãe para as lojas revendedoras.
 * Robusto, controlando rate-limit e logs profissionais.
 */
export const syncProducts = async (req, res) => {
  const mainShopDomain = process.env.SHOPIFY_MAIN_STORE;
  const mainShopToken = process.env.MAIN_STORE_TOKEN;

  if (!mainShopDomain || !mainShopToken) {
    return res.status(500).json({ error: "Variáveis de ambiente da loja-mãe não definidas!" });
  }

  console.log(`[${new Date().toISOString()}] 🔁 Iniciando sincronização global...`);

  try {
    // 1. Buscar produtos da loja-mãe com paginação garantida
    const products = await getAllProductsFromShop(mainShopToken, mainShopDomain);
    console.log(`[${new Date().toISOString()}] 📦 ${products.length} produtos obtidos da loja-mãe (${mainShopDomain}).`);

    // 2. Buscar lojas revendedoras (exceto loja-mãe)
    const shops = await getAllShops();
    const revendedoras = shops.filter(shop => shop.shop !== mainShopDomain);

    let totalLojas = revendedoras.length;
    let totalProdutos = products.length;
    let erros = [];
    let sucesso = 0;

    for (const shop of revendedoras) {
      console.log(`[${new Date().toISOString()}] ➡️ Sincronizando com: ${shop.shop}`);
      const shopToken = shop.access_token;

      for (const product of products) {
        try {
          // Chama a função de criação de produto, obtendo a response para checar header
          const response = await createProductOnShop(product, shopToken, shop.shop);

          // Controla o rate limit
          await handleShopifyRateLimit(response);

          sucesso++;
        } catch (err) {
          erros.push({
            loja: shop.shop,
            produto: product.title,
            mensagem: err.message
          });
          // Logue sem travar o sync!
          console.error(`[${new Date().toISOString()}] ❌ Falha ao importar ${product.title} para ${shop.shop}: ${err.message}`);
          // Se for erro 429, aguarde mais tempo!
          if (err.response && err.response.status === 429) {
            console.log(`[${new Date().toISOString()}] 🕒 Rate limit excedido, aguardando 5s...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
      }
    }

    console.log(`[${new Date().toISOString()}] ✅ Sincronização finalizada! Total de produtos: ${totalProdutos}, Lojas: ${totalLojas}, Sucesso: ${sucesso}, Erros: ${erros.length}`);

    res.status(200).json({
      message: 'Sincronização concluída.',
      lojasSincronizadas: totalLojas,
      produtosSincronizados: sucesso,
      erros
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Erro ao sincronizar produtos:`, error);
    res.status(500).json({ error: 'Erro ao sincronizar produtos', detalhes: error.message });
  }
};

/**
 * Remove produtos obsoletos das lojas revendedoras (produtos que não existem mais na loja-mãe).
 * A ser implementado com comparação real de catálogos.
 */
export const deleteObsoleteProducts = async (req, res) => {
  try {
    const { shopDomain } = req.body;
    if (!shopDomain) {
      return res.status(400).json({ error: 'Domínio da loja é obrigatório!' });
    }

    // TODO: buscar produtos da revendedora, buscar produtos da loja-mãe, comparar e deletar os que não existem mais.

    res.status(200).json({ message: `🧹 Produtos obsoletos removidos da loja ${shopDomain} (lógica ainda a ser implementada).` });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Erro ao deletar produtos obsoletos:`, error.message);
    res.status(500).json({ error: 'Erro ao deletar produtos obsoletos' });
  }
};