"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PaginatedPromptResponse, PromptResponse, UserResponse } from "@/lib/types";
import { promptsApi, authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  Lightbulb,
  ArrowUpRight,
  Wand2,
  Search,
  FileText,
} from "lucide-react";

type Filter = "all" | "ui" | "idea";

export default function DashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery<PaginatedPromptResponse>({
    queryKey: ["prompts"],
    queryFn: async () => {
      return await promptsApi.getAll(1, 100);
    },
  });

  const { data: user } = useQuery<UserResponse>({
    queryKey: ["user"],
    queryFn: () => authApi.getMe(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await promptsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast({
        title: "Prompt deleted",
        description: "The prompt has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description:
          error.message || "Failed to delete the prompt",
        variant: "destructive",
      });
    },
  });

  const prompts = data?.prompts ?? [];
  const ideaCount = prompts.filter((p) => p.source_type === "idea").length;

  const visiblePrompts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return prompts.filter((p) => {
      if (filter === "idea" && p.source_type !== "idea") return false;
      if (filter === "ui" && p.source_type === "idea") return false;
      return !query || p.title.toLowerCase().includes(query);
    });
  }, [prompts, filter, search]);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 86400 * 30)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  const sourceMeta = (p: PromptResponse) =>
    p.source_type === "idea"
      ? { icon: Lightbulb, label: "Idea" }
      : p.source_type === "url"
        ? { icon: LinkIcon, label: "Website" }
        : p.source_type === "image"
          ? { icon: ImageIcon, label: "Screenshots" }
          : { icon: Sparkles, label: "Website + images" };

  const stats = [
    { label: "Total prompts", value: prompts.length },
    { label: "UI prompts", value: prompts.length - ideaCount },
    { label: "Idea blueprints", value: ideaCount },
    ...(user && user.role !== "admin"
      ? [{ label: "Remaining", value: Math.max(0, user.max_prompts - user.prompts_used) }]
      : []),
  ];

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <Sidebar />
        <main className="ambient flex-1 overflow-y-auto pt-14 lg:pt-0">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 lg:py-12">
            {/* Greeting */}
            <div className="animate-rise">
              <p className="text-sm text-fg-muted">{greeting}{user?.username ? `, ${user.username}` : ""}</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                What are we building <span className="text-gradient">today?</span>
              </h1>
            </div>

            {/* Actions */}
            <div className="mt-8 grid animate-rise grid-cols-1 gap-4 [animation-delay:60ms] sm:grid-cols-2">
              <Link href="/generate" className="card-interactive group relative overflow-hidden p-5">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/15 blur-2xl transition-opacity group-hover:opacity-100 sm:opacity-60" />
                <div className="relative flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
                    <Wand2 className="h-5 w-5 text-brand-fg" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-fg-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
                </div>
                <h2 className="relative mt-4 font-semibold text-fg">UI/UX prompt</h2>
                <p className="relative mt-1 text-sm text-fg-muted">
                  Turn a website or screenshots into a detailed prompt for v0, Cursor, Lovable and more.
                </p>
              </Link>

              <Link href="/idea" className="card-interactive group relative overflow-hidden p-5">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-2/15 blur-2xl transition-opacity group-hover:opacity-100 sm:opacity-60" />
                <div className="relative flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-elevated">
                    <Lightbulb className="h-5 w-5 text-brand" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-fg-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
                </div>
                <h2 className="relative mt-4 font-semibold text-fg">Idea blueprint</h2>
                <p className="relative mt-1 text-sm text-fg-muted">
                  Describe an app idea and get a full build plan: stack, schemas, env vars and phases.
                </p>
              </Link>
            </div>

            {/* Stats */}
            {!isLoading && !error && (
              <div className="mt-4 grid animate-rise grid-cols-2 gap-3 [animation-delay:120ms] sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-line bg-surface/60 px-4 py-3">
                    <div className="text-2xl font-semibold tabular-nums tracking-tight text-fg">{s.value}</div>
                    <div className="mt-0.5 text-xs text-fg-muted">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent prompts */}
            <section className="mt-12">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-fg">Recent prompts</h2>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl border border-line bg-surface p-0.5">
                    {(["all", "ui", "idea"] as Filter[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                          "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                          filter === f ? "bg-elevated text-fg" : "text-fg-muted hover:text-fg"
                        )}
                      >
                        {f === "all" ? "All" : f === "ui" ? "UI" : "Ideas"}
                      </button>
                    ))}
                  </div>
                  <div className="relative flex-1 sm:w-52 sm:flex-none">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-subtle" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search prompts"
                      className="h-8 w-full rounded-xl border border-line bg-surface pl-8 pr-3 text-xs text-fg outline-none placeholder:text-fg-subtle focus:border-brand/50"
                    />
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-2xl bg-elevated" />
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-sm text-red-400">
                  Failed to load prompts
                </div>
              ) : visiblePrompts.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface">
                    <FileText className="h-5 w-5 text-fg-subtle" />
                  </div>
                  <p className="mt-4 font-medium text-fg">
                    {prompts.length === 0 ? "No prompts yet" : "Nothing matches"}
                  </p>
                  <p className="mt-1 text-sm text-fg-muted">
                    {prompts.length === 0
                      ? "Create your first prompt to see it here."
                      : "Try a different search or filter."}
                  </p>
                  {prompts.length === 0 && (
                    <Button asChild className="mt-5">
                      <Link href="/generate">
                        <Sparkles />
                        Create a prompt
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {visiblePrompts.map((prompt) => {
                    const { icon: Icon, label } = sourceMeta(prompt);
                    return (
                      <div key={prompt.id} className="card-interactive group relative flex flex-col p-4">
                        <Link href={`/prompts/${prompt.id}`} className="absolute inset-0 rounded-2xl" aria-label={prompt.title} />
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas/60 px-2 py-0.5 text-[11px] text-fg-muted">
                            <Icon className="h-3 w-3" />
                            {label}
                          </span>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button
                                className="relative z-10 flex h-7 w-7 items-center justify-center rounded-lg text-fg-subtle opacity-100 transition-all hover:bg-red-500/10 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
                                title="Delete prompt"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm">
                              <DialogHeader>
                                <DialogTitle>Delete this prompt?</DialogTitle>
                                <DialogDescription className="text-fg-muted">
                                  &ldquo;{prompt.title}&rdquo; and its chat history will be permanently deleted.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className="mt-2 gap-2">
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                  variant="destructive"
                                  onClick={() => deleteMutation.mutate(prompt.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <h3 className="mt-3 line-clamp-2 font-medium leading-snug text-fg">{prompt.title}</h3>
                        <p className="mt-auto pt-4 text-xs text-fg-subtle">{formatRelativeTime(prompt.created_at)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
