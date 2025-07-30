import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const SHOPIFY_STORE = process.env.SHOPIFY_MAIN_STORE;
function getShopifyAccessToken() {
  return process.env.SHOPIFY_ACCESS_TOKEN;
}
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2023-07';


const SHOPIFY_BASE_URL = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}`;

if (!SHOPIFY_STORE) {
  console.error('❌ Variável de ambiente SHOPIFY_MAIN_STORE não está definida.');
}

if (!getShopifyAccessToken()) {
  console.error('❌ Variável de ambiente SHOPIFY_ACCESS_TOKEN não está definida.');
}

async function getAllProducts() {
  try {
    const response = await axios.get(`${SHOPIFY_BASE_URL}/products.json`, {
      headers: {
        'X-Shopify-Access-Token': getShopifyAccessToken(),
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

async function getAllProductsFromShop(token, shop) {
  try {
    const response = await axios.get(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json`, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });
    return response.data.products || [];
  } catch (error) {
    console.error(`❌ Erro ao buscar produtos da loja ${shop}:`, error?.response?.data || error.message);
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
    status: product.status, // 'active' ou 'draft'
    published_at: product.published_at,
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

async function createProductInStore(productData, accessToken, shop) {
  try {
    const response = await axios.post(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json`,
      { product: productData },
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.product;
  } catch (error) {
    console.error('❌ Erro ao criar produto na loja:', error?.response?.data || error.message);
    throw error;
  }
}

async function deleteProductFromStore(productId, accessToken, shop) {
  try {
    const response = await axios.delete(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.status === 200;
  } catch (error) {
    console.error(`❌ Erro ao deletar produto ${productId} da loja ${shop}:`, error?.response?.data || error.message);
    return false;
  }
}


async function updateProductInStore(productId, updatedData, accessToken, shop) {
  try {
    const response = await axios.put(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`,
      { product: updatedData },
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.product;
  } catch (error) {
    console.error(`❌ Erro ao atualizar produto ${productId} na loja ${shop}:`, error?.response?.data || error.message);
    throw error;
  }
}

async function updateVariantInStore(variantId, updatedData, accessToken, shop) {
  try {
    const response = await axios.put(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/variants/${variantId}.json`,
      { variant: updatedData },
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.variant;
  } catch (error) {
    console.error(`❌ Erro ao atualizar variante ${variantId} na loja ${shop}:`, error?.response?.data || error.message);
    throw error;
  }
}

async function updateProductStatusInStore(productId, newStatus, accessToken, shop) {
  try {
    const response = await axios.put(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`,
      {
        product: {
          id: productId,
          status: newStatus,
        },
      },
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.product;
  } catch (error) {
    console.error(`❌ Erro ao atualizar status do produto ${productId} na loja ${shop}:`, error?.response?.data || error.message);
    throw error;
  }
}

export {
  getAllProducts,
  transformProduct,
  getAndTransformAllProducts,
  createProductInStore,
  getAllProductsFromShop,
  deleteProductFromStore,
  updateProductInStore,
  updateVariantInStore,
  updateProductStatusInStore,
  getShopifyAccessToken,
};
