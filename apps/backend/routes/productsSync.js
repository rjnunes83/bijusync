// backend/routes/productsSync.js

import express from 'express';
import * as shopService from '../services/shopService.js';
import {
  getAndTransformAllProducts as getProductsFromMainStore,
  createProductInStore,
  updateProductInStore,
  updateVariantInStore,
  updateProductStatusInStore,
} from '../services/shopify/shopifyService.js';
import sequelize from "../config/db.js";
import Sequelize from "sequelize";

const router = express.Router();

/**
 * POST /products/sync
 * Sincroniza todos os produtos da loja-mãe para a revendedora informada.
 * Body: { shopifyDomain: string }
 */
router.post("/sync", async (req, res) => {
  const { shopifyDomain } = req.body;
  if (!shopifyDomain) {
    return res.status(400).json({ error: "Domínio da loja não fornecido." });
  }
  try {
    // Busca a loja
    const lojas = await sequelize.query(
      "SELECT * FROM shop WHERE shopify_domain = $1",
      {
        bind: [shopifyDomain],
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    if (!lojas.length) {
      return res.status(404).json({ error: "Loja revendedora não encontrada." });
    }
    const loja = lojas[0];
    const revendedoraToken = loja.access_token;
    const markupPercentage = loja.markupPercentage || 0;

    // Busca os produtos da loja-mãe (TODO: paginação real se >250 produtos)
    const produtosLojaMae = await getProductsFromMainStore();

    let totalCriado = 0, totalFalhou = 0;
    for (const produto of produtosLojaMae) {
      try {
        await createProductInStore(shopifyDomain, revendedoraToken, produto, markupPercentage);
        totalCriado++;
      } catch (error) {
        console.error(`[productsSync] Erro ao criar produto "${produto.title}":`, error.message);
        totalFalhou++;
        // TODO: Armazenar falhas em batch para retry automático
      }
    }
    console.info(`[productsSync] Loja ${shopifyDomain}: Produtos sincronizados: ${totalCriado}, falhas: ${totalFalhou}`);
    res.status(200).json({ success: true, message: "Sincronização iniciada com sucesso.", criados: totalCriado, falhas: totalFalhou });
  } catch (error) {
    console.error("[productsSync] Erro ao buscar loja por domínio:", error);
    res.status(500).json({ error: "Erro interno ao buscar loja." });
  }
});

/**
 * PATCH /products/update
 * Atualiza produtos existentes na revendedora, baseado na loja-mãe.
 * Body: { shopifyDomain: string }
 */
router.patch('/update', async (req, res) => {
  const { shopifyDomain } = req.body;
  if (!shopifyDomain) return res.status(400).json({ error: 'Parâmetro "shopifyDomain" é obrigatório.' });

  try {
    const shop = await shopService.findShopByDomain(shopifyDomain);
    if (!shop) return res.status(404).json({ error: 'Loja revendedora não encontrada.' });

    const revendedoraToken = shop.access_token;
    const produtosLojaMae = await getProductsFromMainStore();

    let totalAtualizado = 0, totalIgnorado = 0, totalFalhou = 0;
    for (const produtoMae of produtosLojaMae) {
      try {
        const skusMae = produtoMae?.variants?.map(v => v.sku).filter(Boolean);
        if (!skusMae?.length) {
          totalIgnorado++;
          continue;
        }

        // Paginação real recomendada aqui!
        const response = await fetch(`https://${shopifyDomain}/admin/api/2024-04/products.json?fields=id,title,variants`, {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': revendedoraToken,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        const produtoExistente = data.products?.find(p =>
          p.variants?.some(v => skusMae.includes(v.sku?.trim()))
        );
        if (!produtoExistente) {
          totalIgnorado++;
          continue;
        }

        const markupPercentage = shop.markupPercentage || 0;
        await updateProductInStore(shopifyDomain, revendedoraToken, produtoExistente.id, produtoMae);
        for (const variant of produtoMae.variants) {
          await updateVariantInStore(shopifyDomain, revendedoraToken, produtoExistente.id, variant, markupPercentage);
        }
        totalAtualizado++;
      } catch (error) {
        console.error(`[productsSync] Erro ao atualizar "${produtoMae.title}": ${error.message}`);
        totalFalhou++;
      }
    }

    res.status(200).json({ message: 'Atualização concluída.', atualizados: totalAtualizado, ignorados: totalIgnorado, falhas: totalFalhou });
  } catch (error) {
    console.error('[productsSync] Erro geral na atualização:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

/**
 * DELETE /products/delete
 * Remove da revendedora os produtos ausentes na loja-mãe.
 * Body: { shopifyDomain: string }
 */
router.delete('/delete', async (req, res) => {
  const { shopifyDomain } = req.body;
  if (!shopifyDomain) return res.status(400).json({ error: 'Parâmetro "shopifyDomain" é obrigatório.' });

  try {
    const shop = await shopService.findShopByDomain(shopifyDomain);
    if (!shop) return res.status(404).json({ error: 'Loja revendedora não encontrada.' });

    const revendedoraToken = shop.access_token;
    const produtosMae = await getProductsFromMainStore();
    const skusMae = produtosMae.flatMap(p => p.variants?.map(v => v.sku)).filter(Boolean);

    // TODO: Paginação real para >250 produtos!
    const response = await fetch(`https://${shopifyDomain}/admin/api/2024-04/products.json?limit=250`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': revendedoraToken,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    const produtosParaDeletar = data.products.filter(p => {
      const skusProduto = p.variants?.map(v => v.sku).filter(Boolean) || [];
      return skusProduto.every(sku => !skusMae.includes(sku?.trim()));
    });

    let deletados = 0, falhas = 0;
    for (const produto of produtosParaDeletar) {
      try {
        await fetch(`https://${shopifyDomain}/admin/api/2024-04/products/${produto.id}.json`, {
          method: 'DELETE',
          headers: {
            'X-Shopify-Access-Token': revendedoraToken,
            'Content-Type': 'application/json'
          }
        });
        deletados++;
      } catch (error) {
        console.error(`[productsSync] Erro ao deletar produto ID ${produto.id}:`, error.message);
        falhas++;
      }
    }

    res.status(200).json({ message: 'Deleção concluída.', deletados, falhas });
  } catch (error) {
    console.error('[productsSync] Erro na deleção:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

/**
 * PATCH /products/sync-status
 * Sincroniza status dos produtos (ex: ativo/inativo) da loja-mãe para revendedora.
 * Body: { shopifyDomain: string }
 */
router.patch('/sync-status', async (req, res) => {
  const { shopifyDomain } = req.body;
  if (!shopifyDomain) return res.status(400).json({ error: 'Parâmetro "shopifyDomain" é obrigatório.' });

  try {
    const shop = await shopService.findShopByDomain(shopifyDomain);
    if (!shop) return res.status(404).json({ error: 'Loja revendedora não encontrada.' });

    const revendedoraToken = shop.access_token;
    const produtosMae = await getProductsFromMainStore();

    // TODO: Paginação real!
    const response = await fetch(`https://${shopifyDomain}/admin/api/2024-04/products.json?limit=250&fields=id,title,variants,status`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': revendedoraToken,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    const produtosRevendedora = data.products;

    let atualizados = 0;
    for (const produtoMae of produtosMae) {
      const skuMae = produtoMae?.variants?.[0]?.sku?.trim();
      const statusMae = produtoMae.status;
      if (!skuMae || !statusMae) continue;
      const produtoCorrespondente = produtosRevendedora.find(p =>
        p.variants?.some(v => v.sku?.trim() === skuMae)
      );
      if (!produtoCorrespondente) continue;

      if (produtoCorrespondente.status !== statusMae) {
        await updateProductStatusInStore(shopifyDomain, revendedoraToken, produtoCorrespondente.id, statusMae);
        atualizados++;
      }
    }

    res.status(200).json({ message: 'Status sincronizado com sucesso.', atualizados });
  } catch (error) {
    console.error('[productsSync] Erro na sincronização de status:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

export default router;