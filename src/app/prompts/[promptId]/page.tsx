"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  PromptResponse,
  ChatSessionResponse,
  ChatMessage as ChatMessageType,
  ChatMessageRequest,
} from "@/lib/types";
import { promptsApi, chatApi } from "@/lib/api";
import { Copy, Trash2, Send, Sparkles, User, Check } from "lucide-react";
import Image from "next/image";

export default function PromptDetailPage() {
  const { promptId } = useParams<{ promptId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("full");
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: prompt, isLoading: promptLoading } = useQuery<PromptResponse>({
    queryKey: ["prompt", promptId],
    queryFn: async () => {
      return await promptsApi.getById(promptId);
    },
  });

  const { data: chatSession, isLoading: chatLoading } =
    useQuery<ChatSessionResponse>({
      queryKey: ["chat", promptId],
      queryFn: async () => {
        return await chatApi.getSession(promptId);
      },
    });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: ChatMessageRequest) => {
      return await chatApi.sendMessage(promptId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", promptId] });
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description:
          error.message || "An error occurred while sending the message",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await promptsApi.delete(promptId);
    },
    onSuccess: () => {
      toast({
        title: "Prompt deleted",
        description: "Redirecting to dashboard...",
      });
      router.push("/");
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate({ message });
    }
  };

  const handleCopyPrompt = () => {
    if (prompt?.generated_prompt) {
      navigator.clipboard.writeText(prompt.generated_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Prompt copied!",
        description: "The prompt has been copied to your clipboard",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatSession?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
  }, [message]);

  if (promptLoading || chatLoading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-[var(--theme-background)] to-[var(--theme-background-secondary)]">
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse space-y-6 w-full max-w-3xl px-8">
                <div className="h-8 bg-[var(--theme-background-tertiary)] rounded-xl w-1/3" />
                <div className="h-4 bg-[var(--theme-background-tertiary)] rounded-xl w-1/2" />
                <div className="space-y-4">
                  <div className="h-24 bg-[var(--theme-background-tertiary)] rounded-2xl w-3/4" />
                  <div className="h-16 bg-[var(--theme-background-tertiary)] rounded-2xl w-1/2 ml-auto" />
                  <div className="h-24 bg-[var(--theme-background-tertiary)] rounded-2xl w-3/4" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!prompt || !chatSession) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-[var(--theme-background)] to-[var(--theme-background-secondary)]">
            <div className="flex-1 flex items-center justify-center">
              <p className="text-red-400 text-xl font-medium">Prompt not found</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const firstChatMessage = chatSession.messages[0];
  const hasDuplicatePrompt =
    firstChatMessage &&
    firstChatMessage.role === "assistant" &&
    firstChatMessage.content.trim() === prompt.generated_prompt.trim();

  const allMessages = hasDuplicatePrompt
    ? chatSession.messages
    : [
        {
          role: "assistant" as const,
          content: prompt.generated_prompt,
          timestamp: prompt.created_at,
        },
        ...chatSession.messages,
      ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied message content to clipboard.",
    });
  };

  const formatTime = (ts?: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <ProtectedRoute>
      <style>{`
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-appear {
          animation: msgFadeIn 0.25s ease-out forwards;
        }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .typing-dot:nth-child(1) { animation: typingBounce 1.2s infinite 0s; }
        .typing-dot:nth-child(2) { animation: typingBounce 1.2s infinite 0.2s; }
        .typing-dot:nth-child(3) { animation: typingBounce 1.2s infinite 0.4s; }
      `}</style>

      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-[var(--theme-background)]">
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* ── Chat Header ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--theme-border)] mt-16 lg:mt-0 bg-[var(--theme-background-secondary)] backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                {/* AI Avatar with online indicator */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] flex items-center justify-center shadow-md">
                    <Sparkles className="h-5 w-5 text-[var(--theme-accent-text)]" />
                  </div>
                  {/* Online dot */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[var(--theme-background-secondary)] shadow-sm" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-sm font-bold truncate text-[var(--theme-text)] leading-tight">
                    {prompt.title}
                  </h1>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    PromptCraft AI · Active now
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyPrompt}
                  className="h-9 w-9 text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent-1)] hover:bg-[var(--theme-background-tertiary)] rounded-xl transition-all"
                  title="Copy generated prompt"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-[var(--theme-text-secondary)] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Delete prompt"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[var(--theme-background-secondary)] border-[var(--theme-border)] text-[var(--theme-text)] rounded-2xl max-w-sm sm:max-w-md mx-4">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Delete Prompt</DialogTitle>
                      <DialogDescription className="text-[var(--theme-text-secondary)]">
                        Are you sure you want to delete this prompt? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3 mt-6">
                      <Button
                        variant="outline"
                        className="h-10 bg-[var(--theme-background-tertiary)] hover:bg-[var(--theme-border-hover)] border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl"
                        onClick={(e) => {
                          (e.target as HTMLElement).closest("dialog")?.close();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                        className="h-10 rounded-xl"
                      >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* ── Source images strip ──────────────────────────────────── */}
            {prompt.cloudinary_images.length > 0 && (
              <div className="px-4 sm:px-6 py-2.5 border-b border-[var(--theme-border)] bg-[var(--theme-background-secondary)]">
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {prompt.cloudinary_images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl overflow-hidden border border-[var(--theme-border)] hover:border-[var(--theme-accent-1)] transition-all hover:scale-105"
                    >
                      <Image
                        src={img.url}
                        alt={`Source image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Messages ─────────────────────────────────────────────── */}
            <ScrollArea className="flex-1">
              <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
                {allMessages.map((msg, idx) => {
                  const isAssistant = msg.role === "assistant";
                  const isSystemPrompt = idx === 0 && isAssistant;

                  return (
                    <div
                      key={idx}
                      className={`msg-appear flex w-full gap-2.5 items-end ${
                        isAssistant ? "justify-start" : "justify-end"
                      }`}
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      {/* AI Avatar (left side) */}
                      {isAssistant && (
                        <div className="flex-shrink-0 mb-1">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] flex items-center justify-center shadow-sm">
                            <Sparkles className="h-4 w-4 text-[var(--theme-accent-text)]" />
                          </div>
                        </div>
                      )}

                      {/* Bubble */}
                      <div className={`relative group/msg max-w-[82%] sm:max-w-[72%] ${isAssistant ? "text-left" : "text-right"}`}>
                        {/* System prompt badge */}
                        {isSystemPrompt && (
                          <div className="flex items-center gap-1.5 mb-1.5 px-1">
                            <span className="text-[10px] font-bold text-[var(--theme-accent-1)] uppercase tracking-widest flex items-center gap-1">
                              <Sparkles className="h-3 w-3 animate-pulse" />
                              {prompt.source_type === "idea" ? "Generated Idea Architecture & Prompt" : "Generated UI/UX Prompt"}
                            </span>
                          </div>
                        )}

                        <div
                          className={`relative px-4 py-3 text-sm sm:text-[0.9rem] leading-relaxed break-words transition-all duration-200 ${
                            isAssistant
                              ? "bg-[var(--theme-background-secondary)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-2xl rounded-bl-md hover:border-[var(--theme-border-hover)] pr-10 shadow-sm"
                              : "bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] text-[var(--theme-accent-text)] rounded-2xl rounded-br-md shadow-md hover:brightness-105"
                          }`}
                        >
                          {/* Copy button for AI messages */}
                          {isAssistant && !(isSystemPrompt && prompt.source_type === "idea") && (
                            <button
                              onClick={() => copyToClipboard(msg.content)}
                              className="absolute right-2.5 top-2.5 p-1.5 rounded-lg text-[var(--theme-text-tertiary)] hover:text-[var(--theme-accent-1)] hover:bg-[var(--theme-background-tertiary)] opacity-0 group-hover/msg:opacity-100 transition-all"
                              title="Copy"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {isSystemPrompt && prompt.source_type === "idea" ? (
                            <div className="w-full space-y-4 py-2">
                              {/* Main tabs selector */}
                              <div className="flex flex-wrap gap-1.5 border-b border-[var(--theme-border)] pb-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveTab("full")}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    activeTab === "full"
                                      ? "bg-[var(--theme-accent-1)] text-[var(--theme-accent-text)]"
                                      : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-background-tertiary)]"
                                  }`}
                                >
                                  Full Prompt
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab("stack")}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    activeTab === "stack"
                                      ? "bg-[var(--theme-accent-1)] text-[var(--theme-accent-text)]"
                                      : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-background-tertiary)]"
                                  }`}
                                >
                                  Recommended Stack
                                </button>
                                {prompt.env_variables && prompt.env_variables.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setActiveTab("env")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                      activeTab === "env"
                                        ? "bg-[var(--theme-accent-1)] text-[var(--theme-accent-text)]"
                                        : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-background-tertiary)]"
                                    }`}
                                  >
                                    .env Config
                                  </button>
                                )}
                                {prompt.db_schemas && prompt.db_schemas.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setActiveTab("db")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                      activeTab === "db"
                                        ? "bg-[var(--theme-accent-1)] text-[var(--theme-accent-text)]"
                                        : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-background-tertiary)]"
                                    }`}
                                  >
                                    DB Schemas
                                  </button>
                                )}
                                {prompt.phases && prompt.phases.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setActiveTab("phases")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                      activeTab === "phases"
                                        ? "bg-[var(--theme-accent-1)] text-[var(--theme-accent-text)]"
                                        : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-background-tertiary)]"
                                    }`}
                                  >
                                    Phased Roadmap
                                  </button>
                                )}
                              </div>

                              {/* Tab Contents */}
                              <div className="bg-[var(--theme-background-tertiary)] border border-[var(--theme-border)] rounded-2xl p-4 min-h-[200px]">
                                
                                {/* 1. Full Prompt Tab */}
                                {activeTab === "full" && (
                                  <div className="space-y-4 relative group/tab">
                                    <div className="flex justify-between items-center">
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
                                        Full Application Prompt
                                      </h4>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(prompt.full_prompt || prompt.generated_prompt)}
                                        className="h-8 px-2.5 rounded-lg text-xs hover:bg-[var(--theme-background)] flex items-center gap-1 border border-[var(--theme-border)]"
                                      >
                                        <Copy className="h-3 w-3" />
                                        Copy Prompt
                                      </Button>
                                    </div>
                                    <div className="text-xs sm:text-sm text-[var(--theme-text)] whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-1">
                                      {prompt.full_prompt || prompt.generated_prompt}
                                    </div>
                                  </div>
                                )}

                                {/* 2. Recommended Stack Tab */}
                                {activeTab === "stack" && (
                                  <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
                                      Recommended Tech Stack
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {prompt.recommended_stack &&
                                        Object.entries(prompt.recommended_stack).map(([category, techs]) => (
                                          <div key={category} className="p-3 bg-[var(--theme-background)] rounded-xl border border-[var(--theme-border)]">
                                            <span className="text-[10px] font-bold text-[var(--theme-accent-1)] uppercase tracking-wider block mb-2">
                                              {category}
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                              {techs.map((tech: string, i: number) => (
                                                <span key={i} className="px-2 py-0.5 rounded bg-[var(--theme-background-secondary)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)]">
                                                  {tech}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {/* 3. Env Variables Tab */}
                                {activeTab === "env" && prompt.env_variables && (
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
                                        Environment Variables (.env)
                                      </h4>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          const envStr = prompt.env_variables
                                            ?.map((v) => `# ${v.description}\n${v.key}=${v.example}`)
                                            .join("\n\n");
                                          if (envStr) copyToClipboard(envStr);
                                        }}
                                        className="h-8 px-2.5 rounded-lg text-xs hover:bg-[var(--theme-background)] flex items-center gap-1 border border-[var(--theme-border)]"
                                      >
                                        <Copy className="h-3 w-3" />
                                        Copy .env Template
                                      </Button>
                                    </div>

                                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                                      {prompt.env_variables.map((env, i) => (
                                        <div key={i} className="p-3 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-xl space-y-1 text-left">
                                          <div className="flex flex-wrap justify-between items-center gap-2">
                                            <code className="text-xs font-bold text-[var(--theme-accent-1)] font-mono">{env.key}</code>
                                            <code className="text-[10px] text-[var(--theme-text-tertiary)] font-mono">Example: {env.example}</code>
                                          </div>
                                          <p className="text-[11px] text-[var(--theme-text-secondary)]">
                                            {env.description}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 4. DB Schemas Tab */}
                                {activeTab === "db" && prompt.db_schemas && (
                                  <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
                                      Database Schema Blueprint
                                    </h4>
                                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                                      {prompt.db_schemas.map((schema, i) => (
                                        <div key={i} className="p-4 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-xl space-y-3 text-left">
                                          <div className="flex items-center gap-1.5 border-b border-[var(--theme-border)] pb-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                            <span className="font-bold text-xs text-[var(--theme-text)]">{schema.name}</span>
                                          </div>
                                          <div className="space-y-2">
                                            {schema.fields.map((f, idx) => (
                                              <div key={idx} className="flex justify-between items-center text-xs">
                                                <span className="font-semibold font-mono text-[var(--theme-text-secondary)]">{f.name}</span>
                                                <div className="flex items-center gap-2">
                                                  <span className="px-1.5 py-0.5 rounded bg-[var(--theme-background-secondary)] border border-[var(--theme-border)] text-[10px] font-mono text-[var(--theme-text-tertiary)]">
                                                    {f.type}
                                                  </span>
                                                  {f.required && (
                                                    <span className="px-1 py-0.5 rounded text-[8px] bg-red-500/10 border border-red-500/20 text-red-400 font-bold uppercase tracking-wider">
                                                      Required
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 5. Phased Breakdown Tab */}
                                {activeTab === "phases" && prompt.phases && (
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
                                        Step-by-Step Phased Roadmap
                                      </h4>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          const currentPhase = prompt.phases?.[activePhaseIndex];
                                          if (currentPhase) {
                                            copyToClipboard(currentPhase.content);
                                          }
                                        }}
                                        className="h-8 px-2.5 rounded-lg text-xs hover:bg-[var(--theme-background)] flex items-center gap-1 border border-[var(--theme-border)]"
                                      >
                                        <Copy className="h-3 w-3" />
                                        Copy Current Phase Prompt
                                      </Button>
                                    </div>

                                    {/* Phase selector tabs */}
                                    <div className="flex gap-1 overflow-x-auto pb-1.5 border-b border-[var(--theme-border)]">
                                      {prompt.phases.map((phase, i) => (
                                        <button
                                          key={i}
                                          type="button"
                                          onClick={() => setActivePhaseIndex(i)}
                                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex-shrink-0 transition-all ${
                                            activePhaseIndex === i
                                              ? "bg-[var(--theme-accent-2)] text-[var(--theme-accent-text)]"
                                              : "bg-[var(--theme-background)] text-[var(--theme-text-secondary)] border border-[var(--theme-border)] hover:bg-[var(--theme-background-secondary)]"
                                          }`}
                                        >
                                          Phase {phase.phase_number}: {phase.title}
                                        </button>
                                      ))}
                                    </div>

                                    {/* Phase Prompt content */}
                                    <div className="text-xs sm:text-sm text-[var(--theme-text)] whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-1 text-left">
                                      {prompt.phases?.[activePhaseIndex]?.content}
                                    </div>
                                  </div>
                                )}

                              </div>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>

                        {/* Timestamp */}
                        {msg.timestamp && (
                          <p className={`text-[10px] text-[var(--theme-text-tertiary)] mt-1 px-1 ${isAssistant ? "text-left" : "text-right"}`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        )}
                      </div>

                      {/* User Avatar (right side) */}
                      {!isAssistant && (
                        <div className="flex-shrink-0 mb-1">
                          <div className="w-8 h-8 rounded-full bg-[var(--theme-background-tertiary)] flex items-center justify-center border border-[var(--theme-border)] shadow-sm">
                            <User className="h-4 w-4 text-[var(--theme-text-secondary)]" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Typing indicator when AI is responding */}
                {sendMessageMutation.isPending && (
                  <div className="msg-appear flex gap-2.5 items-end justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] flex items-center justify-center shadow-sm flex-shrink-0 mb-1">
                      <Sparkles className="h-4 w-4 text-[var(--theme-accent-text)]" />
                    </div>
                    <div className="px-4 py-3.5 rounded-2xl rounded-bl-md bg-[var(--theme-background-secondary)] border border-[var(--theme-border)] shadow-sm flex items-center gap-1.5">
                      <span className="typing-dot w-2 h-2 rounded-full bg-[var(--theme-accent-1)] inline-block" />
                      <span className="typing-dot w-2 h-2 rounded-full bg-[var(--theme-accent-1)] inline-block" />
                      <span className="typing-dot w-2 h-2 rounded-full bg-[var(--theme-accent-1)] inline-block" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* ── Input bar ────────────────────────────────────────────── */}
            <div className="px-4 sm:px-6 py-4 border-t border-[var(--theme-border)] bg-[var(--theme-background-secondary)] backdrop-blur-md">
              <div className="w-full max-w-3xl mx-auto">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2.5">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={textareaRef}
                      placeholder="Say something..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full min-h-[46px] py-3 pl-4 pr-4 resize-none bg-[var(--theme-background-tertiary)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-tertiary)] focus:ring-1 focus:ring-[var(--theme-accent-1)] focus-visible:ring-0 focus:border-[var(--theme-accent-1)] rounded-2xl text-sm sm:text-[0.9rem] transition-all overflow-hidden"
                      rows={1}
                      style={{ height: "46px" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="icon"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="h-[46px] w-[46px] flex-shrink-0 bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] hover:brightness-110 text-[var(--theme-accent-text)] rounded-xl shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </Button>
                </form>

                <p className="text-[10px] text-[var(--theme-text-tertiary)] mt-2 text-center select-none">
                  Press <kbd className="px-1 py-0.5 rounded bg-[var(--theme-background-tertiary)] border border-[var(--theme-border)] font-mono text-[9px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-[var(--theme-background-tertiary)] border border-[var(--theme-border)] font-mono text-[9px]">Shift+Enter</kbd> for new line
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
