import { ActionFunctionArgs, json } from "@remix-run/node";
import { admin } from "../shopify.server";

// Estas variáveis de ambiente DEVEM estar no .env do seu frontend
const BACKEND_URL = process.env.BACKEND_API_URL;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export const action = async ({ request }: ActionFunctionArgs) => {
  if (!BACKEND_URL || !INTERNAL_API_SECRET) {
    throw new Error("Variáveis de ambiente do backend não configuradas no frontend.");
  }

  // Autentica a requisição para garantir que vem de um comerciante logado
  const { session } = await admin.authenticate.admin(request);
  const { shop } = session;
  const body = await request.json(); // ex: { type: 'all' | 'update' | 'cleanup' }

  // Constrói a URL do endpoint do backend
  const targetUrl = `${BACKEND_URL}/api/sync/${body.type}`;
  const method = body.type === 'cleanup' ? 'DELETE' : 'POST'; // Ajusta o método HTTP

  try {
    // A action do Remix faz a chamada segura servidor-para-servidor para o backend
    const response = await fetch(targetUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-secret': INTERNAL_API_SECRET, // <-- O segredo
      },
      body: JSON.stringify({ shopifyDomain: shop }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json({ error: errorData.error || `Falha ao agendar o job (status: ${response.status})` }, { status: response.status });
    }

    const data = await response.json();
    return json(data);

  } catch (error) {
    console.error("[BFF] Erro de comunicação com o backend:", error);
    return json({ error: 'Erro de rede ao comunicar com o backend.' }, { status: 500 });
  }
};
