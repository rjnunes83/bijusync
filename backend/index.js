import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Pool } from 'pg';
import sequelize from './config/db.js';

import shopifyAuthRoutes from './routes/shopifyAuth.js';
import testRoutes from './routes/testRoutes.js';
import productRoutes from './routes/products.js';
import productsSyncRoutes from './routes/productsSync.js';
import syncRoutes from './routes/syncRoutes.js';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Conexão com PostgreSQL usando Pool (para queries brutas se necessário)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Express App
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de log para depuração
app.use((req, res, next) => {
  console.log(`📥 Requisição recebida: ${req.method} ${req.url}`);
  next();
});

// Rota para buscar produtos da Shopify
app.get('/products', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;

    const result = await pool.query('SELECT shopify_domain, access_token FROM shops ORDER BY created_at DESC LIMIT 1');

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhuma loja conectada encontrada.' });
    }

    const { shopify_domain, access_token } = result.rows[0];

    const shopifyResponse = await fetch(`https://${shopify_domain}/admin/api/2024-04/products.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
      },
    });

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      return res.status(shopifyResponse.status).json({ error: `Erro da Shopify: ${errorText}` });
    }

    const data = await shopifyResponse.json();
    return res.json(data);
  } catch (err) {
    console.error('❌ Erro ao buscar produtos:', err);
    res.status(500).json({ error: 'Erro interno ao buscar produtos' });
  }
});

// Rotas
app.use('/auth', shopifyAuthRoutes);
app.use('/', testRoutes);
app.use('/api', productRoutes);
app.use('/products', productsSyncRoutes);
app.use('/', syncRoutes); // rota /sync

// Rota para início do OAuth (instalação da loja Shopify)
app.get('/auth', async (req, res) => {
  const shop = req.query.shop;

  if (!shop) {
    return res.status(400).send('Faltando parâmetro "shop" na URL.');
  }

  const apiKey = process.env.SHOPIFY_API_KEY || 'c4631beee345d2062a8a869ab2830a17';
  const scopes = 'read_products,write_products';
  const redirectUri = 'https://bijusync.onrender.com/auth/callback';

  const installUrl = `https://${shop}/admin/oauth/authorize` +
    `?client_id=${apiKey}` +
    `&scope=${scopes}` +
    `&redirect_uri=${redirectUri}`;

  console.log(`🔗 Redirecionando para instalação: ${installUrl}`);
  res.redirect(installUrl);
});

// Rota de callback da autenticação OAuth
app.get('/auth/callback', async (req, res) => {
  const { shop, code } = req.query;

  if (!shop || !code) {
    return res.status(400).send('Parâmetros "shop" e "code" são obrigatórios.');
  }

  const apiKey = process.env.SHOPIFY_API_KEY || 'c4631beee345d2062a8a869ab2830a17';
  const apiSecret = process.env.SHOPIFY_API_SECRET || 'c5485358887619479f8b82fe85036946';

  const fetch = (await import('node-fetch')).default;

  const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
  const accessTokenPayload = {
    client_id: apiKey,
    client_secret: apiSecret,
    code,
  };

  try {
    const response = await fetch(accessTokenRequestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accessTokenPayload),
    });

    const tokenData = await response.json();

    if (!tokenData.access_token) {
      console.error('❌ Falha ao obter access_token da Shopify:', tokenData);
      return res.status(500).send('Erro ao obter token de acesso.');
    }

    // Salva/atualiza na tabela shops
    await pool.query(
      `INSERT INTO shops (shopify_domain, access_token, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (shopify_domain) DO UPDATE
       SET access_token = EXCLUDED.access_token,
           updated_at = NOW()`,
      [shop, tokenData.access_token]
    );

    console.log(`✅ Loja autenticada e salva no banco: ${shop}`);
    res.send('✅ Aplicativo instalado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao obter token de acesso:', err);
    res.status(500).send('Erro ao processar autenticação.');
  }
});

// Rota de verificação de saúde do servidor
app.get('/health', (req, res) => {
  res.status(200).send('🟢 Servidor ativo e respondendo.');
});

// Rota para deletar produtos obsoletos da loja revendedora
app.delete('/delete', async (req, res) => {
  const { shopDomain } = req.body;

  if (!shopDomain) {
    return res.status(400).json({ error: 'shopDomain é obrigatório no corpo da requisição.' });
  }

  try {
    const { deleteObsoleteProducts } = await import('./services/shopify/shopifyService.js');
    const deletedCount = await deleteObsoleteProducts(shopDomain);
    res.status(200).json({ message: `🧹 ${deletedCount} produtos obsoletos foram removidos com sucesso.` });
  } catch (error) {
    console.error('❌ Erro ao deletar produtos obsoletos:', error);
    res.status(500).json({ error: 'Erro ao deletar produtos obsoletos.' });
  }
});

// Inicia o servidor e sincroniza o Sequelize
sequelize.sync({ alter: true })
  .then(() => {
    console.log('🟢 Banco de dados sincronizado com Sequelize.');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('🔴 Erro ao sincronizar com o banco de dados:', error.message);
    process.exit(1);
  });
  