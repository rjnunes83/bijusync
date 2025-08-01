import { Op } from 'sequelize';
import Job from '../models/Job.js';
import * as shopifyService from '../services/shopify/shopifyService.js';
import * as shopService from '../services/shopService.js';
import sequelize from '../config/db.js';

const MAX_ATTEMPTS = 3;
const POLLING_INTERVAL_MS = 5000; // 5 segundos

/**
 * Processa um job, delegando para a função correta baseada no tipo.
 * Contém a lógica de negócio principal para cada tipo de job.
 */
async function processJob(job) {
  const { shopifyDomain } = job.data;
  console.log(`[WORKER] Iniciando job ${job.id} (${job.type}) para: ${shopifyDomain} (Tentativa ${job.attempts}/${MAX_ATTEMPTS})`);

  // Obter os tokens mais recentes antes de cada operação
  const mainShopToken = process.env.SHOPIFY_ACCESS_TOKEN;
  const mainShopDomain = process.env.SHOPIFY_MAIN_STORE;
  
  const resellerShop = await shopService.findShopByDomain(shopifyDomain);
  if (!resellerShop) throw new Error(`Loja revendedora ${shopifyDomain} não encontrada.`);
  const resellerToken = resellerShop.access_token;

  // Busca os produtos de ambas as lojas UMA ÚNICA VEZ para máxima eficiência
  console.log(`[WORKER] Buscando catálogos da loja-mãe e de ${shopifyDomain}...`);
  const [mainProducts, resellerProducts] = await Promise.all([
    shopifyService.getAllProductsFromShop(mainShopToken, mainShopDomain),
    shopifyService.getAllProductsFromShop(resellerToken, shopifyDomain)
  ]);
  console.log(`[WORKER] Catálogos obtidos: ${mainProducts.length} (mãe), ${resellerProducts.length} (revendedora).`);

  // Estruturas de dados otimizadas para comparação (O(1) lookup)
  const mainProductsBySku = new Map();
  mainProducts.forEach(p => {
    p.variants.forEach(v => {
      if (v.sku) mainProductsBySku.set(v.sku, p);
    });
  });
  
  const resellerProductsBySku = new Map();
  resellerProducts.forEach(p => {
    p.variants.forEach(v => {
      if (v.sku) resellerProductsBySku.set(v.sku, p);
    });
  });

  switch (job.type) {
    case 'sync-all-products-for-shop': {
      let createdCount = 0;
      for (const product of mainProducts) {
        const productExists = product.variants.some(v => v.sku && resellerProductsBySku.has(v.sku));
        if (!productExists) {
          await shopifyService.createProductInStore(product, resellerToken, shopifyDomain);
          createdCount++;
        }
      }
      console.log(`[WORKER] ${createdCount} novos produtos criados em ${shopifyDomain}.`);
      break;
    }

    case 'cleanup-obsolete-products-for-shop': {
      const productsToDelete = new Set();
      for (const product of resellerProducts) {
        const isObsolete = product.variants.every(v => !v.sku || !mainProductsBySku.has(v.sku));
        if (isObsolete) {
          productsToDelete.add(product.id);
        }
      }
      console.log(`[WORKER] ${productsToDelete.size} produtos obsoletos encontrados para deleção.`);
      for (const productId of productsToDelete) {
        await shopifyService.deleteProductFromStore(productId, resellerToken, shopifyDomain);
      }
      break;
    }
    
    case 'update-products-for-shop': {
      let updatedCount = 0;
      for (const [sku, mainProduct] of mainProductsBySku.entries()) {
        if (resellerProductsBySku.has(sku)) {
          const resellerProduct = resellerProductsBySku.get(sku);
          // TODO: Adicionar uma verificação mais inteligente para ver se há de facto alterações
          // antes de enviar a requisição de atualização.
          await shopifyService.updateProductInStore(resellerProduct.id, mainProduct, resellerToken, shopifyDomain);
          updatedCount++;
        }
      }
      console.log(`[WORKER] ${updatedCount} produtos existentes foram atualizados em ${shopifyDomain}.`);
      break;
    }

    case 'sync-status-for-shop': {
        let statusUpdateCount = 0;
        for (const [sku, mainProduct] of mainProductsBySku.entries()) {
            if (resellerProductsBySku.has(sku)) {
                const resellerProduct = resellerProductsBySku.get(sku);
                if (resellerProduct.status !== mainProduct.status) {
                    await shopifyService.updateProductStatusInStore(resellerProduct.id, mainProduct.status, resellerToken, shopifyDomain);
                    statusUpdateCount++;
                }
            }
        }
        console.log(`[WORKER] ${statusUpdateCount} status de produtos sincronizados em ${shopifyDomain}.`);
        break;
    }

    default:
      throw new Error(`Tipo de job desconhecido: ${job.type}`);
  }
}

// O motor do worker (runWorker) permanece o mesmo, pois já é robusto.
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
