const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Importação correta da instância Sequelize
const sequelize = require('./config/db');

// Conexão com PostgreSQL (usado apenas se necessário para queries brutas)
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware base
app.use(express.json());

// Rotas
const shopifyAuthRoutes = require('./routes/shopifyAuth');
const testRoutes = require('./routes/testRoutes');
const productRoutes = require('./routes/products');

app.use('/', shopifyAuthRoutes);
app.use('/test', testRoutes);
app.use('/api', productRoutes);

// Sincronização com Sequelize
sequelize.sync({ alter: true })
  .then(() => {
    console.log('🟢 Banco de dados sincronizado com Sequelize.');
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('🔴 Erro ao sincronizar com o banco de dados:', error);
  });