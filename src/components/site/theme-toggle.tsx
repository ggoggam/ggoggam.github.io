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
      // The visible word is the current theme, so the accessible name has to say
      // which half of that is state and which half is what the press will do.
      aria-label={`Theme: ${LABEL[pref]}. Switch to ${LABEL[next]}.`}
      title={`Theme: ${LABEL[pref]}`}
      // Widened to the longest label so the nav does not reflow as it cycles.
      className="label block w-[9ch] px-2 py-1 text-right transition-colors hover:text-ink"
    >
      {LABEL[pref]}
    </button>
  );
}
