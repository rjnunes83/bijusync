// backend/services/productCloneService.js
import axios from 'axios';

export const createProductOnShop = async (product, accessToken, shop) => {
  try {
    const endpoint = `https://${shop}/admin/api/2023-07/products.json`;

    // Prepara dados essenciais do produto
    const newProduct = {
      product: {
        title: product.title,
        body_html: product.body_html,
        vendor: product.vendor,
        tags: product.tags,
        product_type: product.product_type,
        variants: product.variants.map(v => ({
          option1: v.option1,
          price: v.price,
          sku: v.sku,
          inventory_quantity: v.inventory_quantity || 0
        })),
        images: product.images?.map(img => ({ src: img.src })) || []
      }
    };

    // Cria o produto na loja revendedora
    await axios.post(endpoint, newProduct, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Produto criado em ${shop}: ${product.title}`);
  } catch (error) {
    console.error(`❌ Erro ao criar produto em ${shop}:`, error.response?.data || error.message);
  }
};