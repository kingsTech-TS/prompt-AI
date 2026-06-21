import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "PromptCraft AI",
  description: "Generate UI/UX prompts from URLs and images",
};

// Define all themes for the initial script (to prevent theme flash)
const THEMES = {
  "dark-orange": {
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
    colors: {
      background: "#ffffff",
      backgroundSecondary: "#eff6ff",
      backgroundTertiary: "#dbeafe",
      text: "#1e293b",
      textSecondary: "#475563",
      textTertiary: "#64748b",
      border: "#bfdbfe",
      borderHover: "#93c5fd",
      accent1: "#3b82f6",
      accent2: "#2563eb",
      accentText: "#ffffff",
    },
  },
  "light-purple": {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Inline script to apply theme before React loads (prevents flash)
  const initialThemeScript = `
    (function() {
      const THEMES = ${JSON.stringify(THEMES)};
      const savedTheme = localStorage.getItem('theme');
      const themeName = savedTheme && THEMES[savedTheme] ? savedTheme : 'dark-orange';
      const theme = THEMES[themeName];
      const root = document.documentElement;
      root.style.setProperty('--theme-background', theme.colors.background);
      root.style.setProperty('--theme-background-secondary', theme.colors.backgroundSecondary);
      root.style.setProperty('--theme-background-tertiary', theme.colors.backgroundTertiary);
      root.style.setProperty('--theme-text', theme.colors.text);
      root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
      root.style.setProperty('--theme-text-tertiary', theme.colors.textTertiary);
      root.style.setProperty('--theme-border', theme.colors.border);
      root.style.setProperty('--theme-border-hover', theme.colors.borderHover);
      root.style.setProperty('--theme-accent-1', theme.colors.accent1);
      root.style.setProperty('--theme-accent-2', theme.colors.accent2);
      root.style.setProperty('--theme-accent-text', theme.colors.accentText);
    })();
  `;

  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: initialThemeScript }} />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
