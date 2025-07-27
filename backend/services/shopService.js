const db = require('../config/db');

// Salvar nova loja ou atualizar access_token se já existir
async function saveShop({ shopDomain, accessToken, scope }) {
  if (!shopDomain || !accessToken) {
    throw new Error('Parâmetros obrigatórios ausentes para salvar loja.');
  }

  try {
    const existingShop = await db.query('SELECT * FROM shops WHERE shop_domain = $1', [shopDomain]);

    if (existingShop.rows.length > 0) {
      await db.query(
        'UPDATE shops SET access_token = $1, scope = $2, updated_at = NOW() WHERE shop_domain = $3',
        [accessToken, scope, shopDomain]
      );
    } else {
      await db.query(
        'INSERT INTO shops (shop_domain, access_token, scope, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [shopDomain, accessToken, scope]
      );
    }
  } catch (error) {
    console.error('Erro ao salvar loja:', error.message);
    throw error;
  }
}

// Buscar token da loja pelo domínio
async function getShopToken(shopDomain) {
  if (!shopDomain) return null;

  try {
    const result = await db.query('SELECT access_token FROM shops WHERE shop_domain = $1', [shopDomain]);
    return result.rows[0]?.access_token || null;
  } catch (error) {
    console.error('Erro ao buscar token da loja:', error.message);
    return null;
  }
}

module.exports = {
  saveOrUpdateShop: saveShop,
  getShopToken
};
