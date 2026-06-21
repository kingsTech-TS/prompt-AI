"use client";

import { useTheme, ThemeName } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette } from "lucide-react";

export function ThemeSelector() {
  const { themeName, setTheme } = useTheme();

  const themes: { name: ThemeName; label: string; category: string }[] = [
    // Dark themes
    { name: "dark-orange", label: "Dark Orange", category: "Dark" },
    { name: "dark-blue", label: "Dark Blue", category: "Dark" },
    { name: "dark-purple", label: "Dark Purple", category: "Dark" },
    { name: "dark-green", label: "Dark Green", category: "Dark" },
    { name: "dark-pink", label: "Dark Pink", category: "Dark" },
    // Light themes
    { name: "light-orange", label: "Light Orange", category: "Light" },
    { name: "light-blue", label: "Light Blue", category: "Light" },
    { name: "light-purple", label: "Light Purple", category: "Light" },
    { name: "light-green", label: "Light Green", category: "Light" },
    { name: "light-pink", label: "Light Pink", category: "Light" },
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
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-background-tertiary)] rounded-xl transition-all"
        >
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[var(--theme-background-secondary)] border-[var(--theme-border)] text-[var(--theme-text)] w-56 rounded-xl">
        <DropdownMenuLabel className="text-[var(--theme-text-secondary)]">Themes</DropdownMenuLabel>
        {Object.entries(groupedThemes).map(([category, categoryThemes]) => (
          <div key={category}>
            <DropdownMenuSeparator className="bg-[var(--theme-border)]" />
            <div className="px-2 py-1 text-xs font-semibold text-[var(--theme-text-tertiary)] uppercase tracking-wider">
              {category}
            </div>
            {categoryThemes.map((theme) => (
              <DropdownMenuItem
                key={theme.name}
                onClick={() => setTheme(theme.name)}
                className={`cursor-pointer rounded-lg mx-1 my-0.5 text-[var(--theme-text)] hover:bg-[var(--theme-background-tertiary)] ${
                  themeName === theme.name ? "bg-[var(--theme-background-tertiary)]" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Color preview */}
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `var(--theme-accent-1)` }} />
                  {theme.label}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
