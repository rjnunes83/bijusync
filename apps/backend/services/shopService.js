import Shop from '../models/Shop.js';

/**
 * Service enterprise para shops (Sequelize only)
 */
const ShopService = {
  /**
   * Cria ou atualiza uma loja, sempre usando Sequelize (nunca SQL puro).
   */
  async upsertShop(shopify_domain, access_token) {
    // upsert do Sequelize: cria se não existe, atualiza se existe
    const [shopInstance, created] = await Shop.upsert(
      {
        shopify_domain,
        access_token,
        updated_at: new Date(),
      },
      { returning: true }
    );
    return shopInstance.toJSON();
  },

  /**
   * Lista todas as lojas conectadas (para rota interna /api/shops)
   */
  async listShops() {
    const shops = await Shop.findAll({
      attributes: ['shopify_domain', 'access_token', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']]
    });
    return shops.map(shop => shop.toJSON());
  },

  /**
   * Marca uma loja como desinstalada e invalida o token de acesso.
   */
  async uninstallShop(shopify_domain) {
    const shop = await Shop.findOne({ where: { shopify_domain } });
    if (shop) {
      shop.installed = false;
      shop.access_token = null; // Invalida o token por segurança
      await shop.save();
      console.log(`[ShopService] Loja ${shopify_domain} marcada como desinstalada.`);
      return true;
    }
    console.warn(`[ShopService] Tentativa de desinstalar uma loja não encontrada: ${shopify_domain}`);
    return false;
  },
};

export default ShopService;