const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Importação do Sequelize e da instância sequelize configurada
const { sequelize } = require('./config/db');

// Conexão com PostgreSQL
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
const productRoutes = require('./routes/products'); // NOVA ROTA

app.use('/', shopifyAuthRoutes);
app.use('/test', testRoutes);
app.use('/api', productRoutes); // NOVA ROTA

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