import { createRouter as createTanStackRouter, type RouterHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Shared factory so the client and the prerender server build identical routers.
// `history` is omitted on the client (defaults to browser history) and provided
// as a memory history during static prerendering.
export function createRouter(history?: RouterHistory) {
  return createTanStackRouter({ routeTree, history });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
