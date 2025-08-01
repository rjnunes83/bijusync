import express from 'express';
import { handleAppUninstalled } from '../controllers/webhookController.js';
// TODO: Adicionar um middleware de verificação de HMAC para webhooks no futuro

const router = express.Router();

router.post('/app-uninstalled', handleAppUninstalled);

export default router;