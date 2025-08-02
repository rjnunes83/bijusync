import { ActionFunctionArgs, json } from "@remix-run/node";
import { admin } from "../shopify.server";

// These environment variables MUST be set in your frontend .env file
const BACKEND_URL = process.env.BACKEND_API_URL;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

// Define allowed sync job types
type SyncJobType = "all" | "update" | "cleanup";

// Strongly type expected body
interface SyncRequestBody {
  type: SyncJobType;
}

/**
 * Enterprise-grade server-to-server sync endpoint.
 * - Authenticates the admin session (shop owner).
 * - Validates body and environment.
 * - Calls the backend with a signed secret for authorization.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  if (!BACKEND_URL || !INTERNAL_API_SECRET) {
    // Never leak secret names in prod error messages
    throw new Error("Backend API environment variables are not configured.");
  }

  // Authenticate current admin user
  const { session } = await admin.authenticate.admin(request);
  const { shop } = session;

  let body: SyncRequestBody;
  try {
    body = await request.json();
    if (!body.type || !["all", "update", "cleanup"].includes(body.type)) {
      return json({ error: "Invalid 'type' parameter." }, { status: 400 });
    }
  } catch (err) {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Compose backend URL and method
  const targetUrl = `${BACKEND_URL}/api/sync/${body.type}`;
  const method = body.type === "cleanup" ? "DELETE" : "POST";

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-secret": INTERNAL_API_SECRET, // Authorization header
      },
      body: JSON.stringify({ shopifyDomain: shop }),
    });

    if (!response.ok) {
      // Try to parse backend error, but never leak infra details
      let errorMsg = `Failed to schedule job (status: ${response.status})`;
      try {
        const errData = await response.json();
        if (typeof errData?.error === "string") {
          errorMsg = errData.error;
        }
      } catch (_) {
        // ignore
      }
      return json({ error: errorMsg }, { status: response.status });
    }

    const data = await response.json();
    return json(data);

  } catch (error) {
    // Log for audit, but do not leak internals
    console.error("[BFF] Communication error with backend sync endpoint.");
    return json({ error: "Network error while communicating with backend." }, { status: 502 });
  }
};