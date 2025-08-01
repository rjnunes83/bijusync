// backend/routes/syncRoutes.js

import express from 'express';
import { syncProducts } from '../controllers/syncController.js';
// import { authenticate } from '../middlewares/auth.js'; // Exemplo: proteger as rotas
// import rateLimit from 'express-rate-limit'; // Exemplo: limitar requisições

const router = express.Router();

/**
 * @deprecated
 * As rotas abaixo permaneceram apenas para retrocompatibilidade temporária.
 * Use exclusivamente os endpoints /api/sync (baseados em jobs/fila) para sincronização e deleção.
 */

// Exemplo de rate limiter (protege contra abuso)
// const syncLimiter = rateLimit({ ... });

/**
 * @route GET /sync
 * @desc (LEGADO) Sincroniza produtos da loja-mãe com as lojas conectadas
 */
// router.get('/sync', authenticate, syncLimiter, syncProducts);
router.get('/sync', syncProducts);

export default router;