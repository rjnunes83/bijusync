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

router.use(cookieParser());

// Rota inicial para iniciar o processo de instalação da app
router.get('/', (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Shop não informado.');

  // Gera um estado (nonce) aleatório para prevenir ataques CSRF
  const state = crypto.randomBytes(16).toString('hex');
  // Salva o estado como cookie seguro e HTTP only
  res.cookie('state', state, { httpOnly: true, secure: true });

  // Monta a URL de autorização da Shopify incluindo o state para validação futura
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES}&state=${state}&redirect_uri=${REDIRECT_URI}`;
  return res.redirect(installUrl);
});

// Callback da Shopify após autorização da app
router.get('/callback', async (req, res) => {
  const { shop, code, hmac, state } = req.query;

  // Verifica se todos os parâmetros necessários estão presentes
  if (!shop || !code || !hmac || !state) {
    return res.status(400).send('Parâmetros inválidos.');
  }

  // Verifica se o state recebido corresponde ao state salvo no cookie para prevenir CSRF
  const stateFromCookie = req.cookies?.state;
  if (state !== stateFromCookie) {
    return res.status(403).send('State inválido.');
  }

  // Remove parâmetros que não fazem parte da mensagem para validação do HMAC
  const map = { ...req.query };
  delete map['signature'];
  delete map['hmac'];

  // Recria a mensagem original para validação do HMAC
  const message = querystring.stringify(map);
  const generatedHash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(message)
    .digest('hex');

  // Compara o HMAC gerado com o recebido para garantir integridade e autenticidade da requisição
  if (generatedHash !== hmac) {
    return res.status(400).send('HMAC inválido.');
  }

  try {
    // Solicita o token de acesso da Shopify usando o código recebido
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code
    });

    const accessToken = tokenResponse.data.access_token;

    // Salva ou atualiza os dados da loja e token no banco de dados
    await saveOrUpdateShop(shop, accessToken);

    // Redireciona para o painel de apps da loja após sucesso na instalação
    return res.redirect(`https://${shop}/admin/apps`);
  } catch (err) {
    console.error('Erro ao obter o token:', err.response?.data || err.message);
    return res.status(500).send('Erro ao autenticar com a Shopify.');
  }
});

export default router;