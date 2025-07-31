// backend/routes/shopifyAuth.js

import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { saveOrUpdateShop } from '../services/shopService.js';

dotenv.config();


const router = express.Router();

/**
 * GET /auth/login
 * Alias amigável para iniciar OAuth (aceita shop via query)
 * Exemplo: /auth/login?shop=testebijuecia.myshopify.com
 */
router.get('/auth/login', (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).json({ error: 'Parâmetro "shop" ausente.' });
  }
  // Redireciona para a rota /auth, que já faz todo o fluxo OAuth
  return res.redirect(`/auth?shop=${encodeURIComponent(shop)}`);
});

/**
 * GET /auth
 * Inicia o fluxo de OAuth com a Shopify.
 */
router.get('/auth', (req, res) => {
  const shop = req.query.shop;

  if (!shop || !shop.endsWith('.myshopify.com')) {
    console.warn('[shopifyAuth] Parâmetro "shop" inválido:', shop);
    return res.status(400).json({ error: 'Parâmetro "shop" inválido ou ausente.' });
  }

  const redirectUri = `${process.env.SHOPIFY_APP_URL}/auth/callback`;
  const clientId = process.env.SHOPIFY_API_KEY;
  const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products';

  if (!clientId) {
    console.error('[shopifyAuth] SHOPIFY_API_KEY não definida.');
    return res.status(500).json({ error: 'Erro interno: API Key não configurada.' });
  }

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  console.info('[shopifyAuth] Redirecionando usuário para instalação da app:', installUrl);
  res.redirect(installUrl);
});

/**
 * GET /auth/callback
 * Finaliza OAuth: troca o code pelo access token e salva no banco.
 */
router.get('/auth/callback', async (req, res) => {
  const { shop, code } = req.query;

  if (!shop || !code || !shop.endsWith('.myshopify.com')) {
    console.warn('[shopifyAuth] Callback com parâmetros inválidos:', req.query);
    return res.status(400).json({ error: 'Parâmetros inválidos ou ausentes.' });
  }

  try {
    // Troca code por access token
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code
    });

    const accessToken = tokenResponse.data.access_token;
    const scope = tokenResponse.data.scope;

    // Salva ou atualiza loja no banco
    await saveOrUpdateShop({
      shopifyDomain: shop,
      accessToken: accessToken,
      scope: scope
    });

    console.info(`[shopifyAuth] Loja "${shop}" autenticada com sucesso. Token salvo no banco.`);
    
    // Redireciona para app após sucesso
    return res.redirect(`${process.env.SHOPIFY_APP_URL}/auth/success?shop=${encodeURIComponent(shop)}`);

    // Se preferir, pode mostrar um HTML customizado informando sucesso, sem expor o token.
    // res.send('✅ Sua loja foi conectada com sucesso! Você já pode fechar esta janela.');

  } catch (error) {
    console.error('[shopifyAuth] Erro ao trocar code por token:', error?.response?.data || error.message);
    return res.status(500).json({ error: 'Erro ao concluir autenticação com a Shopify.' });
  }
});

export default router;