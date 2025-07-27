// backend/routes/products.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const Shop = require('../models/Shop'); // model que representa a tabela shops

// Endpoint para listar produtos da loja conectada
router.get('/', async (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).json({ error: 'Shop domain is required' });
  }

  try {
    // Buscar o token da loja no banco de dados
    const loja = await Shop.findOne({ where: { shopify_domain: shop } });

    if (!loja || !loja.access_token) {
      return res.status(404).json({ error: 'Loja não conectada ou token não encontrado.' });
    }

    const response = await axios.get(`https://${shop}/admin/api/2023-07/products.json`, {
      headers: {
        'X-Shopify-Access-Token': loja.access_token,
        'Content-Type': 'application/json'
      }
    });

    const produtos = response.data.products;
    res.status(200).json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos da Shopify:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar produtos da Shopify.' });
  }
});

module.exports = router;