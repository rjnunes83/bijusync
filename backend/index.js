import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Pool } from 'pg';
import sequelize from './config/db.js';

import shopifyAuthRoutes from './routes/shopifyAuth.js';
import testRoutes from './routes/testRoutes.js';
import productRoutes from './routes/products.js';
import productsSyncRoutes from './routes/productsSync.js';

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

// Rota de verificação de saúde do servidor
app.get('/health', (req, res) => {
  res.status(200).send('🟢 Servidor ativo e respondendo.');
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