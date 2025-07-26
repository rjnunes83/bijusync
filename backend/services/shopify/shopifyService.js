const axios = require('axios');

const SHOPIFY_STORE = process.env.SHOPIFY_MAIN_STORE;
const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2023-07';

async function getAllProducts() {
  try {
    const response = await axios.get(
      `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/products.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.products;
  } catch (error) {
    console.error('❌ Erro ao buscar produtos da loja principal:', error.message);
    return [];
  }
}

module.exports = { getAllProducts };