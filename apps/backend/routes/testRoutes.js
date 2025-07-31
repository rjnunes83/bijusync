// backend/routes/testRoutes.js

import express from 'express';
const router = express.Router();
import { saveOrUpdateShop, getShopByDomain } from '../services/shopService.js';

/**
 * @route GET /test-save-shop
 * @desc Testa o salvamento de uma loja no banco de dados
 * @access DEV only
 */
router.get('/test-save-shop', async (req, res) => {
  try {
    const shopData = {
      shopDomain: req.query.shopDomain || 'testebijuecia.myshopify.com',
      accessToken: req.query.accessToken || 'token_teste_123',
      scope: req.query.scope || 'read_products,write_products'
    };

    await saveOrUpdateShop(shopData);
    res.json({
      status: 'success',
      message: 'Loja salva ou atualizada com sucesso!',
      data: shopData
    });
  } catch (error) {
    console.error('Erro ao salvar loja:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao salvar loja',
      error: error.message
    });
  }
});

/**
 * @route GET /test-get-shop
 * @desc Testa a busca de uma loja pelo domínio
 * @access DEV only
 */
router.get('/test-get-shop', async (req, res) => {
  try {
    const shopDomain = req.query.shopDomain || 'testebijuecia.myshopify.com';
    const shop = await getShopByDomain(shopDomain);

    if (shop) {
      res.json({
        status: 'success',
        message: 'Loja encontrada',
        data: shop
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Loja não encontrada'
      });
    }
  } catch (error) {
    console.error('Erro ao buscar loja:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar loja',
      error: error.message
    });
  }
});

export default router;