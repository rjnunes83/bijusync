const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

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