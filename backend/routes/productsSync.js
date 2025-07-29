import express from 'express';
import * as shopService from '../services/shopService.js';
import { getAndTransformAllProducts as getProductsFromMainStore, createProductInStore, updateProductInStore, updateVariantInStore } from '../services/shopify/shopifyService.js';
import { updateProductStatusInStore } from '../services/shopify/shopifyService.js';

const router = express.Router();

// Endpoint para sincronizar produtos para uma revendedora específica
router.post('/sync', async (req, res) => {
  const { shopDomain } = req.body;

  if (!shopDomain) {
    return res.status(400).json({ error: 'Parâmetro "shopDomain" é obrigatório.' });
  }

  try {
    const shop = await shopService.getShopByDomain(shopDomain);
    if (!shop) return res.status(404).json({ error: 'Loja revendedora não encontrada.' });

    const revendedoraToken = shop.accessToken;
    const products = await getProductsFromMainStore(shop.accessToken);

    let totalCriado = 0, totalIgnorado = 0, totalFalhou = 0;

    for (const product of products) {
      try {
        const skuPrincipal = product?.variants?.[0]?.sku;
        if (!skuPrincipal) {
          console.warn(`Produto "${product.title}" sem SKU definido.`);
          totalIgnorado++;
          continue;
        }

        const response = await fetch(`https://${shopDomain}/admin/api/2024-04/products.json?fields=id,variants`, {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': revendedoraToken,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        const existe = data.products?.some(p =>
          p.variants?.some(v => v.sku?.trim().toLowerCase() === skuPrincipal.trim().toLowerCase())
        );

        if (existe) {
          console.log(`Produto "${product.title}" já existe.`);
          totalIgnorado++;
          continue;
        }

        await createProductInStore(shopDomain, revendedoraToken, product);
        totalCriado++;
      } catch (error) {
        console.error(`Erro em "${product.title}": ${error.message}`);
        totalFalhou++;
      }
    }

    res.status(200).json({ message: 'Sincronização concluída.', criados: totalCriado, ignorados: totalIgnorado, falhas: totalFalhou });
  } catch (error) {
    console.error('Erro geral na sincronização:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// Endpoint para atualizar produtos existentes
router.patch('/update', async (req, res) => {
  const { shopDomain } = req.body;

  if (!shopDomain) return res.status(400).json({ error: 'Parâmetro "shopDomain" é obrigatório.' });

  try {
    const shop = await shopService.getShopByDomain(shopDomain);
    if (!shop) return res.status(404).json({ error: 'Loja revendedora não encontrada.' });

    const revendedoraToken = shop.accessToken;
    const produtosLojaMae = await getProductsFromMainStore(shop.accessToken);

    let totalAtualizado = 0, totalIgnorado = 0, totalFalhou = 0;

    for (const produtoMae of produtosLojaMae) {
      try {
        const skusMae = produtoMae?.variants?.map(v => v.sku).filter(Boolean);
        if (!skusMae?.length) {
          totalIgnorado++;
          continue;
        }

        const response = await fetch(`https://${shopDomain}/admin/api/2024-04/products.json?fields=id,title,variants`, {
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

        await updateProductInStore(shopDomain, revendedoraToken, produtoExistente.id, produtoMae);
        for (const variant of produtoMae.variants) {
          await updateVariantInStore(shopDomain, revendedoraToken, produtoExistente.id, variant, markupPercentage);
        }

        /*
        const variantsAtualizadas = produtoMae.variants.map(variant => {
          const precoBase = parseFloat(variant.price || 0);
          const precoFinal = (precoBase * (1 + markupPercentage / 100)).toFixed(2);
          return { ...variant, price: precoFinal };
        });

        const updatePayload = {
          product: {
            id: produtoExistente.id,
            title: produtoMae.title,
            body_html: produtoMae.body_html,
            vendor: produtoMae.vendor,
            product_type: produtoMae.product_type,
            tags: produtoMae.tags,
            images: produtoMae.images,
            variants: variantsAtualizadas,
            status: produtoMae.status
          }
        };

        await fetch(`https://${shopDomain}/admin/api/2024-04/products/${produtoExistente.id}.json`, {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': revendedoraToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        });
        */

        totalAtualizado++;
      } catch (error) {
        console.error(`Erro em "${produtoMae.title}": ${error.message}`);
        totalFalhou++;
      }
    }

    res.status(200).json({ message: 'Atualização concluída.', atualizados: totalAtualizado, ignorados: totalIgnorado, falhas: totalFalhou });
  } catch (error) {
    console.error('Erro geral na atualização:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// Endpoint para deletar produtos ausentes na loja-mãe
router.delete('/delete', async (req, res) => {
  const { shopDomain } = req.body;

  if (!shopDomain) return res.status(400).json({ error: 'Parâmetro "shopDomain" é obrigatório.' });

  try {
    const shop = await shopService.getShopByDomain(shopDomain);
    if (!shop) return res.status(404).json({ error: 'Loja revendedora não encontrada.' });

    const revendedoraToken = shop.accessToken;
    const produtosMae = await getProductsFromMainStore(shop.accessToken);
    const skusMae = produtosMae.flatMap(p => p.variants?.map(v => v.sku)).filter(Boolean);

    const response = await fetch(`https://${shopDomain}/admin/api/2024-04/products.json?limit=250`, {
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
        await fetch(`https://${shopDomain}/admin/api/2024-04/products/${produto.id}.json`, {
          method: 'DELETE',
          headers: {
            'X-Shopify-Access-Token': revendedoraToken,
            'Content-Type': 'application/json'
          }
        });
        deletados++;
      } catch (error) {
        console.error(`Erro ao deletar produto ID ${produto.id}:`, error.message);
        falhas++;
      }
    }

    res.status(200).json({ message: 'Deleção concluída.', deletados, falhas });
  } catch (error) {
    console.error('Erro na deleção:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// Endpoint para sincronizar status dos produtos com base na loja-mãe
router.patch('/sync-status', async (req, res) => {
  const { shopDomain } = req.body;

  if (!shopDomain) return res.status(400).json({ error: 'Parâmetro "shopDomain" é obrigatório.' });

  try {
    const shop = await shopService.getShopByDomain(shopDomain);
    if (!shop) return res.status(404).json({ error: 'Loja revendedora não encontrada.' });

    const revendedoraToken = shop.accessToken;
    const produtosMae = await getProductsFromMainStore(shop.accessToken);

    const response = await fetch(`https://${shopDomain}/admin/api/2024-04/products.json?limit=250&fields=id,title,variants,status`, {
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
        await updateProductStatusInStore(shopDomain, revendedoraToken, produtoCorrespondente.id, statusMae);
        atualizados++;
      }
    }

    res.status(200).json({ message: 'Status sincronizado com sucesso.', atualizados });
  } catch (error) {
    console.error('Erro na sincronização de status:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

export default router;
