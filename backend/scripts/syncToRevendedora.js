import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega corretamente o .env da raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import fetchProducts from '../services/shopify/fetchProducts.js';
import sendProductsToStore from '../services/shopify/sendProductsToStore.js';

// Usa os dados da .env corretamente
const shopDomain = process.env.REVENDEDORA_DOMAIN;
const accessToken = process.env.REVENDEDORA_TOKEN;

(async () => {
  try {
    const allProducts = await fetchProducts();
    const fiveProducts = allProducts.slice(0, 5);

    console.log(`🔄 Enviando ${fiveProducts.length} produtos para a loja revendedora...`);
    await sendProductsToStore(fiveProducts, shopDomain, accessToken);
    console.log('✅ Produtos enviados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao enviar produtos:', error.message || error);
  }
})();