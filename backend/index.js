const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware base
app.use(express.json());

// Rotas
app.use('/shopify', require('./routes/shopifyAuth')); // se aplicável

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});