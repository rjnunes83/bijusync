import express from 'express';
import crypto from 'crypto';
import querystring from 'querystring';
import fetch from 'node-fetch';
import cookieParser from 'cookie-parser';
import ShopService from '../services/shopService.js';

const router = express.Router();
router.use(cookieParser());

/**
 * Rota de instalação (OAuth) - Gera e armazena um state (nonce) anti-CSRF.
 */
router.get('/', (req, res) => {
  const { shop } = req.query;
  if (!shop || !/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop)) {
    return res.status(400).send('Parâmetro "shop" inválido ou ausente.');
  }

  // Gera um nonce (state) para prevenção CSRF
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('shopify_state', state, { httpOnly: true, secure: true, sameSite: 'lax' });

  const redirectUri = process.env.PUBLIC_APP_REDIRECT_URI;
  const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products';

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.PUBLIC_APP_CLIENT_ID}&scope=${scopes}&state=${state}&redirect_uri=${redirectUri}`;
  console.info(`[AUTH] Redirecionando para instalação: ${shop}`);
  res.redirect(installUrl);
});

/**
 * Callback OAuth - Valida state (CSRF) e HMAC (autenticidade).
 */
router.get('/callback', async (req, res, next) => {
  try {
    const { shop, code, hmac, state } = req.query;
    const stateCookie = req.cookies.shopify_state;

    // 1. Validação do state (proteção CSRF)
    if (typeof state !== 'string' || state !== stateCookie) {
      return res.status(403).send('A autenticação falhou. State inválido (proteção CSRF).');
    }
    res.clearCookie('shopify_state'); // Remove o state após uso

    // 2. Validação do HMAC (garantia de autenticidade)
    const { hmac: _, ...map } = req.query;
    const message = querystring.stringify(map);
    const generatedHmac = crypto
      .createHmac('sha256', process.env.PUBLIC_APP_CLIENT_SECRET)
      .update(message)
      .digest('hex');

    if (generatedHmac !== hmac) {
      return res.status(400).send('A autenticação falhou. Validação do HMAC falhou.');
    }

    // 3. Troca do código pelo access_token
    const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
    const accessTokenPayload = {
      client_id: process.env.PUBLIC_APP_CLIENT_ID,
      client_secret: process.env.PUBLIC_APP_CLIENT_SECRET,
      code,
    };

    const response = await fetch(accessTokenRequestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accessTokenPayload),
    });

    const tokenData = await response.json();
    if (!tokenData.access_token) {
      throw new Error(`Falha ao obter access_token da Shopify: ${JSON.stringify(tokenData)}`);
    }

    await ShopService.upsertShop(shop, tokenData.access_token);

    console.info(`[AUTH] Loja ${shop} autenticada e salva com sucesso.`);

    // 4. Redirecionamento para o admin da app na Shopify (user experience)
    res.redirect(`https://${shop}/admin/apps/${process.env.PUBLIC_APP_CLIENT_ID}`);
  } catch (err) {
    next(err);
  }
});

/**
 * Alias para login (Shopify exige /auth/login)
 */
router.get('/login', (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('Faltando parâmetro "shop" na URL.');
  res.redirect(`/auth?shop=${shop}`);
});

export default router;