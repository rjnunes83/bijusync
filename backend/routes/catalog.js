const express = require('express');
const router = express.Router();
const { getAllProducts } = require('../services/shopify/shopifyService');

router.get('/catalog', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar catálogo da loja principal' });
  }
});

module.exports = router;