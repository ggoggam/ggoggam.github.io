import { createContext, useContext, useState } from "react";

type NavKey = "home" | "blog" | "til" | "about" | null;

const NavHoverContext = createContext<{
  hovered: NavKey;
  setHovered: (key: NavKey) => void;
}>({ hovered: null, setHovered: () => {} });

export function NavHoverProvider({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState<NavKey>(null);
  return (
    <NavHoverContext.Provider value={{ hovered, setHovered }}>{children}</NavHoverContext.Provider>
  );
}

export function useNavHover() {
  return useContext(NavHoverContext);
}
