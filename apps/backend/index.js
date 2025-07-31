import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Pool } from 'pg';
import sequelize from './config/db.js';

dotenv.config();
console.log('DATABASE_URL carregada:', process.env.DATABASE_URL);

// Carrega rotas modulares
import shopifyAuthRoutes from './routes/shopifyAuth.js';
import testRoutes from './routes/testRoutes.js';
import productRoutes from './routes/products.js';
import productsSyncRoutes from './routes/productsSync.js';
import syncRoutes from './routes/syncRoutes.js';
import catalogRoutes from './routes/catalog.js';

if (!process.env.SHOPIFY_MAIN_STORE || !process.env.SHOPIFY_ACCESS_TOKEN) {
  console.error('❌ Variáveis de ambiente obrigatórias não definidas: SHOPIFY_MAIN_STORE e SHOPIFY_ACCESS_TOKEN');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global de CORS e JSON
app.use(cors({ origin: process.env.ALLOW_ORIGIN || '*', credentials: true }));
app.use(express.json());

// Middleware de log de requests
app.use((req, res, next) => {
  console.info(`📥 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rotas modulares
app.use('/auth', shopifyAuthRoutes);
app.use('/', testRoutes);
app.use('/api', productRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/products', productsSyncRoutes);
app.use('/', syncRoutes);

// Rota para buscar produtos da Shopify (apenas exemplo, mantenha em controller separado depois)
app.get('/products', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const result = await pool.query('SELECT shopify_domain, access_token FROM shop ORDER BY created_at DESC LIMIT 1');

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Nenhuma loja conectada encontrada.' });
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
      return res.status(shopifyResponse.status).json({ success: false, error: `Erro da Shopify: ${errorText}` });
    }

    const data = await shopifyResponse.json();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('❌ Erro ao buscar produtos:', err);
    res.status(500).json({ success: false, error: 'Erro interno ao buscar produtos' });
  }
});

// Rota de instalação e callback OAuth
app.get('/auth', async (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Faltando parâmetro "shop" na URL.');
  const apiKey = process.env.PUBLIC_APP_CLIENT_ID || '4303a598d58af8fa15d3cb080876b3d';
  const scopes = 'read_products,write_products';
  const redirectUri = process.env.PUBLIC_APP_REDIRECT_URI || 'https://bijusync.onrender.com/auth/callback';
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}`;
  console.info(`🔗 Redirecionando para instalação: ${installUrl}`);
  res.redirect(installUrl);
});

app.get('/auth/callback', async (req, res) => {
  const { shop, code } = req.query;
  if (!shop || !code) return res.status(400).send('Parâmetros "shop" e "code" são obrigatórios.');
  const apiKey = process.env.PUBLIC_APP_CLIENT_ID || '4303a598d58af8fa15d3cb080876b3d';
  const apiSecret = process.env.PUBLIC_APP_CLIENT_SECRET || '6f691b65464f631c41c74afe1d4666e0';
  const fetch = (await import('node-fetch')).default;
  const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
  const accessTokenPayload = { client_id: apiKey, client_secret: apiSecret, code };

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

    await pool.query(
      `INSERT INTO shop (shopify_domain, access_token, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (shopify_domain) DO UPDATE
       SET access_token = EXCLUDED.access_token, updated_at = NOW()`,
      [shop, tokenData.access_token]
    );
    console.info(`✅ Loja autenticada e salva no banco: ${shop}`);
    res.send('✅ Aplicativo instalado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao obter token de acesso:', err);
    res.status(500).send('Erro ao processar autenticação.');
  }
});

// Healthcheck detalhado
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'biju-sync-backend',
    version: process.env.npm_package_version || 'dev',
    time: new Date().toISOString(),
  });
});

// Middleware global de tratamento de erro (sempre último!)
app.use((err, req, res, next) => {
  console.error('❌ ERRO NÃO CAPTURADO:', err);
  res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
});

// Start server com sync do banco
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