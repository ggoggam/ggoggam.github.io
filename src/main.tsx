import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { createRouter } from "./router";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./app/globals.css";

const router = createRouter();
const rootElement = document.getElementById("root")!;

// The page HTML is prerendered at build time (see scripts/prerender.mjs): crawlers
// and the first paint get fully-rendered content. TanStack Router (without TanStack
// Start) cannot cleanly hydrate that markup, so we resolve the current route's
// loaders and then mount over the prerendered HTML with createRoot. The rendered
// output matches the server markup, so the swap is imperceptible.
router.load().then(() => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
});
