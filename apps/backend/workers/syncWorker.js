import { Op } from 'sequelize';
import Job from '../models/Job.js';
import * as shopifyService from '../services/shopify/shopifyService.js';
import * as shopService from '../services/shopService.js';
import sequelize from '../config/db.js';

const MAX_ATTEMPTS = 3;
const POLLING_INTERVAL_MS = 5000; // 5 segundos

async function processJob(job) {
  const { shopifyDomain } = job.data;
  console.log(`[WORKER] Iniciando job ${job.id} (${job.type}) para: ${shopifyDomain} (Tentativa ${job.attempts}/${MAX_ATTEMPTS})`);

  const mainShopToken = process.env.SHOPIFY_ACCESS_TOKEN;
  const mainShopDomain = process.env.SHOPIFY_MAIN_STORE;

  const resellerShop = await shopService.findShopByDomain(shopifyDomain);
  if (!resellerShop) throw new Error(`Loja revendedora ${shopifyDomain} não encontrada.`);
  const resellerToken = resellerShop.access_token;

  // Busca os produtos de ambas as lojas UMA ÚNICA VEZ para máxima eficiência
  const [mainProducts, resellerProducts] = await Promise.all([
    shopifyService.getAllProductsFromShop(mainShopToken, mainShopDomain),
    shopifyService.getAllProductsFromShop(resellerToken, shopifyDomain)
  ]);

  // Estruturas de dados otimizadas para comparação (O(1) lookup)
  const mainSkus = new Set(mainProducts.flatMap(p => p.variants.map(v => v.sku).filter(Boolean)));
  const resellerSkusMap = new Map();
  resellerProducts.forEach(p => {
      p.variants.forEach(v => {
          if (v.sku) resellerSkusMap.set(v.sku, { productId: p.id, variantId: v.id });
      });
  });

  switch (job.type) {
    case 'sync-all-products-for-shop': {
      for (const product of mainProducts) {
        const productExists = product.variants.some(v => v.sku && resellerSkusMap.has(v.sku));
        if (!productExists) {
          await shopifyService.createProductInStore(product, resellerToken, shopifyDomain);
        }
      }
      break;
    }

    case 'cleanup-obsolete-products-for-shop': {
      const productsToDelete = new Set();
      for (const product of resellerProducts) {
        const isObsolete = product.variants.every(v => !v.sku || !mainSkus.has(v.sku));
        if (isObsolete) {
          productsToDelete.add(product.id);
        }
      }
      for (const productId of productsToDelete) {
        await shopifyService.deleteProductFromStore(productId, resellerToken, shopifyDomain);
      }
      break;
    }

    // Outros tipos de job (ex: 'update-products-for-shop', 'sync-status-for-shop') podem ser implementados depois...
    default:
      throw new Error(`Tipo de job desconhecido: ${job.type}`);
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
      await processJob(jobToRun);
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