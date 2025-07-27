const axios = require('axios');
const express = require('express');
const router = express.Router();

require('dotenv').config();

router.get('/auth', (req, res) => {
  const shop = req.query.shop;

  if (!shop || !shop.endsWith('.myshopify.com')) {
    return res.status(400).send('Parâmetro "shop" inválido ou ausente.');
  }

  const redirectUri = `${process.env.SHOPIFY_APP_URL}/auth/callback`;
  const clientId = process.env.SHOPIFY_API_KEY;
  const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products';

  if (!clientId) {
    console.error('❌ Variável de ambiente SHOPIFY_API_KEY não definida');
    return res.status(500).send('Erro interno: API Key não configurada.');
  }

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;

  console.log('🔗 Redirecionando para instalação:', installUrl);
  res.redirect(installUrl);
});

router.get('/auth/callback', async (req, res) => {
  const { shop, code } = req.query;

  if (!shop || !code || !shop.endsWith('.myshopify.com')) {
    return res.status(400).send('Parâmetros inválidos ou ausentes.');
  }

  try {
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code
    });

    const accessToken = tokenResponse.data.access_token;
    const scope = tokenResponse.data.scope;

    console.log('✅ Access Token recebido com sucesso!');
    console.log('🔐 Token:', accessToken);
    console.log('🔍 Scope:', scope);

    res.send(`✅ Autenticação concluída com sucesso!<br><br>🔐 Access Token: <code>${accessToken}</code>`);
  } catch (error) {
    console.error('❌ Erro ao trocar o code por token:', error?.response?.data || error.message);
    res.status(500).send('Erro ao concluir autenticação');
  }
});

module.exports = router;