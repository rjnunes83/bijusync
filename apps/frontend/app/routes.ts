/**
 * [routes.ts] - Configuração global de rotas para o app Remix.
 * 
 * 🚀 Enterprise-ready: 
 * - Permite flat routing (fs-based) padrão Remix.
 * - Fácil expansão para middlewares, wrappers ou logging futuro.
 * - Documentação explícita para onboard rápido do time.
 * 
 * Para adicionar wrappers ou middlewares de rota:
 *   - Veja docs: https://remix.run/docs/en/main/guides/routing#flat-routes
 *   - Exemplos no README do projeto.
 */

import { flatRoutes } from "@remix-run/fs-routes";

// Caso precise customizar, altere abaixo:
const routes = flatRoutes();

export default routes;