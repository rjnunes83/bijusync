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
import polarisTranslations from "../../locales/pt-BR.json"; // ✅ PADRÃO enterprise: arquivo local
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

// Injeção de estilos do Polaris
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

// Loader: prepara dados iniciais e traduções
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));
  // No futuro: internacionalização dinâmica aqui
  return { errors, i18n: polarisTranslations };
};

// Action: executada no submit do form
export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

// Página de login
export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const [isPending, startTransition] = useTransition();

  // Referência para focar no campo com erro
  const shopInputRef = useRef<HTMLInputElement>(null);

  // Exibe erro do action ou loader
  const errors = actionData?.errors ?? loaderData.errors;

  // Foca automaticamente no campo de erro, se houver
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
            <Banner status="critical" title="Erro ao fazer login">
              <p>{errors.global}</p>
            </Banner>
          )}
          <Form
            method="post"
            aria-label="Formulário de login Shopify"
            onSubmit={() => {
              startTransition(() => {});
            }}
          >
            <FormLayout>
              <Text variant="headingMd" as="h2">
                Entrar na sua Loja Shopify
              </Text>
              <TextField
                type="text"
                name="shop"
                label="Domínio da loja"
                helpText="exemplo.myshopify.com"
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
                Entrar
              </Button>
            </FormLayout>
          </Form>
        </Card>
      </Page>
    </PolarisAppProvider>
  );
}