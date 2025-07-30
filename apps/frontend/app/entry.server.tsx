/**
 * Server entry point for handling incoming requests and streaming React server-side rendered content.
 * Utilizes React 18's streaming SSR capabilities with Remix framework integration.
 * Handles bot detection for appropriate streaming strategy and manages response headers.
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

/**
 * Timeout duration in milliseconds for aborting the React SSR stream if it takes too long.
 */
export const streamTimeout: number = 5000;

/**
 * Handles incoming HTTP requests by rendering the React application to a stream,
 * setting appropriate headers, and returning a streaming Response.
 *
 * @param request - The incoming HTTP request object.
 * @param responseStatusCode - The HTTP status code to use for the response.
 * @param responseHeaders - The Headers object to populate response headers.
 * @param remixContext - The Remix entry context containing route data and other info.
 * @returns A Promise resolving to a Response object streaming the rendered React app.
 */
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
): Promise<Response> {
  // Add any necessary Shopify-specific headers to the response
  addDocumentResponseHeaders(request, responseHeaders);

  // Detect if the user agent is a bot to decide streaming strategy
  const userAgent: string | null = request.headers.get("user-agent");
  const callbackName: "onAllReady" | "onShellReady" = isbot(userAgent ?? '')
    ? "onAllReady"
    : "onShellReady";

  return new Promise((resolve, reject) => {
    // Start rendering the React application to a pipeable stream
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
      />,
      {
        // Triggered when the shell or full content is ready depending on client type
        [callbackName]: () => {
          const body = new PassThrough();
          // Convert Node.js readable stream to a WHATWG ReadableStream for Response
          const stream = createReadableStreamFromReadable(body);

          // Set content type header for HTML response
          responseHeaders.set("Content-Type", "text/html");

          // Resolve the promise with a streaming Response
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          // Start piping the React stream into the PassThrough stream
          pipe(body);
        },

        // Called if there is an error before shell is ready
        onShellError(error: unknown) {
          reject(error);
        },

        // Called on any error during streaming after shell is sent
        onError(error: unknown) {
          responseStatusCode = 500;
          console.error(
            "React SSR streaming error occurred during server-side rendering:",
            error
          );
        },
      }
    );

    // Automatically abort React rendering if it takes longer than timeout + buffer
    // Ensures server does not hang indefinitely on slow or stuck renders
    setTimeout(abort, streamTimeout + 1000);
  });
}
