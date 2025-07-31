// backend/routes/products.js
import express from 'express';
import fetchProductsFromShopify from '../services/shopify/fetchProducts.js';

const router = express.Router();

/**
 * GET /products
 * Busca produtos da loja principal Shopify com paginação, busca e filtros.
 * Query params:
 *   - page (int, default: 1)
 *   - limit (int, default: 20)
 *   - search (string, opcional)
 *   - category (string, opcional)
 * Retorna: { products, total, totalPages, page }
 */
router.get('/products', async (req, res) => {
  try {
    // 1. Validação e valores padrão para paginação
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const search = (req.query.search || '').trim().toLowerCase();
    const category = (req.query.category || '').trim().toLowerCase();

    // 2. Busca todos os produtos do Shopify (ajuste para paginação nativa depois!)
    let products = await fetchProductsFromShopify();

    // 3. Filtros de busca e categoria
    if (search) {
      products = products.filter(p =>
        (p.title && p.title.toLowerCase().includes(search)) ||
        (p.sku && p.sku.toLowerCase().includes(search))
      );
    }
    if (category) {
      products = products.filter(
        p => p.category && p.category.toLowerCase() === category
      );
    }

    // 4. Paginação
    const total = products.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const paginated = products.slice((page - 1) * limit, page * limit);

    // 5. Log para monitorar consultas
    console.info(`[Products API] page=${page} limit=${limit} search='${search}' category='${category}' total=${total}`);

    // 6. Resposta estruturada
    res.status(200).json({
      products: paginated,
      total,
      totalPages,
      page,
    });
  } catch (error) {
    console.error('[Products API] Erro na rota /products:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos da loja principal Shopify' });
  }
});

export default router;