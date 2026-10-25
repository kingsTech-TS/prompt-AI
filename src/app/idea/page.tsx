"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { promptsApi, collectionsApi, authApi } from "@/lib/api";
import { ApiError } from "@/lib/errors";
import { ThinkingStatus, type ThinkingStep } from "@/components/thinking-status";
import { AGENTS } from "@/lib/agents";
import { IdeaGenerateRequest, TargetAgent } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Lightbulb,
  Library,
  FileText,
  ListOrdered,
  ArrowRight,
  ChevronDown,
  Bot,
  Check,
  Users,
  LayoutDashboard,
  Network,
  ShieldCheck,
  Database,
  Rocket,
} from "lucide-react";

const EXAMPLES = [
  "An app where gyms manage memberships and class bookings",
  "A marketplace for booking local music bands",
  "A habit tracker with streaks and friends",
];

// What the AI works out on its own, shown so users know a short idea is enough
const INFERRED = [
  { icon: Users, label: "User roles" },
  { icon: LayoutDashboard, label: "Admin dashboard" },
  { icon: Network, label: "Architecture" },
  { icon: Database, label: "Data model" },
  { icon: ShieldCheck, label: "Security" },
  { icon: Rocket, label: "Deployment" },
];

const THINKING_STEPS: ThinkingStep[] = [
  { label: "Understanding your idea", seconds: 6 },
  { label: "Working out users, roles and permissions", seconds: 10 },
  { label: "Deciding if you need an admin dashboard", seconds: 8 },
  { label: "Designing the system architecture", seconds: 14 },
  { label: "Planning the data model and APIs", seconds: 16 },
  { label: "Covering security, testing and deployment", seconds: 16 },
  { label: "Writing your prompt", seconds: 1 },
];

