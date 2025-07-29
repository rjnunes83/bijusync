// backend/routes/syncRoutes.js
import express from 'express';
import { syncProducts } from '../controllers/syncController.js';

const router = express.Router();

router.get('/sync', syncProducts);

export default router;