// apps/backend/services/shopify/fetchProducts.js

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Busca produtos de uma loja Shopify.
 * Suporta paginação automática até trazer todos os produtos, ou apenas o número especificado em 'limit'.
 * 
 * @param {Object} options
 * @param {string} [options.store] - Domínio da loja Shopify (ex: 'revenda-biju.myshopify.com'). Padrão: loja principal.
 * @param {string} [options.accessToken] - Token de acesso da loja. Padrão: da loja principal.
 * @param {number} [options.limit] - Limite de produtos a trazer (default: 250, máximo do Shopify).
 * @param {number} [options.maxTotal] - Número máximo de produtos a buscar no total (ex: 1000). O padrão é buscar tudo.
 * @param {string} [options.apiVersion] - Versão da API do Shopify.
 * @returns {Promise<Array>} Lista de produtos.
 */
async function fetchProductsFromShopify({
  store = process.env.SHOPIFY_MAIN_STORE,
  accessToken = process.env.SHOPIFY_ACCESS_TOKEN,
  limit = 250,
  maxTotal = null,
  apiVersion = process.env.SHOPIFY_API_VERSION || "2023-10",
} = {}) {
  if (!store || !accessToken || !apiVersion) {
    throw new Error('❌ Configuração ausente: verifique SHOPIFY_MAIN_STORE, SHOPIFY_ACCESS_TOKEN e SHOPIFY_API_VERSION no .env');
  }

  let products = [];
  let pageInfo = null;
  let fetched = 0;

  try {
    do {
      const url = `https://${store}/admin/api/${apiVersion}/products.json?limit=${limit}${pageInfo ? `&page_info=${pageInfo}` : ''}`;

      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      const batch = response.data.products;
      if (Array.isArray(batch)) {
        products = products.concat(batch);
        fetched += batch.length;
      }

      // Verifica paginação via 'Link' header (Shopify usa cursor-based pagination)
      const linkHeader = response.headers['link'];
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const match = linkHeader.match(/<[^>]+page_info=([^&>]+)[^>]*>; rel="next"/);
        pageInfo = match ? match[1] : null;
      } else {
        pageInfo = null;
      }

      // Se maxTotal for setado, para antes de passar o máximo
      if (maxTotal && products.length >= maxTotal) {
        products = products.slice(0, maxTotal);
        break;
      }
    } while (pageInfo);

    console.log(`✅ ${products.length} produtos carregados da loja Shopify ${store}`);
    return products;
  } catch (error) {
    console.error('❌ Erro ao buscar produtos da loja Shopify:', error.response?.data || error.message);
    throw new Error(`Erro ao buscar produtos da loja Shopify: ${error.message}`);
  }
}

export default fetchProductsFromShopify;