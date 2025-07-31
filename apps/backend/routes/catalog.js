// apps/backend/routes/catalog.js

import express from 'express';
const router = express.Router();
import { getAllProducts } from '../services/shopify/shopifyService.js';

/**
 * Catálogo da loja principal
 * Suporta paginação, filtro por categoria e busca por título/SKU
 * Retorna produtos, categorias e totalPages
 */
router.get('/', async (req, res) => {
  try {
    // Query params do frontend: page, search, category
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = 25; // Ajuste conforme necessário
    const search = (req.query.search || "").toLowerCase();
    const category = (req.query.category || "").toLowerCase();

    // Busca todos os produtos da loja-mãe via service
    const allProducts = await getAllProducts();

    // Filtros dinâmicos
    let filtered = allProducts;
    if (search) {
      filtered = filtered.filter(
        p =>
          (p.title && p.title.toLowerCase().includes(search)) ||
          (p.sku && p.sku.toLowerCase().includes(search))
      );
    }
    if (category) {
      filtered = filtered.filter(
        p => p.category && p.category.toLowerCase() === category
      );
    }

    // Paginação
    const totalProducts = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    // Gera lista única de categorias
    const categories = [
      ...new Set(allProducts.map(p => p.category).filter(Boolean))
    ];

    res.json({
      products: paginated,
      totalPages,
      categories,
    });
  } catch (error) {
    console.error("[Catalog] Erro ao carregar catálogo:", error);
    res.status(500).json({ error: 'Erro ao carregar catálogo da loja principal' });
  }
});

export default router;