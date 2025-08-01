// /apps/backend/controllers/syncController.js

import * as shopService from '../services/shopService.js';
import Job from '../models/Job.js';

/**
 * Cria jobs de sincronização de produtos para cada loja revendedora (Enterprise Ready).
 * Não executa a sincronização diretamente. Apenas agenda.
 */
export const startSyncProductsJob = async (req, res, next) => {
  try {
    // Busca lojas revendedoras (não inclui a loja-mãe)
    const revendedoras = await shopService.getAllResellerShops();

    if (!revendedoras.length) {
      return res.status(200).json({ message: 'Nenhuma loja revendedora para sincronizar.' });
    }

    // Cria um job para cada loja
    const jobPromises = revendedoras.map(shop =>
      Job.create({
        type: 'sync-products-for-shop',
        data: {
          shopDomain: shop.shopify_domain,
          accessToken: shop.access_token
        },
      })
    );

    const jobs = await Promise.all(jobPromises);

    console.log(`[SYNC] ${jobs.length} jobs de sincronização criados na base de dados.`);

    // Responde imediatamente ao frontend (202 = Aceito para processamento assíncrono)
    res.status(202).json({
      message: 'Sincronização agendada com sucesso.',
      jobCount: jobs.length,
      jobIds: jobs.map(j => j.id),
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Endpoint para consultar o status dos jobs de sincronização (opcional).
 */
export const getSyncJobsStatus = async (req, res, next) => {
  try {
    // Retorna os últimos 20 jobs da fila, do mais recente para o mais antigo
    const jobs = await Job.findAll({
      order: [['created_at', 'DESC']],
      limit: 20
    });

    res.json(jobs);
  } catch (err) {
    next(err);
  }
};