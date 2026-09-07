import { useThemePref, writeThemePref, type ThemePref } from "@/lib/theme";

// Light and dark are peer themes here, so "system" stays a real position in the
// cycle rather than something you lose the moment you touch the control.
const NEXT: Record<ThemePref, ThemePref> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const LABEL: Record<ThemePref, string> = {
  system: "auto",
  light: "light",
  dark: "dark",
};

export default function ThemeToggle() {
  // The boot script in index.html has already themed the document before paint;
  // this only has to name the choice. The prerendered markup says "auto" and the
  // store is read after hydration, which is what useSyncExternalStore is for.
  const pref = useThemePref();
  const next = NEXT[pref];

  return (
    <button
      type="button"
      onClick={() => writeThemePref(next)}
      // Name both the current icon's state and the next action.
      aria-label={`Theme: ${LABEL[pref]}. Switch to ${LABEL[next]}.`}
      title={`Theme: ${LABEL[pref]}`}
      className="theme-toggle"
    >
      <svg
        aria-hidden="true"
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        {pref === "system" ? (
          <>
            <rect x="3" y="4" width="18" height="13" rx="3" />
            <path d="M8 21h8m-4-4v4" />
          </>
        ) : pref === "light" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </>
        ) : (
          <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />
        )}
      </svg>
      <span className="sr-only">{LABEL[pref]}</span>
    </button>
  );
}
