

import Session from '../models/Session.js';

/**
 * Serviço para gerir sessões da Shopify usando Sequelize.
 * Permite criar, buscar e deletar sessões (compatível com o padrão @shopify/shopify-api).
 */
const SessionService = {
  /**
   * Cria ou atualiza uma sessão Shopify.
   * @param {object} session - Sessão no formato da Shopify.
   * @returns {Promise<boolean>}
   */
  async storeSession(session) {
    await Session.upsert({
      id: session.id,
      shop: session.shop,
      state: session.state,
      isOnline: session.isOnline,
      scope: session.scope,
      expires: session.expires ? new Date(session.expires) : null,
      accessToken: session.accessToken,
      userId: session.userId,
    });
    return true;
  },

  /**
   * Busca uma sessão Shopify pelo ID.
   * @param {string} id - ID da sessão.
   * @returns {Promise<object|undefined>}
   */
  async loadSession(id) {
    const sessionRow = await Session.findByPk(id);
    if (sessionRow) {
      // Converte o modelo Sequelize para objeto simples, mantendo compatibilidade.
      const session = sessionRow.toJSON();
      // Shopify espera expires como Date.
      if (session.expires) {
        session.expires = new Date(session.expires);
      }
      return session;
    }
    return undefined;
  },

  /**
   * Deleta uma sessão Shopify pelo ID.
   * @param {string} id - ID da sessão.
   * @returns {Promise<boolean>}
   */
  async deleteSession(id) {
    const session = await Session.findByPk(id);
    if (session) {
      await session.destroy();
      return true;
    }
    return false;
  },
};

export default SessionService;