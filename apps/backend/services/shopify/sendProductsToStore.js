// apps/backend/services/shopify/sendProductsToStore.js

import axios from 'axios';

const SHOPIFY_WRITE_RATE_LIMIT = 2; // 2 req/s por loja (Shopify docs)
const DEFAULT_RETRY_DELAY = 1100; // ms, seguro para 429
const MAX_RETRIES = 3; // Tentativas em caso de rate limit ou erro 5xx

const shopifyAxios = axios.create({
  timeout: 10000,
});

/**
 * Envia produtos para UMA loja Shopify.
 * @param {Array} products - Lista de produtos (objeto Shopify Product completo)
 * @param {string} shopDomain - domínio .myshopify.com da loja destino
 * @param {string} accessToken - token de acesso privado dessa loja
 * @param {object} options - opções avançadas (futuro)
 * @returns {Promise<{created: Array, failed: Array}>}
 */
async function sendProductsToStore(products, shopDomain, accessToken, options = {}) {
  const created = [];
  const failed = [];

  for (const product of products) {
    let attempt = 0;
    let success = false;
    let lastError = null;

    while (attempt < MAX_RETRIES && !success) {
      try {
        const productData = {
          product: {
            title: product.title,
            body_html: product.body_html,
            vendor: product.vendor,
            product_type: product.product_type,
            tags: product.tags,
            options: product.options,
            variants: product.variants,
            images: product.images,
          }
        };

        const response = await shopifyAxios.post(
          `https://${shopDomain}/admin/api/2023-10/products.json`,
          productData,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            }
          }
        );

        created.push({
          shop: shopDomain,
          id: response.data.product.id,
          title: response.data.product.title
        });
        console.log(`✅ [${shopDomain}] Produto criado: ${response.data.product.title}`);
        success = true;

      } catch (error) {
        attempt += 1;
        const status = error.response?.status;
        const errMsg = error.response?.data?.errors || error.message;
        lastError = errMsg;

        // Rate limit - espera e tenta novamente
        if (status === 429) {
          const retryAfter = error.response.headers['retry-after']
            ? Number(error.response.headers['retry-after']) * 1000
            : DEFAULT_RETRY_DELAY;
          console.warn(`⚠️ [${shopDomain}] Rate limit atingido, aguardando ${retryAfter}ms antes do retry (tentativa ${attempt})...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter));
        } else if ([500, 502, 503, 504].includes(status)) {
          // Erros temporários de infra: tente novamente após pequeno delay
          console.warn(`⚠️ [${shopDomain}] Erro ${status}, retry em ${DEFAULT_RETRY_DELAY}ms (tentativa ${attempt})...`);
          await new Promise(resolve => setTimeout(resolve, DEFAULT_RETRY_DELAY));
        } else {
          // Outros erros: não tente novamente
          console.error(`❌ [${shopDomain}] Erro ao criar produto "${product.title}":`, errMsg);
          break;
        }
      }
    }

    if (!success) {
      failed.push({
        shop: shopDomain,
        title: product.title,
        error: lastError
      });
    } else {
      // Delay para respeitar rate limit POR LOJA!
      await new Promise(resolve => setTimeout(resolve, 1000 / SHOPIFY_WRITE_RATE_LIMIT));
    }
  }

  console.log(`🔁 [${shopDomain}] Total criado: ${created.length} | Falharam: ${failed.length}`);
  return { created, failed };
}

export default sendProductsToStore;