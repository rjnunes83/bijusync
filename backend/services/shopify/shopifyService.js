const axios = require('axios');

const SHOPIFY_STORE = process.env.SHOPIFY_MAIN_STORE;
const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2023-07';

const SHOPIFY_BASE_URL = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}`;

async function getAllProducts() {
  try {
    const response = await axios.get(`${SHOPIFY_BASE_URL}/products.json`, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
        'Content-Type': 'application/json',
      },
      params: {
        // limit: 250, // caso queira controlar paginação
      },
    });
    return response.data.products || [];
  } catch (error) {
    console.error('❌ Erro ao buscar produtos da loja principal:', error?.response?.data || error.message);
    return [];
  }
}

function transformProduct(product) {
  if (!product) return null;

  return {
    id: product.id,
    title: product.title,
    description: product.body_html,
    vendor: product.vendor,
    tags: product.tags,
    variants: product.variants?.map((variant) => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku,
      price: variant.price,
      inventory_quantity: variant.inventory_quantity,
      weight: variant.weight,
      weight_unit: variant.weight_unit,
    })) || [],
    images: product.images?.map((img) => img.src) || [],
  };
}


async function getAndTransformAllProducts() {
  const products = await getAllProducts();
  return products.map(transformProduct);
}

module.exports = {
  getAllProducts,
  transformProduct,
  getAndTransformAllProducts,
};
