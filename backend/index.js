const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
app.use('/', shopifyAuthRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});