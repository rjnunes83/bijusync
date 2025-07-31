// apps/backend/services/shopify/oauthService.js

import fetch from 'node-fetch';
import crypto from 'crypto';
import querystring from 'querystring';
import db from '../../db.js'; // ajuste o path conforme o seu projeto

// Gera um string aleatório seguro para CSRF
function generateNonce(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Função de validação de HMAC oficial Shopify
function validateShopifyHmac(query, secret) {
  const { hmac, signature, ...map } = query;
  const ordered = Object.keys(map).sort().map(key => (
    `${key}=${Array.isArray(map[key]) ? map[key].join(',') : map[key]}`
  )).join('&');
  const hash = crypto
    .createHmac('sha256', secret)
    .update(ordered)
    .digest('hex');
  return hash === hmac;
}

function startShopifyOAuth(req, res) {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Parâmetro "shop" é obrigatório.');

  const state = generateNonce();
  req.session.shopify_state = state; // precisa de middleware de sessão (ex: express-session)

  const redirectUri = encodeURIComponent(`${process.env.SHOPIFY_APP_URL}/auth/callback`);
  const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products';

  const installUrl =
    `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}` +
    `&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;

  res.redirect(installUrl);
}

async function handleShopifyCallback(req, res) {
  const { code, hmac, shop, state } = req.query;

  // CSRF protection
  if (!state || state !== req.session.shopify_state) {
    return res.status(403).send('State inválido');
  }
  delete req.session.shopify_state;

  // HMAC validation
  if (!validateShopifyHmac(req.query, process.env.SHOPIFY_API_SECRET)) {
    return res.status(400).send('HMAC validation failed');
  }

  const accessTokenUrl = `https://${shop}/admin/oauth/access_token`;
  try {
    const response = await fetch(accessTokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    });

    const data = await response.json();
    if (!data.access_token) {
      console.error('Erro ao obter access_token:', data);
      return res.status(500).send('Erro ao obter o access_token da Shopify');
    }

    // Salva shop + access_token no banco, upsert
    await db.query(
      'INSERT INTO shop (shopify_domain, access_token, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) ON CONFLICT (shopify_domain) DO UPDATE SET access_token = $2, updated_at = NOW()',
      [shop, data.access_token]
    );

    console.log(`[${new Date().toISOString()}] ✅ Access Token salvo para loja: ${shop}`);
    res.send('Loja conectada com sucesso! Agora já pode sincronizar produtos.');
  } catch (error) {
    console.error('Erro na requisição do access token:', error);
    res.status(500).send('Erro interno ao tentar obter access token');
  }
}

export { startShopifyOAuth, handleShopifyCallback };