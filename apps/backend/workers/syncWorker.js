import { Op } from 'sequelize';
import Job from '../models/Job.js';
import * as shopifyService from '../services/shopify/shopifyService.js';
import sequelize from '../config/db.js';

const MAX_ATTEMPTS = 3;
const POLLING_INTERVAL_MS = 5000; // 5 segundos

async function processSyncJob(job) {
  const { shopifyDomain, accessToken } = job.data;
  const mainShopDomain = process.env.SHOPIFY_MAIN_STORE;
  const mainShopToken = process.env.SHOPIFY_ACCESS_TOKEN;
  console.log(`[WORKER] Iniciando job ${job.id} (${job.type}) para loja: ${shopifyDomain || 'N/A'} (Tentativa ${job.attempts}/${MAX_ATTEMPTS})`);

  switch (job.type) {
    case 'sync-all-products-for-shop': {
      const products = await shopifyService.getAllProductsFromShop(mainShopToken, mainShopDomain);
      for (const product of products) {
        await shopifyService.createProductOnShop(product, accessToken, shopifyDomain);
        // TODO: Controle de rate limit opcional
      }
      break;
    }
    case 'update-products-for-shop': {
      // TODO: lógica de atualização de produtos para a loja shopifyDomain
      throw new Error('update-products-for-shop ainda não implementado');
    }
    case 'cleanup-obsolete-products-for-shop': {
      // TODO: lógica de deleção de produtos obsoletos para a loja shopifyDomain
      throw new Error('cleanup-obsolete-products-for-shop ainda não implementado');
    }
    case 'sync-status-for-shop': {
      // TODO: lógica de sincronização de status dos produtos
      throw new Error('sync-status-for-shop ainda não implementado');
    }
    default: {
      throw new Error(`Tipo de job desconhecido: ${job.type}`);
    }
  }
}

async function runWorker() {
  let jobToRun = null;
  const t = await sequelize.transaction();
  try {
    jobToRun = await Job.findOne({
      where: {
        status: { [Op.in]: ['pending', 'failed'] },
        attempts: { [Op.lt]: MAX_ATTEMPTS }
      },
      order: [['created_at', 'ASC']],
      lock: t.LOCK.UPDATE,
      skipLocked: true,
      transaction: t,
    });
    if (jobToRun) {
      jobToRun.status = 'running';
      jobToRun.attempts += 1;
      await jobToRun.save({ transaction: t });
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    console.error('[WORKER] Erro ao tentar obter um job da fila:', error);
    setTimeout(runWorker, POLLING_INTERVAL_MS);
    return;
  }
  if (jobToRun) {
    try {
      await processSyncJob(jobToRun);
      jobToRun.status = 'completed';
      jobToRun.processed_at = new Date();
      jobToRun.last_error = null;
      await jobToRun.save();
      console.log(`[WORKER] ✅ Job ${jobToRun.id} (${jobToRun.type}) concluído com sucesso para ${jobToRun.data.shopifyDomain}`);
    } catch (error) {
      jobToRun.last_error = error.message || 'Erro desconhecido durante o processamento.';
      jobToRun.processed_at = new Date();
      if (jobToRun.attempts >= MAX_ATTEMPTS) {
        jobToRun.status = 'failed';
        console.error(`[WORKER] ❌ Job ${jobToRun.id} (${jobToRun.type}) falhou permanentemente para ${jobToRun.data.shopifyDomain} após ${MAX_ATTEMPTS} tentativas.`);
      } else {
        jobToRun.status = 'pending';
        console.warn(`[WORKER] ⚠️ Job ${jobToRun.id} (${jobToRun.type}) falhou para ${jobToRun.data.shopifyDomain}. Irá tentar novamente.`);
      }
      await jobToRun.save();
    }
  }
  setTimeout(runWorker, POLLING_INTERVAL_MS);
}

export function start() {
  console.log('🚀 Sync Worker inicializado e pronto para processar jobs.');
  runWorker();
}