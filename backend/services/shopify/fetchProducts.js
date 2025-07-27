const axios = require('axios');

// Tokens da loja principal
const SHOPIFY_STORE = 'revenda-biju.myshopify.com';
const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

async function fetchProductsFromShopify() {
  try {
    const response = await axios.get(
      `https://${SHOPIFY_STORE}/admin/api/2024-04/products.json`,
      {
        headers: {
          'X-Shopify-Access-Token': ADMIN_API_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.products;
  } catch (error) {
    console.error('Erro ao buscar produtos da loja principal Shopify:', error.response?.data || error.message);
    throw new Error('Erro ao buscar produtos da loja principal Shopify');
  }
}

module.exports = fetchProductsFromShopify;