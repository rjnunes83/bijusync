

import pkg from '@shopify/shopify-app-session-storage';
const { SessionStorage, Session } = pkg;

// URL do nosso backend. Deve vir de uma variável de ambiente.
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

if (!INTERNAL_API_SECRET) {
  throw new Error("INTERNAL_API_SECRET não está definida no .env do frontend.");
}

export class SequelizeSessionStorage implements SessionStorage {
  public async storeSession(session: Session): Promise<boolean> {
    try {
      await fetch(`${BACKEND_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-api-secret': INTERNAL_API_SECRET,
        },
        body: JSON.stringify(session),
      });
      return true;
    } catch (error) {
      console.error("Falha ao guardar a sessão no backend", error);
      return false;
    }
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/sessions/${id}`, {
        headers: {
          'x-internal-api-secret': INTERNAL_API_SECRET,
        },
      });
      if (response.status === 404) {
        return undefined;
      }
      const data = await response.json();
      // Converte os campos de data de string para Date
      const session = new Session(data);
      if (data.expires) {
        session.expires = new Date(data.expires);
      }
      return session;
    } catch (error) {
      console.error("Falha ao carregar a sessão do backend", error);
      return undefined;
    }
  }

  public async deleteSession(id: string): Promise<boolean> {
    try {
      await fetch(`${BACKEND_URL}/api/sessions/${id}`, {
        method: 'DELETE',
        headers: {
          'x-internal-api-secret': INTERNAL_API_SECRET,
        },
      });
      return true;
    } catch (error) {
      console.error("Falha ao apagar a sessão no backend", error);
      return false;
    }
  }
}