"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { THEMES, DEFAULT_THEME, applyTheme, type Theme, type ThemeName } from "@/lib/themes";

export { THEMES };
export type { Theme, ThemeName };

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme from localStorage on first render
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as ThemeName;
      if (savedTheme && THEMES[savedTheme]) {
        return savedTheme;
      }
    }
    return DEFAULT_THEME;
  });

  // Apply theme whenever themeName changes
  useEffect(() => {
    localStorage.setItem("theme", themeName);
    applyTheme(THEMES[themeName]);
  }, [themeName]);

  const theme = THEMES[themeName];

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme: setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
