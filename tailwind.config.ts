import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

// Map a theme CSS variable to a Tailwind color that still supports opacity
// modifiers (e.g. `bg-brand/10`), since the variables hold plain hex values.
const themed = (cssVar: string) =>
  `color-mix(in srgb, var(${cssVar}) calc(<alpha-value> * 100%), transparent)`

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        // App design tokens (driven by the active theme)
        canvas: themed("--theme-background"),
        surface: themed("--theme-background-secondary"),
        elevated: themed("--theme-background-tertiary"),
        fg: {
          DEFAULT: themed("--theme-text"),
          muted: themed("--theme-text-secondary"),
          subtle: themed("--theme-text-tertiary"),
        },
        line: {
          DEFAULT: themed("--theme-border"),
          strong: themed("--theme-border-hover"),
        },
        brand: {
          DEFAULT: themed("--theme-accent-1"),
          2: themed("--theme-accent-2"),
          fg: themed("--theme-accent-text"),
        },

        // shadcn/ui tokens, mapped onto the same theme
        border: themed("--theme-border"),
        input: themed("--theme-border"),
        ring: themed("--theme-accent-1"),
        background: themed("--theme-background"),
        foreground: themed("--theme-text"),
        primary: {
          DEFAULT: themed("--theme-accent-1"),
          foreground: themed("--theme-accent-text"),
        },
        secondary: {
          DEFAULT: themed("--theme-background-tertiary"),
          foreground: themed("--theme-text"),
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: themed("--theme-background-tertiary"),
          foreground: themed("--theme-text-secondary"),
        },
        accent: {
          DEFAULT: themed("--theme-background-tertiary"),
          foreground: themed("--theme-text"),
        },
        popover: {
          DEFAULT: themed("--theme-background-secondary"),
          foreground: themed("--theme-text"),
        },
        card: {
          DEFAULT: themed("--theme-background-secondary"),
          foreground: themed("--theme-text"),
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.625rem",
        sm: "0.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.06), 0 8px 24px -12px rgb(0 0 0 / 0.25)",
        lift: "0 2px 4px rgb(0 0 0 / 0.08), 0 20px 48px -16px rgb(0 0 0 / 0.4)",
        glow: "0 8px 30px -8px color-mix(in srgb, var(--theme-accent-1) 55%, transparent)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        rise: "rise 0.35s cubic-bezier(0.2, 0.7, 0.2, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
