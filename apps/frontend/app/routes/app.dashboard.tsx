// apps/frontend/app/routes/app.dashboard.tsx

/**
 * Dashboard da Revendedora - Área principal para revendedoras gerenciarem sua loja.
 * 
 * Este componente é exibido para revendedoras autenticadas, mostrando métricas,
 * ações rápidas e tutoriais para facilitar a gestão da loja.
 * 
 * Boas práticas:
 * - Utilize os espaços designados para adicionar novos cards e integrações.
 * - Mantenha a tipagem robusta para evitar erros em tempo de execução.
 * - Organize o layout para fácil expansão futura.
 */

import { useOutletContext } from "@remix-run/react";
import { Card, Page, Text, Layout, Banner } from "@shopify/polaris";

interface DashboardContext {
  shop: string;
}

export default function DashboardReseller() {
  const context = useOutletContext<DashboardContext | undefined>();

  if (!context) {
    // Caso o contexto não seja fornecido, renderizar mensagem de erro amigável
    return (
      <Page title="Dashboard da Revendedora">
        <Banner status="critical" title="Erro ao carregar dados">
          <p>Não foi possível carregar as informações da revendedora. Por favor, tente novamente.</p>
        </Banner>
      </Page>
    );
  }

  const { shop } = context;

  return (
    <Page title="Dashboard da Revendedora">
      <Layout>
        {/* Área de boas-vindas */}
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingLg">Bem-vinda, parceira {shop}</Text>
            <Text>
              Importe produtos, gerencie pedidos e acompanhe o status da sua loja revendedora.
            </Text>
          </Card>
        </Layout.Section>

        {/* Área de métricas - Exemplo: status rápido da loja */}
        <Layout.Section>
          <Card title="Métricas da Loja" sectioned>
            {/* Exemplo de métrica ou aviso */}
            <Text>Pedidos pendentes: 5</Text>
            <Text>Produtos em estoque: 120</Text>
            {/* Desenvolvedores futuros: adicionar gráficos ou cards de métricas aqui */}
          </Card>
        </Layout.Section>

        {/* Área de ações rápidas */}
        <Layout.Section>
          <Card title="Ações Rápidas" sectioned>
            {/* Desenvolvedores futuros: incluir botões ou cards para importar produtos, criar pedidos, etc */}
            <Text>Botões e links para ações rápidas serão adicionados aqui.</Text>
          </Card>
        </Layout.Section>

        {/* Área de tutoriais e suporte */}
        <Layout.Section>
          <Card title="Tutoriais e Suporte" sectioned>
            {/* Desenvolvedores futuros: adicionar vídeos, FAQs ou links de suporte */}
            <Text>Conteúdo de suporte e tutoriais para ajudar as revendedoras.</Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}