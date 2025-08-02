// apps/frontend/app/routes/api.sync.ts

import { ActionFunctionArgs, json } from "@remix-run/node";
import { admin } from "../shopify.server";

// Ambiente seguro (NUNCA hardcoded em produção)
const BACKEND_URL = process.env.BACKEND_API_URL;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

// Tipos permitidos de sincronização
type SyncJobType = "all" | "update" | "cleanup";
interface SyncRequestBody { type: SyncJobType; }

// (Pré-)Internationalização: Detecta o locale do usuário (para mensagens futuras)
function detectLocale(request: Request): "pt-BR" | "en" {
  const accept = request.headers.get("accept-language") || "";
  if (accept.includes("en")) return "en";
  return "pt-BR";
}

/**
 * API de Sincronização - Server-to-Server, Enterprise
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const locale = detectLocale(request);

  // 1. Segurança de ambiente
  if (!BACKEND_URL || !INTERNAL_API_SECRET) {
    // Não exponha detalhes de variável em produção
    throw new Error("Infra error: Backend API environment not configured.");
  }

  // 2. Autenticação do admin
  const authResult = await admin.authenticate.admin(request);
  if (!authResult?.session?.shop) {
    return json(
      { success: false, error: locale === "en" ? "Invalid admin session." : "Sessão de administrador inválida. Por favor, faça login novamente.", data: null },
      { status: 401 }
    );
  }
  const { shop } = authResult.session;

  // 3. Validação e parsing do body
  let body: SyncRequestBody;
  try {
    body = await request.json();
    if (!body.type || !["all", "update", "cleanup"].includes(body.type)) {
      return json({ success: false, error: locale === "en" ? "Invalid sync type." : "Parâmetro 'type' inválido.", data: null }, { status: 400 });
    }
  } catch {
    return json({ success: false, error: locale === "en" ? "Malformed JSON body." : "Body JSON malformado.", data: null }, { status: 400 });
  }

  // 4. Construção do endpoint
  const targetUrl = `${BACKEND_URL}/api/sync/${body.type}`;
  const method = body.type === "cleanup" ? "DELETE" : "POST";

  // 5. (Opcional) Adicionar rate limiting (futuro)
  // TODO: Implementar limitação por IP/shop para evitar abuso

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-secret": INTERNAL_API_SECRET,
      },
      body: JSON.stringify({ shopifyDomain: shop }),
    });

    // 6. Análise do retorno do backend
    let responseBody: any = null;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }

    if (!response.ok) {
      let errorMsg = locale === "en"
        ? `Error scheduling sync (status: ${response.status})`
        : `Erro ao agendar sincronização (status: ${response.status})`;
      if (typeof responseBody?.error === "string") {
        errorMsg = responseBody.error;
      }
      // (Nunca vaze detalhes técnicos mesmo em dev)
      // TODO: Centralizar logs (Datadog/Sentry) incluindo stack trace, request ID, etc.
      if (process.env.NODE_ENV !== "production") {
        console.error(`[API_SYNC] [${new Date().toISOString()}]`, errorMsg);
      }
      return json({ success: false, error: errorMsg, data: null }, { status: response.status });
    }

    // Sucesso: retorna shape padrão
    return json({ success: true, error: null, data: responseBody });

  } catch (error) {
    // Logging só controlado
    if (process.env.NODE_ENV !== "production") {
      console.error("[API_SYNC] Network/backend error:", error);
    }
    return json(
      {
        success: false,
        error: locale === "en"
          ? "Network error communicating with backend. Please try again shortly."
          : "Erro de rede ao comunicar com o backend. Tente novamente em instantes.",
        data: null
      },
      { status: 502 }
    );
  }
};