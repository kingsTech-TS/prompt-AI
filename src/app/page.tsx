"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PaginatedPromptResponse, PromptResponse } from "@/lib/types";
import { promptsApi } from "@/lib/api";
import { Plus, Trash2, Sparkles, Link as LinkIcon, Image as ImageIcon, Lightbulb } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<PaginatedPromptResponse>({
    queryKey: ["prompts"],
    queryFn: async () => {
      return await promptsApi.getAll(1, 100);
    },
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

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-[var(--theme-background)] to-[var(--theme-background-secondary)]">
          <div className="flex-1 flex flex-col items-center px-4 pt-20 lg:pt-8 pb-8 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-6 w-full max-w-4xl">
                <div className="h-10 bg-[var(--theme-background-tertiary)] rounded-xl animate-pulse" />
                <div className="h-16 bg-[var(--theme-background-tertiary)] rounded-xl animate-pulse" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-24 bg-[var(--theme-background-tertiary)] rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center">
                <p className="text-red-400 text-lg mb-4">Failed to load prompts</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold mb-3 text-[var(--theme-text)]">Welcome back!</h1>
                  <p className="text-[var(--theme-text-secondary)] text-lg">Generate UI/UX prompts from URLs and images</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
                  <Button
                    asChild
                    className="h-20 px-6 bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] hover:brightness-110 text-[var(--theme-accent-text)] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Link href="/generate">
                      <Plus className="h-6 w-6 mr-3" />
                      <div className="flex flex-col items-start">
                        <span className="text-lg">UI/UX Prompt Generator</span>
                        <span className="text-xs opacity-80">From URL or Screenshots</span>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-20 px-6 border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-background-tertiary)] font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <Link href="/idea">
                      <Lightbulb className="h-6 w-6 mr-3 text-yellow-400 animate-pulse" />
                      <div className="flex flex-col items-start">
                        <span className="text-lg">Idea Prompt Generator</span>
                        <span className="text-xs text-[var(--theme-text-secondary)]">From Application Idea</span>
                      </div>
                    </Link>
                  </Button>
                </div>

                {data?.prompts && data.prompts.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-[var(--theme-text)]">Your Recent Prompts</h2>
                    <div className="space-y-3">
                      {data?.prompts.map((prompt: PromptResponse) => (
                        <div
                          key={prompt.id}
                          className="group flex items-center gap-4 p-6 bg-[var(--theme-background-tertiary)]/50 rounded-xl border border-[var(--theme-border)] hover:border-[var(--theme-accent-1)]/50 hover:bg-[var(--theme-background-tertiary)] transition-all"
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] flex items-center justify-center">
                            {prompt.source_type === "idea" ? (
                              <Lightbulb className="h-6 w-6 text-[var(--theme-accent-text)]" />
                            ) : (
                              <Sparkles className="h-6 w-6 text-[var(--theme-accent-text)]" />
                            )}
                          </div>
                          <Button
                            asChild
                            variant="ghost"
                            className="flex-1 justify-start p-0 h-auto hover:bg-transparent text-left"
                          >
                            <Link href={`/prompts/${prompt.id}`}>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-[var(--theme-text)] truncate">{prompt.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-[var(--theme-text-secondary)] flex items-center gap-1">
                                    {prompt.source_type === "url" ? (
                                      <LinkIcon className="h-3 w-3" />
                                    ) : prompt.source_type === "idea" ? (
                                      <Lightbulb className="h-3 w-3 text-yellow-400" />
                                    ) : (
                                      <ImageIcon className="h-3 w-3" />
                                    )}
                                    {prompt.source_type}
                                  </span>
                                  <span className="text-xs text-[var(--theme-text-tertiary)]">
                                    {formatRelativeTime(prompt.created_at)}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-background-tertiary)] transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[var(--theme-background-secondary)] border-[var(--theme-border)] text-[var(--theme-text)] rounded-2xl">
                              <DialogHeader>
                                <DialogTitle>Delete Prompt</DialogTitle>
                                <DialogDescription className="text-[var(--theme-text-secondary)]">
                                  Are you sure you want to delete this prompt? This
                                  action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className="gap-3 mt-6">
                                <Button
                                  variant="outline"
                                  className="h-10 bg-[var(--theme-background-tertiary)] hover:bg-[var(--theme-border-hover)] border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl"
                                  onClick={(e) => {
                                    (e.target as HTMLElement).closest(
                                      "dialog"
                                    )?.close();
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(prompt.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  {deleteMutation.isPending
                                    ? "Deleting..."
                                    : "Delete"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
