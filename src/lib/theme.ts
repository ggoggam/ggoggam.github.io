import { useEffect, useSyncExternalStore } from "react";

export type ThemePref = "system" | "light" | "dark";

const STORAGE_KEY = "theme";

/* An explicit switch never fires the media query, so anything that reads a
   colour at paint time has to hear about it some other way. */
const THEME_CHANGE_EVENT = "themechange";

export function readThemePref(): ThemePref {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

export function applyThemePref(pref: ThemePref) {
  const root = document.documentElement;
  // The absence of the attribute is what hands the page back to
  // prefers-color-scheme, so "system" removes it rather than writing a third
  // value the stylesheet would then have to match on.
  if (pref === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", pref);

  // The address bar follows the same choice: the two metas stay media-scoped
  // under "system" and collapse to the chosen one under an explicit theme.
  const metas = document.querySelectorAll<HTMLMetaElement>("meta[name='theme-color']");
  for (const meta of metas) {
    const scheme = meta.dataset.scheme;
    meta.media =
      pref === "system" ? `(prefers-color-scheme: ${scheme})` : pref === scheme ? "all" : "not all";
  }
}

export function writeThemePref(pref: ThemePref) {
  try {
    if (pref === "system") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    // A blocked store still leaves the page themed for this visit.
  }
  applyThemePref(pref);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

/** Fires on this tab's toggle and on the same choice made in another tab. */
function subscribeThemePref(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== STORAGE_KEY) return;
    // A second tab wrote the choice; this one still has to act on it.
    applyThemePref(readThemePref());
    onChange();
  };
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** The stored preference, read from the store rather than mirrored into state. */
export function useThemePref(): ThemePref {
  return useSyncExternalStore(subscribeThemePref, readThemePref, () => "system" as ThemePref);
}

/**
 * Canvas work reads its strokes from the live custom properties, so it needs a
 * redraw whenever the resolved theme changes — by system flip or by the toggle.
 */
export function useThemeChange(onChange: () => void) {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", onChange);
    const unsubscribe = subscribeThemePref(onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      unsubscribe();
    };
  }, [onChange]);
}
