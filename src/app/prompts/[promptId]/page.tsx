"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import { Markdown } from "@/components/markdown";
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
import {
  PromptResponse,
  ChatSessionResponse,
  ChatMessageRequest,
  IdeaPhase,
} from "@/lib/types";
import { agentById } from "@/lib/agents";
import { promptsApi, chatApi } from "@/lib/api";
import { buildPromptMarkdown, downloadMarkdown, extractPromptText, tidyMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import {
  Copy,
  Trash2,
  ArrowUp,
  Sparkles,
  Check,
  Download,
  ArrowDown,
  Lightbulb,
  FileText,
  Layers,
  Database,
  KeyRound,
  Boxes,
  Bot,
  Compass,
  Users,
  LayoutDashboard,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

type DisplayMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  images?: string[];
};

type IdeaTab = "overview" | "full" | "stack" | "env" | "db" | "phases";

const UI_SUGGESTIONS = [
  "Convert this to Next.js + Tailwind CSS",
  "Add more detail on each component",
  "Make the layout mobile-first",
  "Add accessibility requirements",
];

const IDEA_SUGGESTIONS = [
  "Break the MVP into smaller tasks",
  "Expand the testing strategy",
  "Suggest a cheaper hosting setup",
  "Add authentication edge cases",
];

export default function PromptDetailPage() {
  const { promptId } = useParams<{ promptId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<IdeaTab>("overview");
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
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
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast({
        title: "Prompt deleted",
        description: "Redirecting to dashboard...",
      });
      router.push("/dashboard");
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

  const sendMessage = (text: string) => {
    if (text.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate({ message: text.trim() });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(message);
  };

  const handleCopyPrompt = () => {
    if (prompt) {
      navigator.clipboard.writeText(buildPromptMarkdown(prompt));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Prompt copied!",
        description: "The prompt has been copied to your clipboard as Markdown",
      });
    }
  };

  const handleDownloadPrompt = () => {
    if (prompt) {
      downloadMarkdown(buildPromptMarkdown(prompt));
      toast({
        title: "Download started",
        description: "Saved as prompt.md",
      });
    }
  };

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 240);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatSession?.messages, sendMessageMutation.isPending, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [message]);

  if (promptLoading || chatLoading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-canvas">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col pt-14 lg:pt-0">
            <div className="h-14 border-b border-line" />
            <div className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-10 sm:px-6">
              <div className="ml-auto h-10 w-1/2 animate-pulse rounded-3xl bg-elevated" />
              <div className="flex gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-elevated" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded-lg bg-elevated" />
                  <div className="h-4 w-full animate-pulse rounded-lg bg-elevated" />
                  <div className="h-4 w-5/6 animate-pulse rounded-lg bg-elevated" />
                  <div className="h-40 w-full animate-pulse rounded-2xl bg-elevated" />
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
        <div className="flex h-screen bg-canvas">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 pt-14 lg:pt-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface">
              <FileText className="h-5 w-5 text-fg-subtle" />
            </div>
            <p className="font-medium text-fg">Prompt not found</p>
            <p className="text-sm text-fg-muted">It may have been deleted.</p>
            <Button variant="outline" className="mt-2" onClick={() => router.push("/dashboard")}>
              Back to home
            </Button>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const isIdea = prompt.source_type === "idea";
  const promptText = extractPromptText(prompt.generated_prompt);

  const firstChatMessage = chatSession.messages[0];
  const hasDuplicatePrompt =
    firstChatMessage &&
    firstChatMessage.role === "assistant" &&
    firstChatMessage.content.trim() === prompt.generated_prompt.trim();

  // Reconstruct the user's original request so the conversation reads naturally
  const initialUserMessage: DisplayMessage | null = isIdea
    ? prompt.idea_text
      ? { role: "user", content: prompt.idea_text, timestamp: prompt.created_at }
      : null
    : prompt.source_url || prompt.cloudinary_images.length > 0
      ? {
          role: "user",
          content: prompt.source_url
            ? `Generate a UI prompt from ${prompt.source_url}`
            : "Generate a UI prompt from these screenshots",
          timestamp: prompt.created_at,
          images: prompt.cloudinary_images.map((img) => img.url),
        }
      : null;

  const chatBaseMessages: DisplayMessage[] = hasDuplicatePrompt
    ? chatSession.messages
    : [
        { role: "assistant", content: promptText, timestamp: prompt.created_at },
        ...chatSession.messages,
      ];

  const allMessages: DisplayMessage[] = initialUserMessage
    ? [initialUserMessage, ...chatBaseMessages]
    : chatBaseMessages;

  const firstAssistantIdx = allMessages.findIndex((m) => m.role === "assistant");
  const hasFollowUps = allMessages.length - (firstAssistantIdx + 1) > 0;
  const suggestions = isIdea ? IDEA_SUGGESTIONS : UI_SUGGESTIONS;

  // The first AI message is the generated prompt: export the full structured document for it.
  // Follow-up chat replies are exported as their own Markdown.
  const messageMarkdown = (content: string, isSystemPrompt: boolean) =>
    isSystemPrompt ? buildPromptMarkdown(prompt) : tidyMarkdown(content) + "\n";

  const copyToClipboard = (text: string, description = "Copied to clipboard.") => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description });
  };

  const copyMessage = (idx: number, content: string, isSystemPrompt: boolean) => {
    navigator.clipboard.writeText(messageMarkdown(content, isSystemPrompt));
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const formatTime = (ts?: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  const isPhased = !!prompt.phases?.length;
  const agent = agentById(prompt.target_agent);
  const analysis = prompt.analysis;

  const ideaTabs: { id: IdeaTab; label: string; icon: React.ElementType; show: boolean }[] = [
    { id: "overview", label: "Overview", icon: Compass, show: !!(analysis || prompt.summary) },
    { id: "full", label: isPhased ? "Project brief" : "Full prompt", icon: FileText, show: true },
    { id: "phases", label: `Phases (${prompt.phases?.length ?? 0})`, icon: Layers, show: isPhased },
    { id: "stack", label: "Stack", icon: Boxes, show: !!prompt.recommended_stack && Object.keys(prompt.recommended_stack).length > 0 },
    { id: "db", label: "Database", icon: Database, show: !!prompt.db_schemas?.length },
    { id: "env", label: ".env", icon: KeyRound, show: !!prompt.env_variables?.length },
  ];
  const visibleTabs = ideaTabs.filter((t) => t.show);
  const currentTab = visibleTabs.some((t) => t.id === activeTab) ? activeTab : visibleTabs[0].id;

  const phaseMarkdown = (p: IdeaPhase) =>
    tidyMarkdown(`# ${prompt.title}: Phase ${p.phase_number} - ${p.title}\n\n${p.content}`) + "\n";

  const renderIdeaContent = () => {
    const blueprint = extractPromptText(prompt.full_prompt || prompt.generated_prompt);
    switch (currentTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {prompt.summary && <p className="text-[15px] leading-relaxed text-fg">{prompt.summary}</p>}

            {/* How to use with the chosen agent */}
            <div className="flex gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
              <Bot className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
              <div>
                <p className="text-sm font-medium text-fg">Written for {agent.label === "Any agent" ? "any coding agent" : agent.label}</p>
                <p className="mt-0.5 text-sm text-fg-muted">
                  {agent.howTo}{" "}
                  {isPhased
                    ? "Paste the project brief first, then each phase in order. Check its acceptance criteria before moving on."
                    : "Paste the full prompt once and let the agent work through the build plan."}
                </p>
              </div>
            </div>

            {analysis && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {analysis.app_type && (
                    <div className="rounded-xl border border-line bg-canvas/60 p-4">
                      <div className="text-xs text-fg-muted">Type of app</div>
                      <div className="mt-1 text-sm font-medium text-fg">{analysis.app_type}</div>
                      {analysis.target_users.length > 0 && (
                        <div className="mt-1 text-xs text-fg-subtle">For {analysis.target_users.join(", ")}</div>
                      )}
                    </div>
                  )}
                  {analysis.needs_admin_dashboard != null && (
                    <div className="rounded-xl border border-line bg-canvas/60 p-4">
                      <div className="flex items-center gap-1.5 text-xs text-fg-muted">
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        Admin dashboard
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-fg">
                        {analysis.needs_admin_dashboard ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-400" /> Needed
                          </>
                        ) : (
                          <>
                            <Minus className="h-4 w-4 text-fg-subtle" /> Not needed
                          </>
                        )}
                      </div>
                      {analysis.dashboard_reason && <div className="mt-1 text-xs text-fg-subtle">{analysis.dashboard_reason}</div>}
                    </div>
                  )}
                </div>

                {analysis.roles.length > 0 && (
                  <section>
                    <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-fg-muted">
                      <Users className="h-3.5 w-3.5" />
                      {analysis.roles.length} {analysis.roles.length === 1 ? "role" : "roles"}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {analysis.roles.map((role) => (
                        <div key={role.name} className="rounded-xl border border-line bg-canvas/60 p-4">
                          <div className="text-sm font-semibold text-fg">{role.name}</div>
                          {role.description && <p className="mt-0.5 text-xs text-fg-muted">{role.description}</p>}
                          {role.permissions.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {role.permissions.map((perm) => (
                                <li key={perm} className="flex gap-1.5 text-xs text-fg-muted">
                                  <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-brand" />
                                  {perm}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {[
                  { label: "Core features", items: analysis.core_features },
                  { label: "Integrations", items: analysis.integrations },
                ]
                  .filter((g) => g.items.length > 0)
                  .map((g) => (
                    <section key={g.label}>
                      <h4 className="mb-2 text-xs font-medium text-fg-muted">{g.label}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {g.items.map((item) => (
                          <span key={item} className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-fg">
                            {item}
                          </span>
                        ))}
                      </div>
                    </section>
                  ))}
              </>
            )}
          </div>
        );

      case "full":
        return (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-canvas/60 px-4 py-2.5">
              <p className="text-xs text-fg-muted">
                {isPhased
                  ? "Paste this first so your agent understands the whole project."
                  : `Paste this into ${agent.label === "Any agent" ? "your coding agent" : agent.label} to build the whole app.`}
              </p>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(blueprint, "Copied the prompt.")}>
                <Copy className="h-3 w-3" />
                Copy prompt
              </Button>
            </div>
            <Markdown content={blueprint} />
          </div>
        );

      case "stack":
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(prompt.recommended_stack ?? {}).map(([category, techs]) => (
              <div key={category} className="rounded-xl border border-line bg-canvas/60 p-4">
                <div className="mb-3 text-xs font-medium capitalize text-fg-muted">{category}</div>
                <div className="flex flex-wrap gap-1.5">
                  {techs.map((tech, i) => (
                    <span key={i} className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-fg">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "env":
        return (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const envStr = prompt.env_variables
                    ?.map((v) => `# ${v.description}\n${v.key}=${v.example}`)
                    .join("\n\n");
                  if (envStr) copyToClipboard(envStr, "Copied .env template.");
                }}
              >
                <Copy className="h-3 w-3" />
                Copy .env template
              </Button>
            </div>
            <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {prompt.env_variables?.map((env, i) => (
                <div key={i} className="grid gap-1 bg-canvas/60 px-4 py-3 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4">
                  <code className="truncate font-mono text-xs font-semibold text-brand">{env.key}</code>
                  <div className="min-w-0">
                    <p className="text-sm text-fg">{env.description}</p>
                    {env.example && <code className="mt-1 block truncate font-mono text-[11px] text-fg-subtle">{env.example}</code>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "db":
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {prompt.db_schemas?.map((schema, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-line bg-canvas/60">
                <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
                  <Database className="h-3.5 w-3.5 text-brand" />
                  <span className="font-mono text-xs font-semibold text-fg">{schema.name}</span>
                  <span className="ml-auto text-[11px] text-fg-subtle">{schema.fields.length} fields</span>
                </div>
                <div className="divide-y divide-line">
                  {schema.fields.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 px-4 py-2 text-xs">
                      <span className="truncate font-mono text-fg-muted">{f.name}</span>
                      <div className="flex flex-shrink-0 items-center gap-1.5">
                        <span className="rounded-md bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">{f.type}</span>
                        {f.required && (
                          <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400">required</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "phases": {
        const phases = prompt.phases ?? [];
        const index = Math.min(activePhaseIndex, phases.length - 1);
        const phase = phases[index];
        return (
          <div className="grid gap-5 md:grid-cols-[14rem_1fr]">
            {/* Stepper */}
            <ol className="relative flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:gap-0 md:overflow-visible md:pb-0">
              {phases.map((p, i) => {
                const active = i === index;
                return (
                  <li key={p.phase_number} className="relative flex-shrink-0 md:pb-1">
                    {i < phases.length - 1 && (
                      <span className="absolute left-[1.3rem] top-9 hidden h-[calc(100%-1.75rem)] w-px bg-line md:block" />
                    )}
                    <button
                      type="button"
                      onClick={() => setActivePhaseIndex(i)}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-colors",
                        active ? "bg-elevated" : "hover:bg-elevated/60"
                      )}
                    >
                      <span
                        className={cn(
                          "relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                          active ? "bg-brand-gradient text-brand-fg" : "border border-line bg-surface text-fg-muted"
                        )}
                      >
                        {p.phase_number}
                      </span>
                      <span className="min-w-0">
                        <span className={cn("line-clamp-2 text-xs font-medium", active ? "text-fg" : "text-fg-muted")}>{p.title}</span>
                        {p.goal && <span className="mt-0.5 hidden text-[11px] leading-snug text-fg-subtle md:line-clamp-2">{p.goal}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {phase && (
              <div key={phase.phase_number} className="min-w-0 animate-rise">
                <div className="mb-4 rounded-xl border border-line bg-canvas/60 p-4">
                  <div className="text-[11px] font-medium text-fg-subtle">
                    Phase {phase.phase_number} of {phases.length}
                  </div>
                  <h4 className="mt-0.5 text-base font-semibold text-fg">{phase.title}</h4>
                  {phase.goal && <p className="mt-1 text-sm text-fg-muted">{phase.goal}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => copyToClipboard(phaseMarkdown(phase), `Copied phase ${phase.phase_number}.`)}>
                      <Copy className="h-3 w-3" />
                      Copy phase prompt
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadMarkdown(phaseMarkdown(phase), `phase-${phase.phase_number}.md`)}>
                      <Download className="h-3 w-3" />
                      phase-{phase.phase_number}.md
                    </Button>
                  </div>
                </div>

                <Markdown content={phase.content} />

                <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                  <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => setActivePhaseIndex(index - 1)}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <Button size="sm" variant="ghost" disabled={index === phases.length - 1} onClick={() => setActivePhaseIndex(index + 1)}>
                    Next phase
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <Sidebar />
        <main className="relative flex min-w-0 flex-1 flex-col pt-14 lg:pt-0">
          {/* ── Header ─────────────────────────────────────────── */}
          <header className="glass z-20 flex h-14 flex-shrink-0 items-center justify-between gap-3 border-b border-line px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-line bg-surface">
                {isIdea ? <Lightbulb className="h-4 w-4 text-brand" /> : <Sparkles className="h-4 w-4 text-brand" />}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-fg">{prompt.title}</h1>
                <p className="text-[11px] text-fg-subtle">
                  {isIdea ? "Idea blueprint" : "UI/UX prompt"} ·{" "}
                  {new Date(prompt.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleCopyPrompt} className="h-8 gap-1.5" title="Copy as Markdown">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPrompt} className="h-8 gap-1.5" title="Download as prompt.md">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">prompt.md</span>
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400" title="Delete prompt">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Delete this prompt?</DialogTitle>
                    <DialogDescription className="text-fg-muted">
                      The prompt and its chat history will be permanently deleted. This can&apos;t be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-2 gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {/* ── Messages ─────────────────────────────────────────── */}
          <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl space-y-8 px-4 pb-48 pt-8 sm:px-6">
              {allMessages.map((msg, idx) => {
                const isAssistant = msg.role === "assistant";
                const isSystemPrompt = isAssistant && idx === firstAssistantIdx;

                if (!isAssistant) {
                  return (
                    <div key={idx} className="flex animate-rise flex-col items-end gap-2">
                      {msg.images && msg.images.length > 0 && (
                        <div className="flex max-w-[85%] flex-wrap justify-end gap-2">
                          {msg.images.map((src, i) => (
                            <a
                              key={i}
                              href={src}
                              target="_blank"
                              rel="noreferrer"
                              className="relative h-20 w-20 overflow-hidden rounded-xl border border-line transition-transform hover:scale-[1.03] sm:h-24 sm:w-24"
                            >
                              <Image src={src} alt={`Source image ${i + 1}`} fill className="object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-br-lg bg-elevated px-4 py-2.5 text-[0.9375rem] leading-relaxed text-fg">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="group/msg flex animate-rise gap-3 sm:gap-4">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-gradient shadow-glow">
                      <Sparkles className="h-3.5 w-3.5 text-brand-fg" />
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      {isSystemPrompt ? (
                        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
                          {/* Card header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-medium text-brand">
                                <Sparkles className="h-3 w-3" />
                                {isIdea ? (isPhased ? "Phased build plan" : "Full build prompt") : "Generated UI/UX prompt"}
                              </span>
                              <span className="text-[11px] text-fg-subtle">
                                {wordCount(isIdea ? prompt.full_prompt || msg.content : msg.content).toLocaleString()} words
                              </span>
                            </div>
                          </div>

                          {isIdea ? (
                            <>
                              <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2">
                                {visibleTabs.map(({ id, label, icon: Icon }) => (
                                  <button
                                    key={id}
                                    type="button"
                                    onClick={() => setActiveTab(id)}
                                    className={cn(
                                      "flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                                      currentTab === id ? "bg-elevated text-fg" : "text-fg-muted hover:text-fg"
                                    )}
                                  >
                                    <Icon className={cn("h-3.5 w-3.5", currentTab === id && "text-brand")} />
                                    {label}
                                  </button>
                                ))}
                              </div>
                              <div className="max-h-[60vh] overflow-y-auto px-5 py-5">{renderIdeaContent()}</div>
                            </>
                          ) : (
                            <div className="max-h-[60vh] overflow-y-auto px-5 py-5">
                              <Markdown content={msg.content} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <Markdown content={msg.content} />
                      )}

                      {/* Message actions */}
                      <div className="mt-2 flex items-center gap-0.5 opacity-60 transition-opacity group-hover/msg:opacity-100">
                        <button
                          onClick={() => copyMessage(idx, msg.content, isSystemPrompt)}
                          className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs text-fg-subtle transition-colors hover:bg-elevated hover:text-fg"
                          title="Copy as Markdown"
                        >
                          {copiedIdx === idx ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedIdx === idx ? "Copied" : "Copy"}
                        </button>
                        <button
                          onClick={() => downloadMarkdown(messageMarkdown(msg.content, isSystemPrompt))}
                          className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs text-fg-subtle transition-colors hover:bg-elevated hover:text-fg"
                          title="Download as prompt.md"
                        >
                          <Download className="h-3.5 w-3.5" />
                          .md
                        </button>
                        {msg.timestamp && (
                          <span className="ml-2 text-[11px] text-fg-subtle">{formatTime(msg.timestamp)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pending: echo the user's message and show a thinking indicator */}
              {sendMessageMutation.isPending && (
                <>
                  <div className="flex animate-rise justify-end">
                    <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-br-lg bg-elevated px-4 py-2.5 text-[0.9375rem] leading-relaxed text-fg">
                      {sendMessageMutation.variables?.message}
                    </div>
                  </div>
                  <div className="flex animate-rise items-center gap-3 sm:gap-4">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-gradient shadow-glow">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse text-brand-fg" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-subtle"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                      <span className="ml-1.5 text-sm text-fg-subtle">Thinking</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Composer ─────────────────────────────────────────── */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-canvas via-canvas/95 to-transparent pt-10">
            <div className="pointer-events-auto mx-auto w-full max-w-3xl px-4 pb-4 sm:px-6">
              {showScrollDown && (
                <button
                  onClick={() => scrollToBottom()}
                  className="absolute -top-2 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface text-fg-muted shadow-soft transition-colors hover:text-fg"
                  aria-label="Scroll to latest"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              )}

              {!hasFollowUps && !sendMessageMutation.isPending && (
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sendMessage(s)}
                      className="flex-shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-fg-muted transition-colors hover:border-brand/40 hover:text-fg"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-2 rounded-3xl border border-line bg-surface p-2 pl-4 shadow-lift transition-colors focus-within:border-brand/50"
              >
                <textarea
                  ref={textareaRef}
                  placeholder="Ask to refine, expand, or convert this prompt..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={1}
                  className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[0.9375rem] text-fg outline-none placeholder:text-fg-subtle"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gradient text-brand-fg shadow-glow transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
                  aria-label="Send message"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-2 hidden select-none text-center text-[11px] text-fg-subtle sm:block">
                <span className="kbd">Enter</span> to send · <span className="kbd">Shift + Enter</span> for a new line
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
