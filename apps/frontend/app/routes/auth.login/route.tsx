// apps/frontend/app/routes/auth.login/route.tsx

import { useState, useTransition, useRef, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
  Banner,
} from "@shopify/polaris";
import ptBR from "../../locales/pt-BR.json";
import en from "../../locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";
import { json } from "@remix-run/node"; // Importar o json do Remix

// Injeção de estilos do Polaris
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

/**
 * Função enterprise para detectar idioma da request.
 */
function detectLocale(request: Request): "pt-BR" | "en" {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang");
  if (lang === "en") return "en";
  if (lang === "pt-BR") return "pt-BR";
  const acceptLanguage = request.headers.get("accept-language") || "";
  if (acceptLanguage.includes("en")) return "en";
  return "pt-BR";
}

// Loader: prepara dados iniciais e traduções
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = detectLocale(request);
  const i18n = locale === "en" ? en : ptBR;
  const errors = loginErrorMessage(await login(request), locale);
  return json({ errors, i18n, locale });
};

// Action: executada no submit do form
export const action = async ({ request }: ActionFunctionArgs) => {
  const locale = detectLocale(request);
  const errors = loginErrorMessage(await login(request), locale);
  return json({ errors, locale });
};

// Página de login enterprise
export default function AuthLoginRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const [isPending, startTransition] = useTransition();
  const shopInputRef = useRef<HTMLInputElement>(null);

  // Erros priorizando actionData (após submit), senão loaderData (primeira render)
  const errors = actionData?.errors ?? loaderData.errors;

  // Foca automaticamente no campo de erro
  useEffect(() => {
    if (errors?.shop && shopInputRef.current) {
      shopInputRef.current.focus();
    }
  }, [errors]);

  return (
    <PolarisAppProvider i18n={loaderData.i18n}>
      <Page>
        <Card>
          {errors?.global && (
            <Banner status="critical" title={loaderData.locale === "en" ? "Login Error" : "Erro ao fazer login"}>
              <p>{errors.global}</p>
            </Banner>
          )}
          <Form
            method="post"
            aria-label="Formulário de login Shopify"
            onSubmit={() => startTransition(() => {})}
          >
            <FormLayout>
              <Text variant="headingMd" as="h2">
                {loaderData.locale === "en"
                  ? "Sign in to your Shopify Store"
                  : "Entrar na sua Loja Shopify"}
              </Text>
              <TextField
                type="text"
                name="shop"
                label={loaderData.locale === "en" ? "Shop domain" : "Domínio da loja"}
                helpText={loaderData.locale === "en"
                  ? "example.myshopify.com"
                  : "exemplo.myshopify.com"
                }
                value={shop}
                onChange={setShop}
                autoComplete="on"
                required
                error={errors?.shop}
                aria-invalid={!!errors?.shop}
                aria-describedby="shop-error"
                inputRef={shopInputRef}
              />
              <Button submit primary loading={isPending} disabled={isPending}>
                {loaderData.locale === "en" ? "Sign in" : "Entrar"}
              </Button>
            </FormLayout>
          </Form>
        </Card>
      </Page>
    </PolarisAppProvider>
  );
}