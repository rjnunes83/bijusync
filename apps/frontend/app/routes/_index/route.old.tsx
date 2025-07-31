import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  throw redirect("/app");
};

export default function Index() {
  return null; // nunca será chamado
}