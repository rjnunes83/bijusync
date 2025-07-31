// apps/frontend/app/routes/index.tsx
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Redireciona sempre para o dashboard Polaris
  throw redirect("/app");
};

export default function Index() {
  return null; // Nunca renderiza, só redireciona
}