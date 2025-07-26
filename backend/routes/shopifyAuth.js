const express = require('express');
const router = express.Router();

require('dotenv').config();

router.get('/auth', (req, res) => {
  const shop = req.query.shop;

  if (!shop) {
    return res.status(400).send('Parâmetro "shop" é obrigatório.');
  }

  const redirectUri = `${process.env.SHOPIFY_APP_URL}/auth/callback`;
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=read_products,write_products&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
});

router.get('/auth/callback', (req, res) => {
  res.send('Autenticação concluída com sucesso!');
});

module.exports = router;