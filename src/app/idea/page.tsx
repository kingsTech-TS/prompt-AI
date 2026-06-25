"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { promptsApi, collectionsApi, authApi } from "@/lib/api";
import { Sparkles, Lightbulb, Library, AlignLeft, Layers, Terminal } from "lucide-react";

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

  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => collectionsApi.getAll(),
  });

  const { data: subCollections, isLoading: subCollectionsLoading } = useQuery({
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

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[var(--theme-background)] p-4 lg:p-8 mt-16 lg:mt-0">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-extrabold text-[var(--theme-text)] flex items-center gap-2">
                <Lightbulb className="h-8 w-8 text-yellow-400 animate-pulse" />
                Idea-to-Prompt Generator
              </h1>
              <p className="text-sm text-[var(--theme-text-secondary)] mt-2">
                Turn a high-level application idea into a comprehensive, structured prompt for AI coding tools.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Side: Info Pane */}
              <div 
                className="lg:col-span-5 p-8 rounded-3xl border border-[var(--theme-border)] relative overflow-hidden flex flex-col justify-between shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, var(--theme-background-secondary) 0%, var(--theme-background) 100%)' 
                }}
              >
                {/* Glow decor */}
                <div 
                  className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: 'var(--theme-accent-1)' }}
                />

                <div className="relative z-10 space-y-6">
                  <div 
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--theme-accent-1)] border"
                    style={{ 
                      backgroundColor: 'color-mix(in srgb, var(--theme-accent-1) 10%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--theme-accent-1) 20%, transparent)'
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Intelligent Architecture Blueprint
                  </div>

                  <h2 className="text-2xl font-bold text-[var(--theme-text)]">
                    How it works
                  </h2>

                  <div className="space-y-5">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[var(--theme-background-tertiary)] flex items-center justify-center border border-[var(--theme-border)] text-[var(--theme-accent-1)] font-semibold text-sm shadow-sm flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--theme-text)] text-sm">Describe Your Idea</h3>
                        <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
                          Explain what your application does. Example: "A SaaS for booking local music bands."
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[var(--theme-background-tertiary)] flex items-center justify-center border border-[var(--theme-border)] text-[var(--theme-accent-1)] font-semibold text-sm shadow-sm flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--theme-text)] text-sm">Choose a Tech Stack</h3>
                        <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
                          Select one of your custom tech stack collections, or let the AI recommend the best technologies.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[var(--theme-background-tertiary)] flex items-center justify-center border border-[var(--theme-border)] text-[var(--theme-accent-1)] font-semibold text-sm shadow-sm flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--theme-text)] text-sm">Pick Prompt Style</h3>
                        <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
                          Get a single master developer prompt, or split the design into structured development phases.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-6 border-t border-[var(--theme-border)] mt-8">
                  <div className="flex items-center justify-between text-xs text-[var(--theme-text-tertiary)]">
                    <span>Usage Quota:</span>
                    <span className="font-semibold text-[var(--theme-text-secondary)]">
                      {user ? `${user.prompts_used} / ${user.max_prompts} prompts` : "Loading..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Form Container */}
              <div className="lg:col-span-7">
                <div className="p-8 rounded-3xl bg-[var(--theme-background-secondary)] border border-[var(--theme-border)] shadow-xl">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Prompt Textarea */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--theme-text-secondary)] uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-[var(--theme-accent-1)]" />
                        Describe Your Application Idea
                      </label>
                      <Textarea
                        placeholder="Describe your project idea in detail (e.g. 'A restaurant ordering system where customers can scan a QR code to view the menu, add items to a cart, and pay. Admins should have a dashboard to update menu items and track orders in real-time...')"
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        className="min-h-[160px] bg-[var(--theme-background-tertiary)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-tertiary)] rounded-2xl p-4 focus:ring-1 focus:ring-[var(--theme-accent-1)] focus:border-[var(--theme-accent-1)]"
                      />
                    </div>

                    {/* Tech Collection Dropdown */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--theme-text-secondary)] uppercase tracking-wider flex items-center gap-2">
                        <Library className="h-4 w-4 text-[var(--theme-accent-1)]" />
                        Target Tech Stack Collection
                      </label>
                      <select
                        value={collectionId}
                        onChange={(e) => setCollectionId(e.target.value)}
                        className="w-full h-12 px-4 bg-[var(--theme-background-tertiary)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-2xl focus:ring-1 focus:ring-[var(--theme-accent-1)] focus:border-[var(--theme-accent-1)] outline-none text-sm cursor-pointer"
                      >
                        <option value="">AI Recommended (Automatic Stack Selection)</option>
                        
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
                      <p className="text-[11px] text-[var(--theme-text-tertiary)]">
                        Select a pre-defined collection to tailor database schema, setup scripts, and implementation guides.
                      </p>
                    </div>

                    {/* Output Mode Switcher */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--theme-text-secondary)] uppercase tracking-wider flex items-center gap-2">
                        <Layers className="h-4 w-4 text-[var(--theme-accent-1)]" />
                        Output Structure Mode
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setOutputMode("full")}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${
                            outputMode === "full"
                              ? "border-[var(--theme-accent-1)] bg-[var(--theme-background-tertiary)] text-[var(--theme-text)] shadow-sm"
                              : "border-[var(--theme-border)] bg-transparent text-[var(--theme-text-secondary)] hover:bg-[var(--theme-background-tertiary)]/50"
                          }`}
                        >
                          <AlignLeft className={`h-5 w-5 mb-1.5 ${outputMode === "full" ? "text-[var(--theme-accent-1)]" : "text-[var(--theme-text-tertiary)]"}`} />
                          <span className="font-semibold text-xs">Full Prompt</span>
                          <span className="text-[10px] text-[var(--theme-text-tertiary)] mt-1">Single comprehensive master prompt</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOutputMode("phased")}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${
                            outputMode === "phased"
                              ? "border-[var(--theme-accent-1)] bg-[var(--theme-background-tertiary)] text-[var(--theme-text)] shadow-sm"
                              : "border-[var(--theme-border)] bg-transparent text-[var(--theme-text-secondary)] hover:bg-[var(--theme-background-tertiary)]/50"
                          }`}
                        >
                          <Layers className={`h-5 w-5 mb-1.5 ${outputMode === "phased" ? "text-[var(--theme-accent-1)]" : "text-[var(--theme-text-tertiary)]"}`} />
                          <span className="font-semibold text-xs">Phased Prompts</span>
                          <span className="text-[10px] text-[var(--theme-text-tertiary)] mt-1">Step-by-step building process plan</span>
                        </button>
                      </div>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={generateMutation.isPending}
                      className="w-full h-12 bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] hover:brightness-110 text-[var(--theme-accent-text)] font-semibold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[var(--theme-accent-text)] border-t-transparent rounded-full animate-spin" />
                          Architecting Prompt...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                          Generate Architecture Prompt
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
