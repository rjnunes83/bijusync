// backend/routes/products.js
import express from 'express';
import fetchProductsFromShopify from '../services/shopify/fetchProducts.js';

const router = express.Router();

router.get('/products', async (req, res) => {
  try {
    const products = await fetchProductsFromShopify();
    res.status(200).json(products);
  } catch (error) {
    console.error('Erro na rota /products:', error.message);
    res.status(500).json({ error: 'Erro ao buscar produtos da loja principal Shopify' });
  }
});

export default router;