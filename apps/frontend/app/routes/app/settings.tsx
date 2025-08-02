// apps/frontend/app/routes/app/settings.tsx
import {
  Page,
  Card,
  Button,
  Layout,
  TextContainer,
  Banner,
  Icon,
} from "@shopify/polaris";
import { SettingsMajor } from "@shopify/polaris-icons";
import { useNavigate } from "@remix-run/react";
// import ptBR from "../../locales/pt-BR.json";
// import en from "../../locales/en.json";

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <Page
      title="Configurações"
      subtitle="Personalize todos os aspectos da sua plataforma Biju & Cia."
      backAction={{ content: "Voltar", onAction: () => navigate(-1) }}
      primaryAction={{
        content: "Salvar Tudo",
        disabled: true,
        accessibilityLabel: "Salvar configurações (em breve)",
        onAction: () => {},
      }}
      fullWidth
    >
      <Banner
        status="info"
        title="Novidades em breve!"
        icon={<Icon source={SettingsMajor} color="highlight" />}
      >
        Em breve, novas opções de configuração estarão disponíveis para personalizar ainda mais sua experiência na plataforma.
      </Banner>
      <Layout>
        <SettingsSection
          title="Sincronização"
          description="Gerencie as configurações de sincronização dos seus dados e integrações automáticas."
          onConfig={() => navigate("/app/settings/sync")}
          available={false}
        />
        <SettingsSection
          title="Usuários e Permissões"
          description="Controle o acesso, permissões e gerenciamento de usuários da aplicação."
          onConfig={() => navigate("/app/settings/users")}
          available={false}
        />
        <SettingsSection
          title="API & Integrações"
          description="Configure chaves de API, webhooks e integrações com serviços externos."
          onConfig={() => navigate("/app/settings/api")}
          available={false}
        />
        <SettingsSection
          title="Personalização Visual"
          description="Ajuste temas, cores e outros aspectos visuais para personalizar sua experiência."
          onConfig={() => navigate("/app/settings/theme")}
          available={false}
        />
        <SettingsSection
          title="Suporte"
          description="Acesse opções de suporte, documentação e ajuda para sua aplicação."
          onConfig={() => navigate("/app/settings/support")}
          available={false}
        />
      </Layout>
    </Page>
  );
}

/**
 * SettingsSection — Enterprise: modular, pronto para ativar lógica real de configuração via rollout/feature flag.
 */
function SettingsSection({
  title,
  description,
  onConfig,
  available = false,
}: {
  title: string;
  description: string;
  onConfig: () => void;
  available?: boolean;
}) {
  return (
    <Layout.Section>
      <Card
        title={title}
        sectioned
        primaryFooterAction={{
          content: "Configurar",
          onAction: available ? onConfig : () => {},
          disabled: !available,
          accessibilityLabel: available
            ? `Abrir configuração de ${title}`
            : "Configuração em breve disponível",
        }}
        aria-label={`Configuração de ${title}`}
      >
        <TextContainer>
          <p>{description}</p>
          <small style={{ color: "#888" }}>
            {available ? "Disponível" : "Funcionalidade em breve."}
          </small>
        </TextContainer>
      </Card>
    </Layout.Section>
  );
}