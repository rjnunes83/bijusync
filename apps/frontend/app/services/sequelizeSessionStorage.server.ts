// apps/frontend/app/services/sequelizeSessionStorage.server.ts

import pkg from '@shopify/shopify-app-session-storage';
const { SessionStorage, Session } = pkg;

// URL do backend onde as sessões são persistidas.
// Deve SEMPRE vir de uma variável de ambiente segura.
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

if (!INTERNAL_API_SECRET) {
  throw new Error("FATAL: INTERNAL_API_SECRET não está definida no .env do frontend.");
}

/**
 * Headers padrão para autenticação interna
 */
const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'x-internal-api-secret': INTERNAL_API_SECRET,
});

/**
 * Helper de timeout de fetch (defensivo, evita hangs)
 */
async function fetchWithTimeout(resource: RequestInfo, options: any = {}, timeoutMs = 9000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Classe enterprise para armazenamento de sessão via backend Express/Sequelize.
 * Todos os acessos são autenticados via header secreto interno.
 */
export class SequelizeSessionStorage implements SessionStorage {
  /**
   * Salva sessão Shopify no backend
   */
  public async storeSession(session: Session): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(
        `${BACKEND_URL}/api/sessions`,
        {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify(session),
        }
      );
      if (!res.ok) {
        console.error(`[SequelizeSessionStorage] Erro ao salvar sessão: ${res.status} ${res.statusText}`);
        return false;
      }
      return true;
    } catch (error: any) {
      // Log detalhado para integração futura com Sentry/NewRelic
      console.error(`[SequelizeSessionStorage] Falha ao guardar a sessão`, {
        error: error?.message || error,
        stack: error?.stack,
      });
      return false;
    }
  }

  /**
   * Recupera sessão Shopify pelo id
   */
  public async loadSession(id: string): Promise<Session | undefined> {
    try {
      const res = await fetchWithTimeout(
        `${BACKEND_URL}/api/sessions/${encodeURIComponent(id)}`,
        { headers: getDefaultHeaders() }
      );
      if (res.status === 404) {
        return undefined;
      }
      if (!res.ok) {
        console.error(`[SequelizeSessionStorage] Erro ao carregar sessão: ${res.status} ${res.statusText}`);
        return undefined;
      }
      const data = await res.json();
      const session = new Session(data);
      if (data.expires) session.expires = new Date(data.expires);
      return session;
    } catch (error: any) {
      console.error(`[SequelizeSessionStorage] Falha ao carregar a sessão`, {
        error: error?.message || error,
        stack: error?.stack,
      });
      return undefined;
    }
  }

  /**
   * Remove sessão Shopify do backend
   */
  public async deleteSession(id: string): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(
        `${BACKEND_URL}/api/sessions/${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          headers: getDefaultHeaders(),
        }
      );
      if (!res.ok && res.status !== 404) {
        console.error(`[SequelizeSessionStorage] Erro ao apagar sessão: ${res.status} ${res.statusText}`);
        return false;
      }
      return true;
    } catch (error: any) {
      console.error(`[SequelizeSessionStorage] Falha ao apagar a sessão`, {
        error: error?.message || error,
        stack: error?.stack,
      });
      return false;
    }
  }
}