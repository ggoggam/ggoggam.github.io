import { useEffect } from "react";

const SITE_NAME = "꼬깜";
const SITE_URL = "https://ggoggam.github.io";

type SeoProps = {
  title?: string;
  description?: string;
  path?: string;
  type?: "website" | "article";
};

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

export function useSeo({ title, description, path = "/", type = "website" }: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = `${SITE_URL}${path}`;

  useEffect(() => {
    document.title = fullTitle;
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", type);
    setCanonical(url);

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
    }
  }, [fullTitle, description, url, type]);
}
