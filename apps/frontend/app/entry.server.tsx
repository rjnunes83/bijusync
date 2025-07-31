/**
 * Server entry for streaming SSR with React 18 + Remix + Shopify.
 * Enterprise: Comentários JSDoc, logs limpos, tratamento seguro de erros.
 */

import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from "@remix-run/react";
import {
  createReadableStreamFromReadable,
  type EntryContext,
} from "@remix-run/node";
import { isbot } from "isbot";
import { addDocumentResponseHeaders } from "./shopify.server";

/** Tempo máximo de streaming (ms) para abortar SSR */
const STREAM_TIMEOUT_MS = 5000;

/**
 * Decide o modo de streaming baseado no user-agent (bot vs browser).
 */
function getStreamingCallbackName(request: Request): "onAllReady" | "onShellReady" {
  const userAgent = request.headers.get("user-agent") || "";
  return isbot(userAgent) ? "onAllReady" : "onShellReady";
}

/**
 * Entry point SSR: gera a resposta HTML do app.
 * @param request HTTP Request recebido
 * @param responseStatusCode Código de status da resposta
 * @param responseHeaders Headers da resposta
 * @param remixContext Contexto Remix (rotas, loaders, etc)
 * @returns Response HTML streaming SSR
 */
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
): Promise<Response> {
  // Adiciona headers enterprise (Shopify, CDN, observabilidade, etc)
  addDocumentResponseHeaders(request, responseHeaders);
  responseHeaders.set("X-Powered-By", "BijuSync-SSR/Remix");

  const callbackName = getStreamingCallbackName(request);

  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        // Bot: só responde quando tudo pronto | User: responde o shell e carrega o resto via stream
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");

          // Log enterprise só em dev
          if (process.env.NODE_ENV === "development") {
            console.log(`[SSR] Streaming response (${callbackName}) para: ${request.url}`);
          }

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );
          pipe(body);
        },
        onShellError(error: unknown) {
          // Retorna erro HTML amigável para navegador (ou monitoring)
          reject(
            new Response(
              `<h1>Erro ao renderizar a aplicação</h1><pre>${escapeHtml(String(error))}</pre>`,
              {
                status: 500,
                headers: { "Content-Type": "text/html" },
              }
            )
          );
        },
        onError(error: unknown) {
          didError = true;
          if (process.env.NODE_ENV === "development") {
            console.error("[SSR] Erro durante streaming React:", error);
          }
        },
      }
    );
    setTimeout(abort, STREAM_TIMEOUT_MS + 1000);
  });
}

/**
 * Escapa HTML básico para mensagem de erro
 */
function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, function (m) {
    switch (m) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#039;";
      default: return m;
    }
  });
}