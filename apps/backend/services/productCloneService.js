// backend/services/productCloneService.js
import axios from 'axios';

// Função utilitária para esperar (rate limit)
const wait = ms => new Promise(res => setTimeout(res, ms));

// Função principal para criar produto em loja revendedora
export const createProductOnShop = async (product, accessToken, shop) => {
  // Sanitização e validação mínima
  if (!product || !shop || !accessToken) {
    throw new Error('Dados insuficientes para criar produto');
  }

  const endpoint = `https://${shop}/admin/api/2023-07/products.json`;

  // Prepara estrutura do novo produto
  const newProduct = {
    product: {
      title: product.title || "Produto sem nome",
      body_html: product.body_html || "",
      vendor: product.vendor || "Desconhecido",
      tags: product.tags || "",
      product_type: product.product_type || "",
      variants: Array.isArray(product.variants) && product.variants.length
        ? product.variants.map(v => ({
            option1: v.option1 || "Padrão",
            price: v.price || "0.00",
            sku: v.sku || "",
            inventory_quantity: v.inventory_quantity || 0
          }))
        : [{ option1: "Padrão", price: "0.00", sku: "", inventory_quantity: 0 }],
      images: Array.isArray(product.images) && product.images.length
        ? product.images.map(img => ({ src: img.src }))
        : []
    }
  };

  let attempts = 0;
  while (attempts < 3) {
    try {
      const response = await axios.post(endpoint, newProduct, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Produto criado na loja ${shop}: "${newProduct.product.title}" [ID: ${response.data.product?.id}]`);
      return response.data.product;
    } catch (error) {
      attempts += 1;

      // Rate limit handling (HTTP 429)
      if (error.response && error.response.status === 429) {
        const retryAfter = Number(error.response.headers['retry-after']) || 2;
        console.warn(`⚠️ Rate limit! Aguardando ${retryAfter} segundos para tentar novamente...`);
        await wait(retryAfter * 1000);
        continue; // tenta novamente
      }

      // Log detalhado de erro
      console.error(
        `❌ Erro ao criar produto na loja ${shop}:`,
        {
          title: newProduct.product.title,
          shop,
          status: error.response?.status,
          data: error.response?.data,
          stack: error.stack
        }
      );

      // Retorna erro para camada superior tratar
      throw new Error(`Erro ao criar produto em ${shop}: ${error.response?.data?.errors || error.message}`);
    }
  }

  // Se chegou aqui, não conseguiu criar após 3 tentativas
  throw new Error(`Falha ao criar produto em ${shop} após 3 tentativas.`);
};