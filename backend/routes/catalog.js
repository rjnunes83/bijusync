import express from 'express';
const router = express.Router();
import { getAllProducts } from '../services/shopify/shopifyService.js';

router.get('/catalog', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar catálogo da loja principal' });
  }
});

export default router;