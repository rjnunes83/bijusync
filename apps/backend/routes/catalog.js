import express from 'express';
const router = express.Router();
import { getAllProducts } from '../services/shopify/shopifyService.js';

// Corrija aqui: use apenas '/' para que funcione em /api/catalog
router.get('/', async (req, res) => {
  try {
    // Você pode adicionar filtros, paginação e categorias depois
    const products = await getAllProducts();

    // Por enquanto, retorna mock para totalPages e categories
    res.json({
      products: products || [],
      totalPages: 1, // ajuste futuramente para sua lógica de paginação real
      categories: [], // ajuste futuramente para retornar as categorias reais
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar catálogo da loja principal' });
  }
});

export default router;