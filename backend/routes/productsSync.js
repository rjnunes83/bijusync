import express from 'express';
import * as shopService from '../services/shopService.js';
import { getAndTransformAllProducts as getProductsFromMainStore, createProductInStore } from '../services/shopify/shopifyService.js';

const router = express.Router();

// Endpoint para sincronizar produtos para uma revendedora específica
router.post('/sync', async (req, res) => {
  const { shopDomain } = req.body;

  if (!shopDomain) {
    return res.status(400).json({ error: 'Parâmetro "shopDomain" é obrigatório.' });
  }

  try {
    const shop = await shopService.getShopByDomain(shopDomain);
    if (!shop) {
      return res.status(404).json({ error: 'Loja revendedora não encontrada.' });
    }

    const revendedoraToken = shop.accessToken;
    const products = await getProductsFromMainStore(shop.accessToken); // loja mãe

    let totalCriado = 0;
    let totalIgnorado = 0;
    let totalFalhou = 0;

    for (const product of products) {
      try {
        const skuPrincipal = product?.variants?.[0]?.sku;
        if (!skuPrincipal) {
          console.warn(`Produto "${product.title}" sem SKU definido, ignorado.`);
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
        const existe = data.products?.some(p =>
          p.variants?.some(
            v => v.sku && skuPrincipal && v.sku.trim().toLowerCase() === skuPrincipal.trim().toLowerCase()
          )
        );

        if (existe) {
          console.log(`Produto "${product.title}" já existe na loja ${shopDomain}, ignorado.`);
          totalIgnorado++;
          continue;
        }

        await createProductInStore(shopDomain, revendedoraToken, product);
        totalCriado++;
      } catch (error) {
        console.error(`Erro ao processar "${product.title}":`, error.message);
        totalFalhou++;
      }
    }

    return res.status(200).json({
      message: 'Sincronização concluída.',
      criados: totalCriado,
      ignorados: totalIgnorado,
      falhas: totalFalhou
    });
  } catch (error) {
    console.error('Erro geral ao sincronizar produtos:', error);
    return res.status(500).json({ error: 'Erro interno ao sincronizar produtos.' });
  }
});

// Endpoint para atualizar produtos já existentes na loja revendedora
router.patch('/update', async (req, res) => {
  const { shopDomain } = req.body;

  if (!shopDomain) {
    return res.status(400).json({ error: 'Parâmetro "shopDomain" é obrigatório.' });
  }

  try {
    const shop = await shopService.getShopByDomain(shopDomain);
    if (!shop) {
      return res.status(404).json({ error: 'Loja revendedora não encontrada.' });
    }

    const revendedoraToken = shop.accessToken;
    const produtosLojaMae = await getProductsFromMainStore(shop.accessToken);

    let totalAtualizado = 0;
    let totalIgnorado = 0;
    let totalFalhou = 0;

    for (const produtoMae of produtosLojaMae) {
      try {
        const skusMae = produtoMae?.variants?.map(v => v.sku).filter(Boolean);
        if (!skusMae || skusMae.length === 0) {
          console.warn(`Produto "${produtoMae.title}" sem nenhum SKU definido, ignorado.`);
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
          p.variants?.some(
            v => v.sku && skusMae.some(
              skuMae => skuMae.trim().toLowerCase() === v.sku.trim().toLowerCase()
            )
          )
        );

        if (!produtoExistente) {
          totalIgnorado++;
          continue;
        }

        const updatePayload = {
          product: {
            id: produtoExistente.id,
            title: produtoMae.title,
            body_html: produtoMae.body_html,
            vendor: produtoMae.vendor,
            product_type: produtoMae.product_type,
            tags: produtoMae.tags,
            images: produtoMae.images,
            variants: produtoMae.variants
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

        totalAtualizado++;
      } catch (error) {
        console.error(`Erro ao atualizar "${produtoMae.title}":`, error.message);
        totalFalhou++;
      }
    }

    return res.status(200).json({
      message: 'Atualização concluída.',
      atualizados: totalAtualizado,
      ignorados: totalIgnorado,
      falhas: totalFalhou
    });
  } catch (error) {
    console.error('Erro geral ao atualizar produtos:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar produtos.' });
  }
});

// Endpoint para deletar produtos que não existem mais na loja-mãe
router.delete('/delete', async (req, res) => {
  const { shopDomain } = req.body;

  if (!shopDomain) {
    return res.status(400).json({ error: 'Parâmetro "shopDomain" é obrigatório.' });
  }

  try {
    const shop = await shopService.getShopByDomain(shopDomain);
    if (!shop) {
      return res.status(404).json({ error: 'Loja revendedora não encontrada.' });
    }

    const revendedoraToken = shop.accessToken;
    const produtosMae = await getProductsFromMainStore(shop.accessToken);
    const skusMae = produtosMae.map(p => p.variants?.[0]?.sku).filter(Boolean);

    const response = await fetch(`https://${shopDomain}/admin/api/2024-04/products.json?limit=250`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': revendedoraToken,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    const produtosParaDeletar = data.products.filter(p => {
      const skuProduto = p.variants?.[0]?.sku;
      return skuProduto && !skusMae.some(
        skuMae => skuMae.trim().toLowerCase() === skuProduto.trim().toLowerCase()
      );
    });

    let deletados = 0;
    let falhas = 0;

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

    return res.status(200).json({
      message: 'Processo de deleção concluído.',
      deletados,
      falhas
    });
  } catch (error) {
    console.error('Erro ao deletar produtos desatualizados:', error);
    return res.status(500).json({ error: 'Erro interno ao deletar produtos.' });
  }
});

export default router;
