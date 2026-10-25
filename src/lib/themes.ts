// Shared by the client ThemeProvider and the root layout's pre-hydration script,
// so it must stay free of "use client" and React imports.

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

export interface Theme {
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

export const DEFAULT_THEME: ThemeName = "dark-orange";

export const THEMES: Record<ThemeName, Theme> = {
  "dark-orange": {
    name: "dark-orange",
    label: "Dark Orange",
    isDark: true,
    colors: {
      background: "#0c0c0d",
      backgroundSecondary: "#141416",
      backgroundTertiary: "#1d1d20",
      text: "#f4f4f5",
      textSecondary: "#a1a1aa",
      textTertiary: "#71717a",
      border: "#27272a",
      borderHover: "#3f3f46",
      accent1: "#f59e0b",
      accent2: "#f97316",
      accentText: "#0c0a09",
    },
  },
  "dark-blue": {
    name: "dark-blue",
    label: "Dark Blue",
    isDark: true,
    colors: {
      background: "#0a0d14",
      backgroundSecondary: "#10151f",
      backgroundTertiary: "#18202d",
      text: "#f1f5f9",
      textSecondary: "#94a3b8",
      textTertiary: "#64748b",
      border: "#1f2937",
      borderHover: "#334155",
      accent1: "#3b82f6",
      accent2: "#6366f1",
      accentText: "#ffffff",
    },
  },
  "dark-purple": {
    name: "dark-purple",
    label: "Dark Purple",
    isDark: true,
    colors: {
      background: "#0d0b13",
      backgroundSecondary: "#14111d",
      backgroundTertiary: "#1d1829",
      text: "#f5f3ff",
      textSecondary: "#a8a3bd",
      textTertiary: "#726c88",
      border: "#272236",
      borderHover: "#3b3450",
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
      background: "#08100d",
      backgroundSecondary: "#0e1814",
      backgroundTertiary: "#15221c",
      text: "#ecfdf5",
      textSecondary: "#9cb3a9",
      textTertiary: "#66796f",
      border: "#1c2b24",
      borderHover: "#2c4037",
      accent1: "#10b981",
      accent2: "#059669",
      accentText: "#03140d",
    },
  },
  "dark-pink": {
    name: "dark-pink",
    label: "Dark Pink",
    isDark: true,
    colors: {
      background: "#100a0e",
      backgroundSecondary: "#181016",
      backgroundTertiary: "#221720",
      text: "#fdf2f8",
      textSecondary: "#b9a4b2",
      textTertiary: "#7e6979",
      border: "#2e1e2a",
      borderHover: "#45293f",
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
      background: "#faf9f7",
      backgroundSecondary: "#ffffff",
      backgroundTertiary: "#f3f1ed",
      text: "#1c1917",
      textSecondary: "#57534e",
      textTertiary: "#8a847d",
      border: "#e7e4df",
      borderHover: "#d6d2ca",
      accent1: "#f59e0b",
      accent2: "#ea580c",
      accentText: "#1c1206",
    },
  },
  "light-blue": {
    name: "light-blue",
    label: "Light Blue",
    isDark: false,
    colors: {
      background: "#f7f9fc",
      backgroundSecondary: "#ffffff",
      backgroundTertiary: "#eef2f8",
      text: "#0f172a",
      textSecondary: "#475569",
      textTertiary: "#7b8798",
      border: "#e2e8f0",
      borderHover: "#cbd5e1",
      accent1: "#3b82f6",
      accent2: "#4f46e5",
      accentText: "#ffffff",
    },
  },
  "light-purple": {
    name: "light-purple",
    label: "Light Purple",
    isDark: false,
    colors: {
      background: "#faf9fd",
      backgroundSecondary: "#ffffff",
      backgroundTertiary: "#f2effa",
      text: "#1c1530",
      textSecondary: "#575170",
      textTertiary: "#8c86a3",
      border: "#e7e3f3",
      borderHover: "#d4cdea",
      accent1: "#9333ea",
      accent2: "#7c3aed",
      accentText: "#ffffff",
    },
  },
  "light-green": {
    name: "light-green",
    label: "Light Green",
    isDark: false,
    colors: {
      background: "#f7faf8",
      backgroundSecondary: "#ffffff",
      backgroundTertiary: "#edf5f0",
      text: "#0b2a1f",
      textSecondary: "#4b6358",
      textTertiary: "#82978d",
      border: "#dfeae3",
      borderHover: "#c5d8cc",
      accent1: "#059669",
      accent2: "#047857",
      accentText: "#ffffff",
    },
  },
  "light-pink": {
    name: "light-pink",
    label: "Light Pink",
    isDark: false,
    colors: {
      background: "#fcf8fa",
      backgroundSecondary: "#ffffff",
      backgroundTertiary: "#f8eef3",
      text: "#2a1222",
      textSecondary: "#6b5162",
      textTertiary: "#a08896",
      border: "#f0e1e9",
      borderHover: "#e3c8d6",
      accent1: "#db2777",
      accent2: "#be185d",
      accentText: "#ffffff",
    },
  },
};

const CSS_VARS: Record<keyof Theme["colors"], string> = {
  background: "--theme-background",
  backgroundSecondary: "--theme-background-secondary",
  backgroundTertiary: "--theme-background-tertiary",
  text: "--theme-text",
  textSecondary: "--theme-text-secondary",
  textTertiary: "--theme-text-tertiary",
  border: "--theme-border",
  borderHover: "--theme-border-hover",
  accent1: "--theme-accent-1",
  accent2: "--theme-accent-2",
  accentText: "--theme-accent-text",
};

/** Write a theme's colors onto <html> as CSS variables. */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement) {
  for (const [key, cssVar] of Object.entries(CSS_VARS)) {
    root.style.setProperty(cssVar, theme.colors[key as keyof Theme["colors"]]);
  }
  root.style.colorScheme = theme.isDark ? "dark" : "light";
  root.dataset.theme = theme.isDark ? "dark" : "light";
}

/** Inline script for <head>: applies the saved theme before hydration to avoid a flash. */
export const themeInitScript = `(function(){try{
var T=${JSON.stringify(
  Object.fromEntries(Object.entries(THEMES).map(([k, t]) => [k, { c: t.colors, d: t.isDark }]))
)};
var V=${JSON.stringify(CSS_VARS)};
var s=localStorage.getItem('theme');var t=T[s]||T['${DEFAULT_THEME}'];var r=document.documentElement;
for(var k in V){r.style.setProperty(V[k],t.c[k]);}
r.style.colorScheme=t.d?'dark':'light';r.dataset.theme=t.d?'dark':'light';
}catch(e){}})();`;
