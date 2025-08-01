import express from 'express';
import { storeSession, loadSession, deleteSession } from '../controllers/sessionController.js';
import { verifyInternalApi } from '../middleware/auth.js'; // Protege as rotas internas

const router = express.Router();

// Todas as rotas são protegidas pela chave interna
router.use(verifyInternalApi);

router.post('/', storeSession);
router.get('/:id', loadSession);
router.delete('/:id', deleteSession);

export default router;
