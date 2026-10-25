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
import { cn } from "@/lib/utils";
import { Sparkles, Lightbulb, Library, AlignLeft, Layers, ArrowRight, ChevronDown } from "lucide-react";

const EXAMPLES = [
  "A restaurant ordering app with QR menus, a cart, payments and a live kitchen dashboard",
  "A SaaS for booking local music bands, with reviews and calendar availability",
  "A habit tracker with streaks, reminders and a social leaderboard",
];

export default function IdeaPage() {
  const [idea, setIdea] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [outputMode, setOutputMode] = useState<"full" | "phased">("full");
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
    mutationFn: async (payload: { idea: string; collection_id?: string; output_mode: "full" | "phased" }) => {
      return await promptsApi.generateIdea(payload);
    },
    onSuccess: (data) => {
      toast({
        title: "Developer Prompt Generated!",
        description: "Redirecting to your new project spec...",
      });
      router.push(`/prompts/${data.id}`);
    },
    onError: (error: any) => {
      if (error.message && (error.message.includes("403") || error.message.toLowerCase().includes("limit") || error.message.toLowerCase().includes("forbidden"))) {
        toast({
          title: "Limit Reached",
          description: "You have used all your available prompts. Please upgrade to Pro to generate more.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: error.message || "An error occurred while generating the prompt",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe your project idea.",
        variant: "destructive",
      });
      return;
    }

    const payload: { idea: string; collection_id?: string; output_mode: "full" | "phased" } = {
      idea: idea.trim(),
      output_mode: outputMode,
    };

    if (collectionId) {
      payload.collection_id = collectionId;
    }

    generateMutation.mutate(payload);
  };

  const modes = [
    { id: "full" as const, icon: AlignLeft, title: "Full prompt", text: "One comprehensive master prompt" },
    { id: "phased" as const, icon: Layers, title: "Phased", text: "Step-by-step build phases" },
  ];

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
                Describe your app. <span className="text-gradient">Get the full plan.</span>
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-[15px] text-fg-muted">
                Tech stack, database schemas, environment variables and a step-by-step build prompt for AI coding tools.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 animate-rise overflow-hidden rounded-3xl border border-line bg-surface shadow-lift [animation-delay:80ms]"
            >
              {/* Idea */}
              <textarea
                placeholder="What do you want to build? Describe the users, the core features and anything that matters..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="block min-h-[170px] w-full resize-none bg-transparent px-5 pt-5 text-[15px] leading-relaxed text-fg outline-none placeholder:text-fg-subtle"
              />

              {!idea && (
                <div className="flex flex-wrap gap-2 px-5 pb-4">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setIdea(ex)}
                      className="max-w-full truncate rounded-full border border-line px-3 py-1 text-xs text-fg-muted transition-colors hover:border-brand/40 hover:text-fg"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              )}

              {/* Options */}
              <div className="grid gap-4 border-t border-line px-5 py-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-fg-muted">
                    <Library className="h-3.5 w-3.5" />
                    Tech stack
                  </label>
                  <div className="relative">
                    <select
                      value={collectionId}
                      onChange={(e) => setCollectionId(e.target.value)}
                      className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-line bg-canvas/60 pl-3 pr-9 text-sm text-fg outline-none transition-colors hover:border-line-strong focus:border-brand/60"
                    >
                      <option value="">AI recommended</option>

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

                <div>
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-fg-muted">
                    <Layers className="h-3.5 w-3.5" />
                    Output
                  </span>
                  <div className="grid h-10 grid-cols-2 rounded-xl border border-line bg-canvas/60 p-0.5">
                    {modes.map(({ id, icon: Icon, title, text }) => (
                      <button
                        key={id}
                        type="button"
                        title={text}
                        onClick={() => setOutputMode(id)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-[10px] text-xs font-medium transition-all",
                          outputMode === id ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg"
                        )}
                      >
                        <Icon className={cn("h-3.5 w-3.5", outputMode === id && "text-brand")} />
                        {title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-3 border-t border-line bg-canvas/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-fg-subtle">
                  {user && user.role !== "admin"
                    ? `${user.prompts_used} / ${user.max_prompts} prompts used`
                    : ""}
                </p>
                <Button type="submit" disabled={!idea.trim() || generateMutation.isPending} className="h-11 px-5">
                  {generateMutation.isPending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Architecting...
                    </>
                  ) : (
                    <>
                      <Sparkles />
                      Generate blueprint
                      <ArrowRight />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <p className="mt-6 animate-rise text-center text-xs text-fg-subtle [animation-delay:160ms]">
              Tip: save your favourite stacks in <Link href="/collections" className="text-fg-muted underline-offset-2 hover:text-fg hover:underline">Collections</Link> to reuse them here.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
