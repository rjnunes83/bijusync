import { ActionFunctionArgs, json } from "@remix-run/node";
import { admin } from "../shopify.server";

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await admin.authenticate.admin(request);
  const { shop } = session;
  const body = await request.json(); // ex: { type: 'all' }

  // Chamada do servidor Remix para o backend, com o segredo
  try {
    const response = await fetch(`${BACKEND_URL}/api/sync/${body.type}`, {
      method: 'POST', // Ajuste PATCH, DELETE, etc. conforme o tipo
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-secret': INTERNAL_API_SECRET,
      },
      body: JSON.stringify({ shopifyDomain: shop }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json({ error: errorData.error || 'Falha ao agendar o job.' }, { status: response.status });
    }

    const data = await response.json();
    return json(data);

  } catch (error) {
    return json({ error: 'Erro de rede ao comunicar com o backend.' }, { status: 500 });
  }
};