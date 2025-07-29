const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors'); // 🔁 CORS opcional para testes frontend
const { Pool } = require('pg');
const sequelize = require('./config/db');

// Carrega variáveis de ambiente do arquivo .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Conexão com PostgreSQL usando Pool (para queries brutas se necessário)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Express App
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // 🔁 necessário apenas se for usar frontend separado localmente
app.use(express.json());

// Rotas
const shopifyAuthRoutes = require('./routes/shopifyAuth');
const testRoutes = require('./routes/testRoutes');
const productRoutes = require('./routes/products');
const productsSyncRoutes = require('./routes/productsSync');

app.use('/auth', shopifyAuthRoutes);
app.use('/test', testRoutes);
app.use('/api', productRoutes);
app.use('/products', productsSyncRoutes);

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