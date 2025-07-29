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