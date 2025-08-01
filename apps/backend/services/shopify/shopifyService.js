// apps/backend/services/shopify/shopifyService.js

import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

// --- Variáveis de ambiente essenciais ---
const mainStoreDomain = process.env.SHOPIFY_MAIN_STORE;
const mainStoreAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2023-07';

// Validação das envs moved para o index.js (mas mantemos defesa local)
if (!mainStoreDomain) throw new Error('❌ SHOPIFY_MAIN_STORE não definida.');
if (!mainStoreAccessToken) throw new Error('❌ SHOPIFY_ACCESS_TOKEN não definida.');

// --- Logging detalhado por loja (enterprise) ---
function logWithStore(store, msg, ...args) {
  console.log(`[Shopify][${store}] ${msg}`, ...args);
}

// --- Busca todos os produtos da loja-mãe, com paginação via header Link (CORRIGIDO) ---
async function getAllProducts() {
  let allProducts = [];
  let nextUrl = `https://${mainStoreDomain}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250`;

  logWithStore(mainStoreDomain, 'Iniciando busca paginada de produtos...');

  try {
    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers: {
          'X-Shopify-Access-Token': mainStoreAccessToken,
          'Content-Type': 'application/json',
        }
      });

      const products = response.data.products || [];
      allProducts = allProducts.concat(products);

      const linkHeader = response.headers['link'];
      nextUrl = null;
      if (linkHeader) {
        const links = linkHeader.split(',');
        const nextLink = links.find(link => link.includes('rel="next"'));
        if (nextLink) {
          const match = nextLink.match(/<(.*?)>/);
          if (match && match[1]) {
            nextUrl = match[1];
            logWithStore(mainStoreDomain, `Próxima página: ${nextUrl}`);
          }
        }
      }
    }
    logWithStore(mainStoreDomain, `Busca concluída. Total de ${allProducts.length} produtos.`);
    return allProducts;
  } catch (error) {
    logWithStore(mainStoreDomain, '❌ Erro ao buscar produtos:', error?.response?.data || error.message);
    throw new Error(`Falha ao buscar produtos da loja-mãe (${mainStoreDomain}).`);
  }
}

// --- Busca produtos de uma loja revendedora específica, com paginação robusta (CORRIGIDO) ---
async function getAllProductsFromShop(token, shop) {
  let allProducts = [];
  let nextUrl = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250`;

  logWithStore(shop, 'Iniciando busca paginada de produtos...');

  try {
    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json',
        }
      });

      const products = response.data.products || [];
      allProducts = allProducts.concat(products);

      const linkHeader = response.headers['link'];
      nextUrl = null;
      if (linkHeader) {
        const links = linkHeader.split(',');
        const nextLink = links.find(link => link.includes('rel="next"'));
        if (nextLink) {
          const match = nextLink.match(/<(.*?)>/);
          if (match && match[1]) {
            nextUrl = match[1];
            logWithStore(shop, `Próxima página: ${nextUrl}`);
          }
        }
      }
    }
    logWithStore(shop, `Busca concluída. Total de ${allProducts.length} produtos.`);
    return allProducts;
  } catch (error) {
    logWithStore(shop, '❌ Erro ao buscar produtos:', error?.response?.data || error.message);
    throw new Error(`Falha ao buscar produtos da loja ${shop}.`);
  }
}

// --- Transforma produto bruto em objeto clean (padrão enterprise) ---
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

// --- Busca e transforma todos os produtos da loja-mãe ---
async function getAndTransformAllProducts() {
  const products = await getAllProducts();
  return products.map(transformProduct);
}

// --- Cria produto em uma loja revendedora ---
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
    throw new Error(`Falha ao criar produto na loja ${shop}.`);
  }
}

// --- Deleta produto em uma loja revendedora ---
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
    throw new Error(`Falha ao deletar produto ${productId} da loja ${shop}.`);
  }
}

// --- Atualiza produto em uma loja revendedora ---
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
    throw new Error(`Falha ao atualizar produto ${productId} da loja ${shop}.`);
  }
}

// --- Atualiza variante em uma loja revendedora ---
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
    throw new Error(`Falha ao atualizar variante ${variantId} da loja ${shop}.`);
  }
}

// --- Atualiza status de um produto ---
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
    throw new Error(`Falha ao atualizar status do produto ${productId} da loja ${shop}.`);
  }
}

// --- EXPORTS (padronizado) ---
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