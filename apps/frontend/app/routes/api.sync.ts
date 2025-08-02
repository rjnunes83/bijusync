import { ActionFunctionArgs, json } from "@remix-run/node";
import { admin } from "../shopify.server";

// Ambiente seguro (variáveis obrigatórias, nunca hardcode!)
const BACKEND_URL = process.env.BACKEND_API_URL;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

// Tipos permitidos de sincronização
type SyncJobType = "all" | "update" | "cleanup";

// Contrato do body recebido (TypeScript forte)
interface SyncRequestBody {
  type: SyncJobType;
}

/**
 * API de sincronização - Enterprise/Server-to-Server (SSR only)
 * - Autentica sessão de admin (obrigatório)
 * - Valida body e ambiente
 * - Faz chamada autenticada ao backend (BFF)
 * - Padrão: nunca vaza detalhes internos em produção
 * - Preparado para internacionalização de erros (futuro)
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  // Segurança: exija variáveis de ambiente
  if (!BACKEND_URL || !INTERNAL_API_SECRET) {
    // NUNCA exponha nomes reais dos segredos em produção!
    throw new Error("Infra error: Backend API environment not configured.");
  }

  // Autentica usuário admin (segurança máxima)
  const authResult = await admin.authenticate.admin(request);
  if (!authResult?.session?.shop) {
    // Isso nunca deve acontecer, mas garante que nunca vaze sessão indefinida
    return json(
      { error: "Sessão de administrador inválida. Por favor, faça login novamente." },
      { status: 401 }
    );
  }
  const { shop } = authResult.session;

  // Validação forte do body
  let body: SyncRequestBody;
  try {
    body = await request.json();
    if (!body.type || !["all", "update", "cleanup"].includes(body.type)) {
      return json({ error: "Parâmetro 'type' inválido." }, { status: 400 });
    }
  } catch (err) {
    return json({ error: "Body JSON malformado." }, { status: 400 });
  }

  // Monta endpoint e método HTTP
  const targetUrl = `${BACKEND_URL}/api/sync/${body.type}`;
  const method = body.type === "cleanup" ? "DELETE" : "POST";

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-secret": INTERNAL_API_SECRET,
      },
      body: JSON.stringify({ shopifyDomain: shop }),
    });

    if (!response.ok) {
      // Tenta extrair erro do backend, mas nunca expõe detalhes técnicos
      let errorMsg = `Erro ao agendar sincronização (status: ${response.status})`;
      try {
        const errData = await response.json();
        if (typeof errData?.error === "string") {
          errorMsg = errData.error;
        }
      } catch (_) {
        // ignora parsing de erro
      }
      // TODO: Centralizar log de erro (Datadog, Sentry, etc)
      return json({ error: errorMsg }, { status: response.status });
    }

    // Sucesso: retorna o resultado do backend (status, mensagem)
    const data = await response.json();
    return json(data);

  } catch (error) {
    // Log detalhado só no backend (nunca exiba na resposta HTTP)
    // TODO: logar stack trace (Datadog, Sentry, etc)
    console.error("[BFF] Erro de comunicação com o endpoint de sync do backend.", error);
    return json(
      { error: "Erro de rede ao comunicar com o backend. Tente novamente em instantes." },
      { status: 502 }
    );
  }
};