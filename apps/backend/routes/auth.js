// backend/routes/auth.js
/**
 * Auth controller para fluxo OAuth da Shopify.
 * Padrão de excelência: seguro, robusto, comentado e fácil de manter/escalar.
 * Última revisão: 2025-07
 */

import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import querystring from 'querystring';
import cookieParser from 'cookie-parser';
import { saveOrUpdateShop } from '../services/shopService.js';

const router = express.Router();

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SCOPES = process.env.SCOPES;
const HOST = process.env.HOST;

const REDIRECT_URI = `${HOST}/auth/callback`;
const APP_DASHBOARD_SUFFIX = '/admin/apps'; // Centralize para fácil troca

router.use(cookieParser());

/**
 * Gera um state aleatório (nonce) para prevenção de CSRF.
 * @returns {string}
 */
function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

// 1A. Suporte à rota padrão Shopify "/auth/login" para iniciar OAuth (boa prática)
// Permite instalação via /auth/login?shop=xxxx.myshopify.com ou /auth?shop=xxxx.myshopify.com
router.get('/login', (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Shop não informado.');

  // State seguro para CSRF
  const state = generateState();
  res.cookie('state', state, { httpOnly: true, secure: true, sameSite: 'lax' });

  const installUrl = `https://${shop}/admin/oauth/authorize` +
    `?client_id=${SHOPIFY_API_KEY}` +
    `&scope=${SCOPES}` +
    `&state=${state}` +
    `&redirect_uri=${REDIRECT_URI}`;

  console.info(`[Shopify OAuth] (login endpoint) Iniciando instalação para loja: ${shop}`);
  return res.redirect(installUrl);
});

// 1. Inicia instalação OAuth da app na loja Shopify
router.get('/', (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Shop não informado.');

  // State seguro para CSRF
  const state = generateState();
  res.cookie('state', state, { httpOnly: true, secure: true, sameSite: 'lax' });

  const installUrl = `https://${shop}/admin/oauth/authorize` +
    `?client_id=${SHOPIFY_API_KEY}` +
    `&scope=${SCOPES}` +
    `&state=${state}` +
    `&redirect_uri=${REDIRECT_URI}`;

  console.info(`[Shopify OAuth] Iniciando instalação para loja: ${shop}`);
  return res.redirect(installUrl);
});

// 2. Callback de autorização da Shopify
router.get('/callback', async (req, res) => {
  const { shop, code, hmac, state } = req.query;

  if (!shop || !code || !hmac || !state) {
    return res.status(400).send('Parâmetros obrigatórios ausentes.');
  }

  // Checagem de state para CSRF
  const stateFromCookie = req.cookies?.state;
  if (state !== stateFromCookie) {
    return res.status(403).send('Falha na validação do state. Potencial CSRF detectado.');
  }

  // Validação HMAC (segurança e integridade da requisição)
  const params = { ...req.query };
  delete params['signature'];
  delete params['hmac'];
  const message = querystring.stringify(params);
  const generatedHash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(message)
    .digest('hex');
  if (generatedHash !== hmac) {
    return res.status(400).send('Falha na validação do HMAC.');
  }

  try {
    // Troca o código por um token de acesso
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code
    });
    const accessToken = tokenResponse.data.access_token;

    // Salva/atualiza a loja e o accessToken de forma segura
    // NUNCA logar accessToken em produção!
    // console.log('Salvando loja:', shop, 'Access Token:', accessToken); // Somente debug local
    await saveOrUpdateShop(shop, accessToken);

    console.info(`[Shopify OAuth] Loja registrada/atualizada: ${shop}`);
    // Redireciona usuário para o painel de apps da loja
    return res.redirect(`https://${shop}${APP_DASHBOARD_SUFFIX}`);
  } catch (err) {
    console.error('[Shopify OAuth] Erro ao obter token:', err.response?.data || err.message);
    // Nunca retorne detalhes sensíveis em produção!
    return res.status(500).send('Erro ao autenticar com a Shopify. Por favor, tente novamente.');
  }
});

export default router;