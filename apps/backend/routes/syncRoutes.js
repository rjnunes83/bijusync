// backend/routes/syncRoutes.js

import express from 'express';
import { syncProducts, deleteObsoleteProducts } from '../controllers/syncController.js';
// import { authenticate } from '../middlewares/auth.js'; // Exemplo: proteger as rotas
// import rateLimit from 'express-rate-limit'; // Exemplo: limitar requisições

const router = express.Router();

// Exemplo de rate limiter (protege contra abuso)
const syncLimiter = /* rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5, // no máximo 5 sync por minuto
  message: { status: 'error', message: 'Muitas requisições, tente novamente em breve.' }
}); */

// Rota de sincronização de produtos
/**
 * @route GET /sync
 * @desc Sincroniza produtos da loja-mãe com as lojas conectadas
 * @access Protegido (autenticação recomendada)
 */
// router.get('/sync', authenticate, syncLimiter, syncProducts);
router.get('/sync', syncProducts);

// Rota para deletar produtos obsoletos
/**
 * @route DELETE /delete
 * @desc Remove produtos que não existem mais na loja-mãe
 * @access Protegido (autenticação recomendada)
 */
// router.delete('/delete', authenticate, deleteObsoleteProducts);
router.delete('/delete', deleteObsoleteProducts);

export default router;