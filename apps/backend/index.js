import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './config/db.js';

// --- 1. CONFIGURAÇÃO E VALIDAÇÃO INICIAL ---
dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'SHOPIFY_MAIN_STORE',
  'SHOPIFY_ACCESS_TOKEN',
  'PUBLIC_APP_CLIENT_ID',
  'PUBLIC_APP_CLIENT_SECRET',
  'HOST',
];

for (const v of requiredEnvVars) {
  if (!process.env[v]) {
    throw new Error(`FATAL ERROR: A variável de ambiente crítica "${v}" não está definida.`);
  }
}

// --- 2. IMPORTAÇÃO DE ROTAS (apenas delegação) ---
import shopifyAuthRoutes from './routes/shopifyAuth.js';
import productRoutes from './routes/products.js';
import catalogRoutes from './routes/catalog.js';

// --- 3. INICIALIZAÇÃO DO EXPRESS ---
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares Globais
app.use(cors({ origin: process.env.ALLOW_ORIGIN || '*', credentials: true }));
app.use(express.json());

// Logging para debug detalhado
app.use((req, res, next) => {
  console.info(`[REQUEST] 📥 ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// --- 4. DELEGAÇÃO DE ROTAS ---
app.use('/auth', shopifyAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/catalog', catalogRoutes);

// --- 5. Healthcheck e Raiz (únicas exceções permitidas aqui) ---
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Servidor Biju & Cia. Connect está operacional.',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});
app.get('/', (req, res) => {
  res.send('Biju & Cia. Connect - Backend Ativo.');
});

// --- 6. HANDLER GLOBAL DE ERRO ---
app.use((err, req, res, next) => {
  console.error('❌ [GLOBAL ERROR HANDLER] Erro não capturado:', err);
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Ocorreu um erro inesperado no servidor.';
  res.status(statusCode).json({
    status: 'error',
    message,
  });
});

// --- 7. INICIALIZAÇÃO (só Sequelize, fail-fast) ---
sequelize.sync({ alter: true })
  .then(() => {
    console.log('🟢 Base de dados sincronizada com sucesso via Sequelize.');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Biju & Cia. Connect a postos na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('🔴 ERRO FATAL AO CONECTAR/SINCRONIZAR COM A BASE DE DADOS:', error);
    process.exit(1);
  });