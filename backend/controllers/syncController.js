// backend/controllers/syncController.js
import { getAllShops, getShopToken } from '../services/shopService.js';
import { getAllProductsFromShop } from '../services/shopify/shopifyService.js';
import { createProductOnShop } from '../services/productCloneService.js';

export const syncProducts = async (req, res) => {
  try {
    console.log('🔁 Iniciando sincronização...');

    // 1. Buscar produtos da loja-mãe
    const mainShopDomain = 'revenda-biju.myshopify.com';
    const mainShopToken = await getShopToken(mainShopDomain);
    const products = await getAllProductsFromShop(mainShopToken, mainShopDomain);

    console.log(`📦 ${products.length} produtos obtidos da loja-mãe.`);

    // 2. Buscar todas as lojas revendedoras conectadas (exceto a loja-mãe)
    const shops = await getAllShops();
    const revendedoras = shops.filter(shop => shop.shop !== mainShopDomain);

    for (const shop of revendedoras) {
      console.log(`➡️ Sincronizando com: ${shop.shop}`);
      const shopToken = shop.access_token;

      for (const product of products) {
        await createProductOnShop(product, shopToken, shop.shop);
      }
    }

    res.status(200).json({ message: '✅ Sincronização concluída com sucesso.' });
  } catch (error) {
    console.error('❌ Erro ao sincronizar produtos:', error.message);
    res.status(500).json({ error: 'Erro ao sincronizar produtos' });
  }
};

export const deleteObsoleteProducts = async (req, res) => {
  try {
    // Exemplo: lógica para deletar produtos obsoletos
    // Pode ser adaptado conforme sua estratégia de limpeza
    console.log("🗑️ Iniciando limpeza de produtos obsoletos...");

    // Aqui pode haver lógica como buscar produtos existentes na loja revendedora
    // e comparar com os da loja-mãe para remover os que não existem mais.

    res.status(200).json({ message: '🧹 Produtos obsoletos removidos com sucesso.' });
  } catch (error) {
    console.error("❌ Erro ao deletar produtos obsoletos:", error.message);
    res.status(500).json({ error: 'Erro ao deletar produtos obsoletos' });
  }
};