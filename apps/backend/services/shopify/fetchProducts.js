import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const SHOPIFY_STORE = process.env.SHOPIFY_MAIN_STORE;
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

async function fetchProductsFromShopify() {
  try {
    const response = await axios.get(
      `https://${SHOPIFY_STORE}/admin/api/${process.env.SHOPIFY_API_VERSION}/products.json?limit=5`,
      {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
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

export default fetchProductsFromShopify;