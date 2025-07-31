import db from '../config/db.js';

/**
 * Salva ou atualiza dados de uma loja no banco.
 * Se a loja já existe (domínio), atualiza accessToken, scope e marca como instalada.
 * Se não existe, insere nova loja.
 */
export async function saveOrUpdateShop({ shopDomain, accessToken, scope }) {
  if (!shopDomain || !accessToken) {
    throw new Error('[shopService] Parâmetros obrigatórios ausentes: shopDomain e accessToken.');
  }
  const start = Date.now();
  try {
    const { rows } = await db.query('SELECT id FROM shop WHERE shopify_domain = $1', [shopDomain]);

    if (rows.length > 0) {
      // Update token, scope, marca como instalada e atualiza timestamp
      await db.query(
        `UPDATE shop 
         SET access_token = $1, scope = $2, updated_at = NOW(), installed = true 
         WHERE shopify_domain = $3`,
        [accessToken, scope, shopDomain]
      );
      console.info(`[shopService] Loja ${shopDomain} atualizada com sucesso.`);
    } else {
      // Insere nova loja instalada
      await db.query(
        `INSERT INTO shop (shopify_domain, access_token, scope, installed, created_at, updated_at)
         VALUES ($1, $2, $3, true, NOW(), NOW())`,
        [shopDomain, accessToken, scope]
      );
      console.info(`[shopService] Loja ${shopDomain} cadastrada com sucesso.`);
    }
  } catch (error) {
    console.error(`[shopService] Erro ao salvar/atualizar loja "${shopDomain}":`, error);
    throw new Error(`[shopService] Falha ao salvar loja: ${error.message}`);
  } finally {
    console.debug(`[shopService] saveOrUpdateShop (${shopDomain}) levou ${Date.now() - start}ms`);
  }
}

/**
 * Retorna apenas o access_token da loja (pelo domínio).
 */
export async function getShopToken(shopDomain) {
  if (!shopDomain) throw new Error('[shopService] shopDomain é obrigatório');
  const start = Date.now();
  try {
    const { rows } = await db.query(
      'SELECT access_token FROM shop WHERE shopify_domain = $1 AND installed = true',
      [shopDomain]
    );
    return rows[0]?.access_token || null;
  } catch (error) {
    console.error(`[shopService] Erro ao buscar token da loja "${shopDomain}":`, error);
    return null;
  } finally {
    console.debug(`[shopService] getShopToken (${shopDomain}) levou ${Date.now() - start}ms`);
  }
}

/**
 * Busca todos os dados da loja por domínio.
 * Ideal para exibir dados no dashboard administrativo.
 */
export async function getShopByDomain(shopDomain) {
  if (!shopDomain) throw new Error('[shopService] shopDomain é obrigatório');
  const start = Date.now();
  try {
    const { rows } = await db.query('SELECT * FROM shop WHERE shopify_domain = $1', [shopDomain]);
    return rows[0] || null;
  } catch (error) {
    console.error(`[shopService] Erro ao buscar loja por domínio "${shopDomain}":`, error);
    return null;
  } finally {
    console.debug(`[shopService] getShopByDomain (${shopDomain}) levou ${Date.now() - start}ms`);
  }
}

/**
 * Busca todas as lojas instaladas (multi-tenant).
 * Dica: paginar se houver milhares de lojas.
 */
export async function getAllShops(limit = 500, offset = 0) {
  const start = Date.now();
  try {
    const { rows } = await db.query(
      'SELECT shopify_domain, access_token FROM shop WHERE installed = true ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return rows;
  } catch (error) {
    console.error('[shopService] Erro ao buscar todas as lojas:', error);
    return [];
  } finally {
    console.debug(`[shopService] getAllShops levou ${Date.now() - start}ms`);
  }
}

/**
 * Compatível com futuras integrações ORM: busca por domínio.
 */
export async function findShopByDomain(domain) {
  if (!domain) throw new Error('[shopService] domínio é obrigatório');
  const start = Date.now();
  try {
    const { rows } = await db.query('SELECT * FROM shop WHERE shopify_domain = $1', [domain]);
    return rows[0] || null;
  } catch (error) {
    console.error(`[shopService] Erro ao buscar loja por domínio "${domain}":`, error);
    return null;
  } finally {
    console.debug(`[shopService] findShopByDomain (${domain}) levou ${Date.now() - start}ms`);
  }
}