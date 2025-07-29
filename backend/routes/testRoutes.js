import express from 'express';
const router = express.Router();
import { saveOrUpdateShop, getShopByDomain } from '../services/shopService.js';

// 👉 Rota para testar o salvamento da loja no banco
router.get('/test-save-shop', async (req, res) => {
  try {
    const shopData = {
      shopDomain: 'testebijuecia.myshopify.com',
      accessToken: 'token_teste_123',
      scope: 'read_products,write_products'
    };

    await saveOrUpdateShop(shopData);
    res.send('✅ Loja salva ou atualizada com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar loja:', error);
    res.status(500).send('❌ Erro ao salvar loja');
  }
});

// 👉 Rota para testar a recuperação da loja pelo domínio
router.get('/test-get-shop', async (req, res) => {
  try {
    const shopDomain = 'testebijuecia.myshopify.com';
    const shop = await getShopByDomain(shopDomain);

    if (shop) {
      res.json({
        status: '✅ Loja encontrada',
        dados: shop
      });
    } else {
      res.status(404).send('❌ Loja não encontrada');
    }
  } catch (error) {
    console.error('Erro ao buscar loja:', error);
    res.status(500).send('❌ Erro ao buscar loja');
  }
});

export default router;