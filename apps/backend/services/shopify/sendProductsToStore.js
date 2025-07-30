import axios from 'axios';

async function sendProductsToStore(products, shopDomain, accessToken) {
  const created = [];
  const failed = [];

  for (const product of products) {
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

      const response = await axios.post(
        `https://${shopDomain}/admin/api/2023-10/products.json`,
        productData,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          }
        }
      );

      created.push(response.data.product.id);
      console.log(`✅ Produto criado: ${response.data.product.title}`);
    } catch (error) {
      console.error(`❌ Erro ao criar produto "${product.title}":`, error.response?.data || error.message);
      failed.push(product.title);
    }
  }

  console.log(`🔁 Total criado: ${created.length} | Falharam: ${failed.length}`);
  return { created, failed };
}

export default sendProductsToStore;