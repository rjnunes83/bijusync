# 🚀 BijuSync Platform — Enterprise Shopify Connector

**Plataforma Enterprise de Sincronização de Produtos, Estoque e Catálogo entre Lojas Shopify (Matriz e Revendas)**  
Desenvolvido para o ecossistema Biju & Cia.

---

## ⚡️ VISÃO GERAL

BijuSync é uma aplicação full-stack **Node.js + Remix + Shopify Polaris**, criada para **escalar operações de franquias, revendas e afiliados** no universo Shopify.  
Permite que lojas "filhas" (revendedoras) recebam produtos, preços e estoques em tempo real da loja-mãe (Biju & Cia.), com possibilidade de customização futura de regras, markups, ofertas, idiomas e integrações multi-plataforma.

---

## 🏗️ STACK ESTRUTURAL

- **Frontend**: Remix.run, React 18+, TypeScript, Shopify Polaris (UI Kit Oficial)
- **Backend**: Node.js 18+, Remix (SSR/Streaming), Express (API), Shopify App Remix SDK
- **Banco de Dados**: PostgreSQL (pronto para MySQL/Cloud/Serverless)
- **ORM**: Prisma (auto-migrations, geração tipada)
- **Autenticação**: OAuth 2.0 oficial Shopify + Session Storage Enterprise (Prisma)
- **Infra**: Render.com (Deploy Cloud, CI/CD), pronto para Vercel/Heroku/AWS
- **Outros**: Husky (git hooks), ESLint/Prettier (code style), rimraf (cleaner)

---

## 📂 ESTRUTURA DE PASTAS

```txt
biju-sync-platform/
│
├── apps/
│   ├── backend/      # API REST, endpoints Shopify, webhooks
│   └── frontend/     # Remix SSR, UI Polaris, Dashboard, Rotas
│
├── prisma/           # Schema e migrações
├── .env.example      # Configuração de variáveis de ambiente
├── package.json      # Monorepo scripts e dependências globais
├── README.md         # Este guia!
│
└── ... (scripts, configs, docs)
```

---

## 🧑‍💻 PADRÃO DE CÓDIGO E BOAS PRÁTICAS

- **Todos os arquivos TypeScript**
- **Comentários de bloco em padrão JSDoc e [Enterprise]**
- **SCSS/CSS apenas em componentes Polaris ou em arquivos isolados**
- **Divisão clara entre responsabilidades do frontend e backend**
- **Nomenclatura de variáveis, pastas e funções em inglês internacional**
- **TODOS obrigatórios em todas as funções e handlers críticos**
- **Check de ambiente robusto: nunca sobe para produção sem variáveis obrigatórias**
- **Pronto para escalabilidade horizontal e logging centralizado (SaaS ready)**
- **Segurança OAuth, checagem de origem de requests, tokens e CSRF**

---

## 🚦 FLUXO FUNCIONAL

1. **Instalação e Autorização**
    - App pode ser instalada tanto na loja-mãe quanto em lojas revendedoras via OAuth Shopify.
    - Armazena token seguro em PostgreSQL (Prisma Session Storage).
2. **Dashboard Unificada**
    - Sidebar Polaris com navegação entre Dashboard, Catálogo, Lojas, Sync, Configurações, Suporte.
    - TopBar com User Menu (pronto para multiusuário/futuro RBAC).
3. **Sincronização de Produtos**
    - Botão “Sincronizar Agora” dispara endpoint `/api/sync` que clona catálogo e estoque da loja-mãe para as revendas autorizadas.
    - Logs visuais de sucesso/erro (Banner Polaris).
4. **Gerenciamento de Lojas**
    - Tabela “Lojas Conectadas” exibe domínios, datas de cadastro, status de integração e saúde do token.
5. **Configurações**
    - Pronto para configurar Markup, Idiomas, Limites de Sincronização, etc.
6. **Suporte**
    - Banner de contato direto (e-mail, WhatsApp).
7. **Multiidioma**
    - Pronto para PT-BR, EN-US e outros, basta trocar locale no Polaris.

---

## 🔒 SEGURANÇA E CONFORMIDADE

- **OAuth 2.0, HMAC Validation, Webhook Registry**
- **GDPR Ready** (não armazena dados sensíveis dos clientes Shopify)
- **Variáveis de ambiente nunca hardcoded**
- **Session Storage em banco com TTL**
- **Pronto para integração com monitoramento (Sentry, Datadog, LogRocket)**

---

## 🧰 COMO SUBIR LOCAL

1. **Clone o repositório**
    ```bash
    git clone https://github.com/rjnunes83/biju-sync
    cd biju-sync-platform
    ```

2. **Configure o .env**
    - Copie `.env.example` para `.env` e preencha todas as variáveis (chaves Shopify, URL, DB).

3. **Instale as dependências**
    ```bash
    npm install
    ```

4. **Rode as migrations do banco**
    ```bash
    npx prisma migrate dev
    ```

5. **Start all (dev)**
    ```bash
    npm run dev
    # ou, em terminais separados:
    npm run dev:backend
    npm run dev:frontend
    ```

6. **Acesse via browser**
    - Frontend: [http://localhost:3000/app?shop=sualoja.myshopify.com](http://localhost:3000/app?shop=sualoja.myshopify.com)

---

## 🔗 VARIÁVEIS DE AMBIENTE (EXEMPLO)

```env
# .env
SHOPIFY_API_KEY=xxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_SECRET=xxxxxxxxxxxxxxxxxxxx
SHOPIFY_APP_URL=https://suadomain.com
DATABASE_URL=postgresql://user:pass@host:5432/dbname
MAIN_SHOP_DOMAIN=loja-mae.myshopify.com
SCOPES=read_products,write_products,read_inventory,write_inventory
SHOP_CUSTOM_DOMAIN=
```

---

## 🏆 DIFERENCIAIS ENTERPRISE

- **Pronto para multi-tenant (múltiplas lojas-mãe e revendas)**
- **Ciclo de vida de tokens 100% gerenciado**
- **Plugável: integra com qualquer serviço de ERP/fiscal/frete**
- **Observability: preparado para log, tracing e monitoramento**
- **Código limpo, padrão internacional, extensível para App Store**
- **Pronto para SaaS, White Label e internacionalização**

---

## 👥 CONTRIBUIÇÃO

- Branch naming: `feature/nome`, `fix/bug`, `hotfix/urgente`
- PRs precisam de revisão obrigatória, descrição clara e link para a issue/tarefa
- Commits padronizados (`conventional commits`)
- Código sempre testado local antes de subir
- Issues de segurança ou dúvidas devem ser reportadas para <rodrigo@nx7biz.com>

---

## 🤝 CONTATO & SUPORTE

- Dev Lead: **Rodrigo Nunes**  
  [LinkedIn](https://www.linkedin.com/in/rjnunes83) — <rodrigo@nx7biz.com>
- Suporte: suporte@bijuecia.com

---

## 📜 LICENÇA

MIT License — Sinta-se livre para usar, contribuir e distribuir com créditos ao projeto original.

---

> **BijuSync nasceu para revolucionar o modelo de vendas em rede no Shopify.  
> Escale, automatize, conquiste mercados e foque no crescimento —  
> a tecnologia deixa com a gente.**

---
