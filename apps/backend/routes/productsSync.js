// /apps/backend/routes/productsSync.js

import express from 'express';
import Joi from 'joi';
import Job from '../models/Job.js';

const router = express.Router();

// --- Middleware de validação reusável ---
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// --- Schema de Validação ---
const shopDomainSchema = Joi.object({
  shopifyDomain: Joi.string().pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/).required()
    .messages({
      'string.pattern.base': 'Domínio da loja deve ser um domínio Shopify válido (ex: minha-loja.myshopify.com).',
      'any.required': 'Parâmetro "shopifyDomain" é obrigatório.'
    }),
});

// -----------------------------------------------------------------------------
// AS ROTAS ABAIXO SÓ CRIAM JOBS E RETORNAM IMEDIATAMENTE!
// -----------------------------------------------------------------------------

/**
 * POST /api/sync/all
 * Agenda um job para sincronizar TODOS os produtos para uma loja.
 */
router.post('/all', validate(shopDomainSchema), async (req, res, next) => {
  try {
    const { shopifyDomain } = req.body;
    const job = await Job.create({
      type: 'sync-all-products-for-shop',
      data: { shopifyDomain },
    });
    console.log(`[SYNC] Job ${job.id} criado para sincronizar todos os produtos para ${shopifyDomain}.`);
    res.status(202).json({
      message: 'Sincronização completa agendada com sucesso.',
      jobId: job.id,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/sync/update
 * Agenda um job para ATUALIZAR os produtos de uma loja.
 */
router.patch('/update', validate(shopDomainSchema), async (req, res, next) => {
  try {
    const { shopifyDomain } = req.body;
    const job = await Job.create({
      type: 'update-products-for-shop',
      data: { shopifyDomain },
    });
    console.log(`[SYNC] Job ${job.id} criado para atualizar produtos em ${shopifyDomain}.`);
    res.status(202).json({
      message: 'Atualização de produtos agendada com sucesso.',
      jobId: job.id,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/sync/cleanup
 * Agenda um job para LIMPAR produtos obsoletos de uma loja.
 */
router.delete('/cleanup', validate(shopDomainSchema), async (req, res, next) => {
  try {
    const { shopifyDomain } = req.body;
    const job = await Job.create({
      type: 'cleanup-obsolete-products-for-shop',
      data: { shopifyDomain },
    });
    console.log(`[SYNC] Job ${job.id} criado para limpar produtos obsoletos em ${shopifyDomain}.`);
    res.status(202).json({
      message: 'Limpeza de produtos obsoletos agendada com sucesso.',
      jobId: job.id,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/sync/status
 * Agenda um job para SINCRONIZAR O STATUS dos produtos de uma loja.
 */
router.patch('/status', validate(shopDomainSchema), async (req, res, next) => {
  try {
    const { shopifyDomain } = req.body;
    const job = await Job.create({
      type: 'sync-status-for-shop',
      data: { shopifyDomain },
    });
    console.log(`[SYNC] Job ${job.id} criado para sincronizar status em ${shopifyDomain}.`);
    res.status(202).json({
      message: 'Sincronização de status agendada com sucesso.',
      jobId: job.id,
    });
  } catch (err) {
    next(err);
  }
});

export default router;