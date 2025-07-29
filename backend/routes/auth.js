// backend/routes/auth.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SCOPES = process.env.SCOPES;
const HOST = process.env.HOST;

const REDIRECT_URI = `${HOST}/auth/callback`;

router.get('/', (req, res) => {
  const shop = req.query.shop;

  if (!shop) return res.status(400).send('Shop não informado.');

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}`;

  return res.redirect(installUrl);
});

router.get('/callback', async (req, res) => {
  const { shop, code } = req.query;

  if (!shop || !code) return res.status(400).send('Parâmetros inválidos.');

  try {
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code
    });

    const accessToken = tokenResponse.data.access_token;

    // Aqui você pode salvar no banco: shop e accessToken
    // Exemplo (você pode adaptar com seu model):
    const { saveOrUpdateShop } = require('../services/shopService');
    await saveOrUpdateShop(shop, accessToken);

    return res.send('App instalado com sucesso!'); // ou redirecionar para dashboard
  } catch (err) {
    console.error('Erro ao obter o token:', err.response?.data || err.message);
    return res.status(500).send('Erro ao autenticar com a Shopify.');
  }
});

module.exports = router;