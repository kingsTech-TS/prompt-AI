"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ThemeSelector } from "@/components/theme-selector";
import {
  Plus,
  LogOut,
  Menu,
  X,
  Sparkles,
  User,
  Terminal,
  Lightbulb,
  FolderOpen,
  LayoutGrid,
  Wand2,
  ShieldCheck,
  Search,
  MessageSquare,
} from "lucide-react";
import { clearAllAuthData } from "@/lib/auth";
import { promptsApi, authApi } from "@/lib/api";
import { PaginatedPromptResponse, PromptResponse, UserResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { planById, promptUsage } from "@/lib/plans";
import Image from "next/image";

const GROUP_ORDER = ["Today", "Yesterday", "This Week", "Earlier"];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

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

  const groupedPrompts = useMemo(() => {
    const groups: { [key: string]: PromptResponse[] } = {};
    const now = new Date();
    const query = search.trim().toLowerCase();

    (data?.prompts || [])
      .filter((p) => !query || p.title.toLowerCase().includes(query))
      .forEach((prompt) => {
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

    return GROUP_ORDER.filter((g) => groups[g]).map((g) => [g, groups[g]] as const);
  }, [data?.prompts, search]);

  const handleLogout = () => {
    // 1. Clear the auth token and any session storage
    clearAllAuthData();
    // 2. CRITICAL: Clear ALL React Query cache so the next user
    //    never sees this user's prompts, profile, or collections.
    queryClient.clear();
    // 3. Navigate to login
    router.push("/login");
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutGrid },
    { href: "/generate", label: "UI Prompt", icon: Wand2 },
    { href: "/idea", label: "Idea Generator", icon: Lightbulb },
    { href: "/collections", label: "Collections", icon: FolderOpen },
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  const usage = user ? promptUsage(user) : null;
  const usagePct = usage?.percent ?? 0;

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-line bg-surface">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Link href="/dashboard" onClick={closeMenu} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-glow">
            <Terminal className="h-4 w-4 text-brand-fg" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-fg">PromptCraft</span>
        </Link>
        <ThemeSelector />
      </div>

      {/* Primary action */}
      <div className="px-3">
        <Link
          href="/generate"
          onClick={closeMenu}
          className="group flex h-10 items-center gap-2 rounded-xl bg-brand-gradient px-3 text-sm font-semibold text-brand-fg shadow-glow transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          New prompt
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-4 space-y-0.5 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={closeMenu}
              className={cn(
                "flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm transition-colors",
                active
                  ? "bg-elevated font-medium text-fg"
                  : "text-fg-muted hover:bg-elevated/60 hover:text-fg"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-brand" : "text-fg-subtle")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* History */}
      <div className="mt-5 px-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history"
            className="h-8 w-full rounded-lg border border-line bg-canvas/60 pl-8 pr-2 text-xs text-fg placeholder:text-fg-subtle outline-none transition-colors focus:border-brand/50"
          />
        </div>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-3 pb-3">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-elevated" />
            ))}
          </div>
        ) : groupedPrompts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <MessageSquare className="h-5 w-5 text-fg-subtle" />
            <p className="text-xs text-fg-subtle">
              {search ? "No prompts match your search" : "Your prompts will show up here"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedPrompts.map(([group, prompts]) => (
              <div key={group}>
                <h3 className="mb-1 px-2.5 text-[11px] font-medium text-fg-subtle">{group}</h3>
                <div className="space-y-px">
                  {prompts.map((prompt) => {
                    const active = pathname === `/prompts/${prompt.id}`;
                    return (
                      <Link
                        key={prompt.id}
                        href={`/prompts/${prompt.id}`}
                        onClick={closeMenu}
                        title={prompt.title}
                        className={cn(
                          "relative flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors",
                          active
                            ? "bg-elevated text-fg before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-brand"
                            : "text-fg-muted hover:bg-elevated/60 hover:text-fg"
                        )}
                      >
                        {prompt.source_type === "idea" ? (
                          <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 text-fg-subtle" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-fg-subtle" />
                        )}
                        <span className="flex-1 truncate">{prompt.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account */}
      <div className="space-y-3 border-t border-line p-3">
        {user && user.role !== "admin" && (
          <div className="rounded-xl border border-line bg-canvas/60 px-3 py-2.5">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="text-fg-muted">
                {planById(user.subscription).label} · this month
              </span>
              <span className={cn("font-medium tabular-nums", usage?.limitReached ? "text-red-400" : "text-fg")}>
                {usage?.usedLabel}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
              <div
                className={cn("h-full rounded-full transition-all", usagePct >= 100 ? "bg-red-500" : "bg-brand-gradient")}
                style={{ width: `${usage?.unlimited ? 100 : usagePct}%` }}
              />
            </div>
            {usage?.resetsOn && !usage.unlimited && (
              <p className="mt-1.5 text-[10px] text-fg-subtle">Renews {usage.resetsOn}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-1">
          <Link
            href="/profile"
            onClick={closeMenu}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-elevated",
              pathname === "/profile" && "bg-elevated"
            )}
          >
            <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-elevated">
              {user?.profile_picture_url ? (
                <Image
                  src={user.profile_picture_url}
                  alt={user.username}
                  fill
                  unoptimized={true}
                  className="object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-fg-muted" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-[13px] font-medium text-fg">{user?.username || "User"}</div>
              <div className="truncate text-[11px] text-fg-subtle">{user?.email}</div>
            </div>
          </Link>
          <button
            id="sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign out"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="glass fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-2 border-b border-line px-3 lg:hidden">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-fg hover:bg-elevated"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/dashboard" className="flex items-center gap-2 text-[15px] font-semibold text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient">
            <Terminal className="h-3.5 w-3.5 text-brand-fg" />
          </div>
          PromptCraft
        </Link>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 flex-shrink-0 transform transition-transform duration-300 ease-out lg:static lg:w-64 lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