export default function IdeaPage() {
  const [idea, setIdea] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [outputMode, setOutputMode] = useState<"full" | "phased">("full");
  const [targetAgent, setTargetAgent] = useState<TargetAgent>("general");
  const router = useRouter();
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => authApi.getMe(),
  });

  const { data: collections } = useQuery({
    queryKey: ["collections"],
    queryFn: () => collectionsApi.getAll(),
  });

  const { data: subCollections } = useQuery({
    queryKey: ["sub-collections"],
    queryFn: () => collectionsApi.getAllSub(),
  });

  const generateMutation = useMutation({
    mutationFn: async (payload: IdeaGenerateRequest) => {
      return await promptsApi.generateIdea(payload);
    },
    onSuccess: (data) => {
      toast({
        title: "Your prompt is ready",
        description: "Opening your project blueprint...",
      });
      router.push(`/prompts/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: error instanceof ApiError && error.status === 403 ? "Can't generate a prompt" : "Couldn't generate your prompt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      toast({
        title: "Describe your idea first",
        description: "A sentence or two about what you want to build is enough.",
        variant: "destructive",
      });
      return;
    }

    const payload: IdeaGenerateRequest = {
      idea: idea.trim(),
      output_mode: outputMode,
      target_agent: targetAgent,
    };

    if (collectionId) {
      payload.collection_id = collectionId;
    }

    generateMutation.mutate(payload);
  };

  const modes = [
    {
      id: "full" as const,
      icon: FileText,
      title: "One full prompt",
      text: "Paste once and let the agent build the whole app. Best for small to medium apps.",
    },
    {
      id: "phased" as const,
      icon: ListOrdered,
      title: "Step-by-step phases",
      text: "A project brief plus one prompt per phase, each with tasks and checks. Best for bigger apps.",
    },
  ];

  const busy = generateMutation.isPending;

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <Sidebar />
        <main className="ambient flex-1 overflow-y-auto pt-14 lg:pt-0">
          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-4 py-10 sm:px-6">
            {/* Heading */}
            <div className="animate-rise text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                <Lightbulb className="h-3.5 w-3.5" />
                Idea to blueprint
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                Describe it in a sentence. <span className="text-gradient">We&apos;ll design the system.</span>
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-[15px] text-fg-muted">
                You get a complete, production-ready prompt for your coding agent: roles, architecture, security and everything in between.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 animate-rise overflow-hidden rounded-3xl border border-line bg-surface shadow-lift [animation-delay:80ms]"
            >
              {/* Idea */}
              <textarea
                placeholder="What do you want to build? e.g. “An app where gyms manage memberships and class bookings”"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                disabled={busy}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e);
                }}
                className="block min-h-[120px] w-full resize-none bg-transparent px-5 pt-5 text-[15px] leading-relaxed text-fg outline-none placeholder:text-fg-subtle disabled:opacity-60"
              />

              <div className="flex flex-wrap gap-2 px-5 pb-4">
                {idea ? (
                  <>
                    <span className="text-[11px] text-fg-subtle">We&apos;ll work out:</span>
                    {INFERRED.map(({ icon: Icon, label }) => (
                      <span key={label} className="inline-flex items-center gap-1 rounded-full bg-elevated px-2 py-0.5 text-[11px] text-fg-muted">
                        <Icon className="h-3 w-3 text-brand" />
                        {label}
                      </span>
                    ))}
                  </>
                ) : (
                  EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setIdea(ex)}
                      className="max-w-full truncate rounded-full border border-line px-3 py-1 text-xs text-fg-muted transition-colors hover:border-brand/40 hover:text-fg"
                    >
                      {ex}
                    </button>
                  ))
                )}
              </div>

              {/* Target agent */}
              <div className="border-t border-line px-5 py-4">
                <span className="mb-2 flex items-center gap-1.5 text-xs font-medium text-fg-muted">
                  <Bot className="h-3.5 w-3.5" />
                  Where will you paste it?
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {AGENTS.map((agent) => {
                    const selected = targetAgent === agent.id;
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => setTargetAgent(agent.id)}
                        aria-pressed={selected}
                        className={cn(
                          "relative rounded-xl border px-3 py-2 text-left transition-all",
                          selected
                            ? "border-brand/60 bg-brand/10 shadow-sm"
                            : "border-line bg-canvas/40 hover:border-line-strong"
                        )}
                      >
                        <span className={cn("block text-[13px] font-medium", selected ? "text-fg" : "text-fg-muted")}>
                          {agent.label}
                        </span>
                        <span className="block text-[11px] text-fg-subtle">{agent.description}</span>
                        {selected && (
                          <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-brand animate-in zoom-in-50 duration-200" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Output mode */}
              <div className="border-t border-line px-5 py-4">
                <span className="mb-2 flex items-center gap-1.5 text-xs font-medium text-fg-muted">
                  <ListOrdered className="h-3.5 w-3.5" />
                  How do you want it?
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {modes.map(({ id, icon: Icon, title, text }) => {
                    const selected = outputMode === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setOutputMode(id)}
                        aria-pressed={selected}
                        className={cn(
                          "flex gap-3 rounded-xl border p-3 text-left transition-all",
                          selected ? "border-brand/60 bg-brand/10" : "border-line bg-canvas/40 hover:border-line-strong"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors",
                            selected ? "bg-brand-gradient text-brand-fg" : "bg-elevated text-fg-muted"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-[13px] font-medium text-fg">{title}</span>
                          <span className="mt-0.5 block text-[11px] leading-relaxed text-fg-muted">{text}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tech stack */}
              <div className="border-t border-line px-5 py-4">
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-fg-muted">
                  <Library className="h-3.5 w-3.5" />
                  Tech stack
                </label>
                <div className="relative">
                  <select
                    value={collectionId}
                    onChange={(e) => setCollectionId(e.target.value)}
                    className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-line bg-canvas/60 pl-3 pr-9 text-sm text-fg outline-none transition-colors hover:border-line-strong focus:border-brand/60"
                  >
                    <option value="">Let the AI choose the best stack</option>

                    {collections && collections.length > 0 && (
                      <optgroup label="Collections">
                        {collections.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.type})
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {subCollections && subCollections.length > 0 && (
                      <optgroup label="Sub-Collections">
                        {subCollections.map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.name} (Multi-stack)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
                </div>
              </div>

              {/* Progress while generating */}
              {busy && (
                <div className="border-t border-line bg-brand/5 px-5 py-5">
                  <ThinkingStatus
                    steps={THINKING_STEPS}
                    note="Detailed blueprints take a minute or two. Keep this tab open."
                  />
                </div>
              )}

              {/* Footer */}
              <div className="flex flex-col gap-3 border-t border-line bg-canvas/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-fg-subtle">
                  {user && user.role !== "admin" ? `${user.prompts_used} / ${user.max_prompts} prompts used` : ""}
                </p>
                <Button type="submit" disabled={!idea.trim() || busy} className="h-11 px-5">
                  {busy ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Designing your system...
                    </>
                  ) : (
                    <>
                      <Sparkles />
                      Generate prompt
                      <ArrowRight />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <p className="mt-6 animate-rise text-center text-xs text-fg-subtle [animation-delay:160ms]">
              Tip: save your favourite stacks in{" "}
              <Link href="/collections" className="text-fg-muted underline-offset-2 hover:text-fg hover:underline">
                Collections
              </Link>{" "}
              to reuse them here.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
