import express from 'express';
import shopService from '../services/shopService.js';
import { getProductsFromMainStore, createProductInStore } from '../services/shopify/shopifyService.js';

const router = express.Router();

// Endpoint para sincronizar produtos para uma revendedora específica
router.post('/sync', async (req, res) => {
  const { shopDomain } = req.body;

  if (!shopDomain) {
    return res.status(400).json({ error: 'Parâmetro "shopDomain" é obrigatório.' });
  }

  try {
    // Busca dados da loja revendedora no banco
    const shop = await shopService.getShopByDomain(shopDomain);
    if (!shop) {
      return res.status(404).json({ error: 'Loja revendedora não encontrada.' });
    }

    const revendedoraToken = shop.accessToken;

    // Busca os produtos da loja principal
    const products = await getProductsFromMainStore();

    let totalCriado = 0;
    let totalFalhou = 0;

    for (const product of products) {
      try {
        await createProductInStore(shopDomain, revendedoraToken, product);
        totalCriado++;
      } catch (error) {
        console.error(`Erro ao criar produto "${product.title}":`, error.message);
        totalFalhou++;
      }
    }

    return res.status(200).json({
      message: 'Sincronização concluída.',
      sucesso: totalCriado,
      falhas: totalFalhou
    });
  } catch (error) {
    console.error('Erro geral ao sincronizar produtos:', error);
    return res.status(500).json({ error: 'Erro interno ao sincronizar produtos.' });
  }
});

export default router;
