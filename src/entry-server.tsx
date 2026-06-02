import { renderToString } from "react-dom/server";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { createRouter } from "./router";

// Renders a route to static HTML for build-time prerendering (SSG).
// The client re-runs the same loaders before hydrating, so the markup matches.
export async function render(url: string): Promise<string> {
  const router = createRouter(createMemoryHistory({ initialEntries: [url] }));
  await router.load();
  return renderToString(<RouterProvider router={router} />);
}
