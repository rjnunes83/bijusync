import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const mainStoreDomain = process.env.SHOPIFY_MAIN_STORE;
const mainStoreAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2023-07';

const SHOPIFY_BASE_URL = `https://${mainStoreDomain}/admin/api/${SHOPIFY_API_VERSION}`;

// Defesa para variáveis essenciais
if (!mainStoreDomain) throw new Error('❌ SHOPIFY_MAIN_STORE não definida.');
if (!mainStoreAccessToken) throw new Error('❌ SHOPIFY_ACCESS_TOKEN não definida.');

// Utilitário para logs detalhados
function logWithStore(store, msg, ...args) {
  console.log(`[Shopify][${store}] ${msg}`, ...args);
}

// --- BUSCA TODOS OS PRODUTOS DA LOJA-MÃE, COM PAGINAÇÃO ---
async function getAllProducts() {
  let pageInfo = null;
  let allProducts = [];
  let hasNextPage = true;
  const limit = 250;

  while (hasNextPage) {
    try {
      const url = `https://${mainStoreDomain}/admin/api/${SHOPIFY_API_VERSION}/products.json`;
      const params = { limit };
      if (pageInfo) params.page_info = pageInfo;
      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': mainStoreAccessToken,
          'Content-Type': 'application/json',
        },
        params,
      });
      const products = response.data.products || [];
      allProducts = allProducts.concat(products);

      // Shopify paginação: checa Link header para next page
      const linkHeader = response.headers['link'];
      if (linkHeader && linkHeader.includes('rel="next"')) {
        // Extrai page_info do link header
        const match = linkHeader.match(/page_info=([^&>]+)/);
        pageInfo = match ? match[1] : null;
        hasNextPage = !!pageInfo;
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      logWithStore(mainStoreDomain, '❌ Erro ao buscar produtos:', error?.response?.data || error.message);
      // Se der erro, encerra e retorna o que conseguiu até então (fail-safe)
      break;
    }
  }
  return allProducts;
}

// --- BUSCA PRODUTOS DE UMA LOJA REVENDEDORA ESPECÍFICA ---
async function getAllProductsFromShop(token, shop) {
  let pageInfo = null;
  let allProducts = [];
  let hasNextPage = true;
  const limit = 250;

  while (hasNextPage) {
    try {
      const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json`;
      const params = { limit };
      if (pageInfo) params.page_info = pageInfo;
      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json',
        },
        params,
      });
      const products = response.data.products || [];
      allProducts = allProducts.concat(products);

      const linkHeader = response.headers['link'];
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const match = linkHeader.match(/page_info=([^&>]+)/);
        pageInfo = match ? match[1] : null;
        hasNextPage = !!pageInfo;
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      logWithStore(shop, '❌ Erro ao buscar produtos:', error?.response?.data || error.message);
      break;
    }
  }
  return allProducts;
}

// --- TRANSFORMA PRODUTO BRUTO EM OBJETO CLEAN ---
function transformProduct(product) {
  if (!product) return null;
  return {
    id: product.id,
    title: product.title,
    description: product.body_html,
    vendor: product.vendor,
    tags: product.tags,
    status: product.status,
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

// --- BUSCA E TRANSFORMA TODOS OS PRODUTOS DA LOJA-MÃE ---
async function getAndTransformAllProducts() {
  const products = await getAllProducts();
  return products.map(transformProduct);
}

// --- CRIA UM PRODUTO EM UMA LOJA REVENDEDORA ---
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
    logWithStore(shop, `✅ Produto criado: ${response.data.product.title}`);
    return response.data.product;
  } catch (error) {
    logWithStore(shop, '❌ Erro ao criar produto:', error?.response?.data || error.message);
    throw error;
  }
}

// --- DELETA UM PRODUTO EM UMA LOJA REVENDEDORA ---
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
    logWithStore(shop, `🗑️ Produto ${productId} deletado`);
    return response.status === 200;
  } catch (error) {
    logWithStore(shop, `❌ Erro ao deletar produto ${productId}:`, error?.response?.data || error.message);
    return false;
  }
}

// --- ATUALIZA PRODUTO EM UMA LOJA REVENDEDORA ---
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
    logWithStore(shop, `✏️ Produto ${productId} atualizado`);
    return response.data.product;
  } catch (error) {
    logWithStore(shop, `❌ Erro ao atualizar produto ${productId}:`, error?.response?.data || error.message);
    throw error;
  }
}

// --- ATUALIZA VARIANTE EM UMA LOJA REVENDEDORA ---
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
    logWithStore(shop, `✏️ Variante ${variantId} atualizada`);
    return response.data.variant;
  } catch (error) {
    logWithStore(shop, `❌ Erro ao atualizar variante ${variantId}:`, error?.response?.data || error.message);
    throw error;
  }
}

// --- ATUALIZA STATUS DE UM PRODUTO ---
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
    logWithStore(shop, `✏️ Status do produto ${productId} atualizado para ${newStatus}`);
    return response.data.product;
  } catch (error) {
    logWithStore(shop, `❌ Erro ao atualizar status do produto ${productId}:`, error?.response?.data || error.message);
    throw error;
  }
}

// --- EXPORTS ---
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
  mainStoreAccessToken as getShopifyAccessToken,
};