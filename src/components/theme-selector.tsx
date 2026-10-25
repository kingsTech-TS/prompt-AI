"use client";

import { useTheme, ThemeName, THEMES } from "@/contexts/theme-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
  const { themeName, setTheme } = useTheme();

  const themes: { name: ThemeName; label: string; category: string }[] = [
    // Dark themes
    { name: "dark-orange", label: "Orange", category: "Dark" },
    { name: "dark-blue", label: "Blue", category: "Dark" },
    { name: "dark-purple", label: "Purple", category: "Dark" },
    { name: "dark-green", label: "Green", category: "Dark" },
    { name: "dark-pink", label: "Pink", category: "Dark" },
    // Light themes
    { name: "light-orange", label: "Orange", category: "Light" },
    { name: "light-blue", label: "Blue", category: "Light" },
    { name: "light-purple", label: "Purple", category: "Light" },
    { name: "light-green", label: "Green", category: "Light" },
    { name: "light-pink", label: "Pink", category: "Light" },
  ];

  // Group themes by category
  const groupedThemes = themes.reduce((acc, theme) => {
    if (!acc[theme.category]) acc[theme.category] = [];
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<string, typeof themes>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-elevated hover:text-fg"
          title="Change theme"
        >
          <Palette className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5">
        <DropdownMenuLabel className="px-2 text-xs font-medium text-fg-subtle">Theme</DropdownMenuLabel>
        {Object.entries(groupedThemes).map(([category, categoryThemes], i) => (
          <div key={category}>
            {i > 0 && <DropdownMenuSeparator className="bg-line" />}
            <div className="px-2 pb-1 pt-1.5 text-[11px] font-medium text-fg-subtle">{category}</div>
            {categoryThemes.map((theme) => {
              const colors = THEMES[theme.name].colors;
              const selected = themeName === theme.name;
              return (
                <DropdownMenuItem
                  key={theme.name}
                  onClick={() => setTheme(theme.name)}
                  className={cn("cursor-pointer gap-2.5 text-fg", selected && "bg-elevated")}
                >
                  {/* Color preview: this theme's own colors, not the active theme's */}
                  <div
                    className="h-4 w-4 rounded-full border"
                    style={{
                      background: `linear-gradient(135deg, ${colors.accent1} 50%, ${colors.background} 50%)`,
                      borderColor: colors.borderHover,
                    }}
                  />
                  <span className="flex-1">{theme.label}</span>
                  {selected && <Check className="h-3.5 w-3.5 text-brand" />}
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
