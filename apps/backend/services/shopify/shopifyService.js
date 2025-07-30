import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const mainStoreDomain = process.env.SHOPIFY_MAIN_STORE;
function getShopifyAccessToken() {
  return process.env.SHOPIFY_ACCESS_TOKEN;
}
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2023-07';

const SHOPIFY_BASE_URL = `https://${mainStoreDomain}/admin/api/${SHOPIFY_API_VERSION}`;

// Validação defensiva para garantir que as variáveis essenciais estejam definidas
if (!mainStoreDomain) {
  throw new Error('❌ Variável de ambiente SHOPIFY_MAIN_STORE não está definida.');
}

if (!getShopifyAccessToken()) {
  throw new Error('❌ Variável de ambiente SHOPIFY_ACCESS_TOKEN não está definida.');
}

async function getAllProducts() {
  // Busca produtos da loja-mãe (origem dos dados), sempre usando o token de app privado (.env)
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN; // Corrigido para usar sempre o token do .env
  if (!mainStoreDomain || !accessToken) {
    throw new Error('SHOPIFY_MAIN_STORE e/ou SHOPIFY_ACCESS_TOKEN não definidos!');
  }
  try {
    const response = await axios.get(`https://${mainStoreDomain}/admin/api/${SHOPIFY_API_VERSION}/products.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
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
  // Função para buscar produtos de lojas revendedoras, utiliza token passado (geralmente do banco ou OAuth)
  // Atenção: aqui o token deve ser o correto para a loja específica, diferente do token da loja-mãe.
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
  // Função que busca e transforma produtos da loja-mãe, sempre usando token do .env
  const products = await getAllProducts();
  return products.map(transformProduct);
}

async function createProductInStore(productData, accessToken, shop) {
  // Função para criar produto em loja revendedora, token deve ser o da loja específica
  // Atenção: o token aqui não é o da loja-mãe, mas sim do lojista ou OAuth apropriado.
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
  // Função para deletar produto em loja revendedora, token deve ser o da loja específica
  // Atenção: o token aqui não é o da loja-mãe, mas sim do lojista ou OAuth apropriado.
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
  // Função para atualizar produto em loja revendedora, token deve ser o da loja específica
  // Atenção: o token aqui não é o da loja-mãe, mas sim do lojista ou OAuth apropriado.
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
  // Função para atualizar variante em loja revendedora, token deve ser o da loja específica
  // Atenção: o token aqui não é o da loja-mãe, mas sim do lojista ou OAuth apropriado.
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
  // Função para atualizar status do produto em loja revendedora, token deve ser o da loja específica
  // Atenção: o token aqui não é o da loja-mãe, mas sim do lojista ou OAuth apropriado.
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
