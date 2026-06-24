"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeSelector } from "@/components/theme-selector";
import { Plus, LogOut, Menu, X, Sparkles, User, Terminal } from "lucide-react";
import { removeToken } from "@/lib/auth";
import { promptsApi, authApi } from "@/lib/api";
import { PaginatedPromptResponse, PromptResponse, UserResponse } from "@/lib/types";
import Image from "next/image";


export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data, isLoading } = useQuery<PaginatedPromptResponse>({
    queryKey: ["prompts"],
    queryFn: async () => {
      return await promptsApi.getAll(1, 100);
    },
  });

  const { data: user } = useQuery<UserResponse>({
    queryKey: ["user"],
    queryFn: () => authApi.getMe(),
  });

  const groupPromptsByDate = (prompts: PromptResponse[]) => {
    const groups: { [key: string]: PromptResponse[] } = {};
    const now = new Date();

    prompts.forEach((prompt) => {
      const promptDate = new Date(prompt.created_at);
      const diffInDays = Math.floor(
        (now.getTime() - promptDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let groupKey = "";
      if (diffInDays === 0) groupKey = "Today";
      else if (diffInDays === 1) groupKey = "Yesterday";
      else if (diffInDays < 7) groupKey = "This Week";
      else groupKey = "Earlier";

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(prompt);
    });

    return groups;
  };

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--theme-background-secondary)] border-r border-[var(--theme-border)]">
      <div className="p-4 border-b border-[var(--theme-border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] flex items-center justify-center">
              <Terminal className="h-5 w-5 text-[var(--theme-accent-text)]" />
            </div>
            <span className="text-xl font-bold text-[var(--theme-text)]">PromptCraft</span>
          </div>
          <ThemeSelector />
        </div>
        <Button
          asChild
          className="w-full justify-start gap-2 bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] hover:brightness-110 text-[var(--theme-accent-text)] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Link href="/generate" onClick={() => setIsMobileMenuOpen(false)}>
            <Plus className="h-5 w-5" />
            New Prompt
          </Link>
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-3 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-[var(--theme-background-tertiary)] rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupPromptsByDate(data?.prompts || [])).map(
                ([group, prompts]) => (
                  <div key={group}>
                    <h3 className="text-xs font-semibold text-[var(--theme-text-tertiary)] uppercase tracking-wider mb-3 px-1">
                      {group}
                    </h3>
                    <div className="space-y-1">
                      {prompts.map((prompt) => (
                        <Link
                          key={prompt.id}
                          href={`/prompts/${prompt.id}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm transition-all ${
                            pathname === `/prompts/${prompt.id}`
                              ? "bg-[var(--theme-background-tertiary)] text-[var(--theme-text)]"
                              : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-background-tertiary)] hover:text-[var(--theme-text)]"
                          }`}
                        >
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--theme-text-tertiary)]" />
                          <span className="flex-1 truncate">
                            {prompt.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </ScrollArea>
      </div>
      <div className="p-4 border-t border-[var(--theme-border)]">
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start gap-3 p-2 text-[var(--theme-text-secondary)] hover:bg-[var(--theme-background-tertiary)] hover:text-[var(--theme-text)] transition-colors rounded-xl"
        >
          <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="relative w-10 h-10 rounded-full bg-[var(--theme-background-tertiary)] flex items-center justify-center overflow-hidden border border-[var(--theme-border)] flex-shrink-0">
              {user?.profile_picture_url ? (
                <Image
                  src={user.profile_picture_url}
                  alt={user.username}
                  fill
                  unoptimized={true}
                  className="object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-[var(--theme-text)]">
                {user?.username || "User"}
              </div>
              <div className="text-xs text-[var(--theme-text-tertiary)]">
                {user?.email}
              </div>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--theme-background-secondary)] p-3 border-b border-[var(--theme-border)]">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[var(--theme-text)] hover:bg-[var(--theme-background-tertiary)] rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <Link href="/" className="font-bold text-lg flex items-center gap-2 text-[var(--theme-text)]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] flex items-center justify-center">
              <Terminal className="h-4 w-4 text-[var(--theme-accent-text)]" />
            </div>
            PromptCraft
          </Link>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
