// backend/routes/syncRoutes.js
import express from 'express';
import { syncProducts, deleteObsoleteProducts } from '../controllers/syncController.js';

const router = express.Router();

router.get('/sync', syncProducts);

router.delete('/delete', deleteObsoleteProducts);

export default router;