import db from '../config/db.js';

// Salvar nova loja ou atualizar access_token se já existir
export async function saveOrUpdateShop({ shopDomain, accessToken, scope }) {
  if (!shopDomain || !accessToken) {
    throw new Error('Parâmetros obrigatórios ausentes para salvar loja.');
  }

  try {
    const existingShop = await db.query('SELECT * FROM shop WHERE shopify_domain = $1', [shopDomain]);

    if (existingShop.rows.length > 0) {
      await db.query(
        'UPDATE shop SET access_token = $1, scope = $2, updated_at = NOW(), installed = true WHERE shopify_domain = $3',
        [accessToken, scope, shopDomain]
      );
    } else {
      await db.query(
        'INSERT INTO shop (shopify_domain, access_token, scope, installed, created_at, updated_at) VALUES ($1, $2, $3, true, NOW(), NOW())',
        [shopDomain, accessToken, scope]
      );
    }
  } catch (error) {
    console.error('Erro ao salvar loja:', error.message);
    throw error;
  }
}

// Buscar token da loja pelo domínio
export async function getShopToken(shopDomain) {
  if (!shopDomain) return null;

  try {
    const result = await db.query('SELECT access_token FROM shop WHERE shopify_domain = $1', [shopDomain]);
    return result.rows[0]?.access_token || null;
  } catch (error) {
    console.error('Erro ao buscar token da loja:', error.message);
    return null;
  }
}

// Buscar todos os dados da loja pelo domínio
export async function getShopByDomain(shopDomain) {
  if (!shopDomain) return null;

  try {
    const result = await db.query('SELECT * FROM shop WHERE shopify_domain = $1', [shopDomain]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Erro ao buscar loja:', error.message);
    return null;
  }
}

// Buscar todos os shops instalados
export async function getAllShops() {
  try {
    const result = await db.query('SELECT shopify_domain, access_token FROM shop WHERE installed = true');
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar todas as lojas:', error.message);
    return [];
  }
}

// Buscar loja pelo domínio (compatível com Sequelize ou futuras mudanças de ORM)
export async function findShopByDomain(domain) {
  if (!domain) return null;

  try {
    const result = await db.query('SELECT * FROM shop WHERE shopify_domain = $1', [domain]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Erro ao buscar loja por domínio:', error.message);
    return null;
  }
}