import ShopService from '../services/shopService.js';

/**
 * Lida com o webhook 'app/uninstalled'.
 * Marca a loja como desinstalada na base de dados.
 */
export const handleAppUninstalled = async (req, res) => {
  const shopDomain = req.headers['x-shopify-shop-domain'];
  console.log(`[Webhook] Recebido pedido de desinstalação para a loja: ${shopDomain}`);

  try {
    if (shopDomain) {
      await ShopService.uninstallShop(shopDomain);
    }
    // Responde sempre com 200 OK para a Shopify, mesmo que a loja não seja encontrada.
    res.status(200).send('Webhook processado.');
  } catch (error) {
    console.error(`[Webhook] Erro ao processar a desinstalação para ${shopDomain}:`, error);
    // Mesmo em caso de erro, respondemos 200 para evitar que a Shopify envie o webhook repetidamente.
    res.status(200).send('Erro interno, mas webhook acusado.');
  }
};
