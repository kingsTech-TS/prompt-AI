"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define theme types
export type ThemeName =
  | "dark-orange"
  | "dark-blue"
  | "dark-purple"
  | "dark-green"
  | "dark-pink"
  | "light-orange"
  | "light-blue"
  | "light-purple"
  | "light-green"
  | "light-pink";

interface Theme {
  name: ThemeName;
  label: string;
  isDark: boolean;
  colors: {
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    borderHover: string;
    accent1: string;
    accent2: string;
    accentText: string;
  };
}

// Define our 5+ themes with both dark and light
const THEMES: Record<ThemeName, Theme> = {
  "dark-orange": {
    name: "dark-orange",
    label: "Dark Orange",
    isDark: true,
    colors: {
      background: "#1a1a1a",
      backgroundSecondary: "#212121",
      backgroundTertiary: "#2f2f2f",
      text: "#ffffff",
      textSecondary: "#9ca3af",
      textTertiary: "#6b7280",
      border: "#3f3f3f",
      borderHover: "#525252",
      accent1: "#eab308",
      accent2: "#f97316",
      accentText: "#000000",
    },
  },
  "dark-blue": {
    name: "dark-blue",
    label: "Dark Blue",
    isDark: true,
    colors: {
      background: "#0f172a",
      backgroundSecondary: "#1e293b",
      backgroundTertiary: "#334155",
      text: "#ffffff",
      textSecondary: "#94a3b8",
      textTertiary: "#64748b",
      border: "#475569",
      borderHover: "#64748b",
      accent1: "#3b82f6",
      accent2: "#2563eb",
      accentText: "#ffffff",
    },
  },
  "dark-purple": {
    name: "dark-purple",
    label: "Dark Purple",
    isDark: true,
    colors: {
      background: "#1f1b2e",
      backgroundSecondary: "#2d2640",
      backgroundTertiary: "#4338ca",
      text: "#ffffff",
      textSecondary: "#a78bfa",
      textTertiary: "#818cf8",
      border: "#4c1d95",
      borderHover: "#6d28d9",
      accent1: "#a855f7",
      accent2: "#7c3aed",
      accentText: "#ffffff",
    },
  },
  "dark-green": {
    name: "dark-green",
    label: "Dark Green",
    isDark: true,
    colors: {
      background: "#06202a",
      backgroundSecondary: "#0f5132",
      backgroundTertiary: "#0d6efd",
      text: "#ffffff",
      textSecondary: "#6ee7b7",
      textTertiary: "#34d399",
      border: "#15803d",
      borderHover: "#16a34a",
      accent1: "#10b981",
      accent2: "#059669",
      accentText: "#ffffff",
    },
  },
  "dark-pink": {
    name: "dark-pink",
    label: "Dark Pink",
    isDark: true,
    colors: {
      background: "#1f1322",
      backgroundSecondary: "#2d1f30",
      backgroundTertiary: "#4a2f4d",
      text: "#ffffff",
      textSecondary: "#f472b6",
      textTertiary: "#ec4899",
      border: "#9d174d",
      borderHover: "#be185d",
      accent1: "#ec4899",
      accent2: "#db2777",
      accentText: "#ffffff",
    },
  },
  "light-orange": {
    name: "light-orange",
    label: "Light Orange",
    isDark: false,
    colors: {
      background: "#ffffff",
      backgroundSecondary: "#f3f4f6",
      backgroundTertiary: "#e5e7eb",
      text: "#111827",
      textSecondary: "#4b5563",
      textTertiary: "#6b7280",
      border: "#d1d5db",
      borderHover: "#9ca3af",
      accent1: "#eab308",
      accent2: "#f97316",
      accentText: "#000000",
    },
  },
  "light-blue": {
    name: "light-blue",
    label: "Light Blue",
    isDark: false,
    colors: {
      background: "#ffffff",
      backgroundSecondary: "#eff6ff",
      backgroundTertiary: "#dbeafe",
      text: "#1e293b",
      textSecondary: "#475569",
      textTertiary: "#64748b",
      border: "#bfdbfe",
      borderHover: "#93c5fd",
      accent1: "#3b82f6",
      accent2: "#2563eb",
      accentText: "#ffffff",
    },
  },
  "light-purple": {
    name: "light-purple",
    label: "Light Purple",
    isDark: false,
    colors: {
      background: "#ffffff",
      backgroundSecondary: "#f5f3ff",
      backgroundTertiary: "#ede9fe",
      text: "#1f2937",
      textSecondary: "#4b5563",
      textTertiary: "#6b7280",
      border: "#ddd6fe",
      borderHover: "#c4b5fd",
      accent1: "#a855f7",
      accent2: "#7c3aed",
      accentText: "#ffffff",
    },
  },
  "light-green": {
    name: "light-green",
    label: "Light Green",
    isDark: false,
    colors: {
      background: "#ffffff",
      backgroundSecondary: "#f0fdf4",
      backgroundTertiary: "#dcfce7",
      text: "#064e3b",
      textSecondary: "#16a34a",
      textTertiary: "#15803d",
      border: "#bbf7d0",
      borderHover: "#86efac",
      accent1: "#10b981",
      accent2: "#059669",
      accentText: "#ffffff",
    },
  },
  "light-pink": {
    name: "light-pink",
    label: "Light Pink",
    isDark: false,
    colors: {
      background: "#ffffff",
      backgroundSecondary: "#fdf2f8",
      backgroundTertiary: "#fce7f3",
      text: "#1f2937",
      textSecondary: "#4b5563",
      textTertiary: "#6b7280",
      border: "#fbcfe8",
      borderHover: "#f9a8d4",
      accent1: "#ec4899",
      accent2: "#db2777",
      accentText: "#ffffff",
    },
  },
};

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
    return "dark-orange"; // default theme
  });

  // Apply theme whenever themeName changes
  useEffect(() => {
    const theme = THEMES[themeName];
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", themeName);
    }
    
    // Apply CSS variables
    document.documentElement.style.setProperty("--theme-background", theme.colors.background);
    document.documentElement.style.setProperty("--theme-background-secondary", theme.colors.backgroundSecondary);
    document.documentElement.style.setProperty("--theme-background-tertiary", theme.colors.backgroundTertiary);
    document.documentElement.style.setProperty("--theme-text", theme.colors.text);
    document.documentElement.style.setProperty("--theme-text-secondary", theme.colors.textSecondary);
    document.documentElement.style.setProperty("--theme-text-tertiary", theme.colors.textTertiary);
    document.documentElement.style.setProperty("--theme-border", theme.colors.border);
    document.documentElement.style.setProperty("--theme-border-hover", theme.colors.borderHover);
    document.documentElement.style.setProperty("--theme-accent-1", theme.colors.accent1);
    document.documentElement.style.setProperty("--theme-accent-2", theme.colors.accent2);
    document.documentElement.style.setProperty("--theme-accent-text", theme.colors.accentText);
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
