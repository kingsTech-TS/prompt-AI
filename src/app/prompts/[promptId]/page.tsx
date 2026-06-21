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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  if (promptLoading || chatLoading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-[var(--theme-background)] to-[var(--theme-background-secondary)]">
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse space-y-6 w-full max-w-4xl px-8">
                <div className="h-8 bg-[var(--theme-background-tertiary)] rounded-xl w-1/3" />
                <div className="h-4 bg-[var(--theme-background-tertiary)] rounded-xl w-1/2" />
                <div className="h-80 bg-[var(--theme-background-tertiary)] rounded-2xl" />
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

  // Check if the first message in chatSession is already the generated prompt to avoid duplicates
  const firstChatMessage = chatSession.messages[0];
  const hasDuplicatePrompt =
    firstChatMessage &&
    firstChatMessage.role === "assistant" &&
    firstChatMessage.content.trim() === prompt.generated_prompt.trim();

  const allMessages = hasDuplicatePrompt
    ? chatSession.messages
    : [
        {
          id: "system-prompt",
          role: "assistant" as const,
          content: prompt.generated_prompt,
        },
        ...chatSession.messages,
      ];

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-[var(--theme-background)] to-[var(--theme-background-secondary)]">
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--theme-border)] mt-16 lg:mt-0 bg-[var(--theme-background-secondary)]/50 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[var(--theme-accent-text)]" />
                </div>
                <h1 className="text-xl font-bold truncate text-[var(--theme-text)]">{prompt.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyPrompt}
                  className="h-10 w-10 text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent-1)] hover:bg-[var(--theme-background-tertiary)] rounded-xl transition-all"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-[var(--theme-accent-1)]" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-[var(--theme-text-secondary)] hover:text-red-400 hover:bg-[var(--theme-background-tertiary)] rounded-xl transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[var(--theme-background-secondary)] border-[var(--theme-border)] text-[var(--theme-text)] rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Delete Prompt</DialogTitle>
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
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                        className="h-10 rounded-xl"
                      >
                        {deleteMutation.isPending
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Source images */}
            {prompt.cloudinary_images.length > 0 && (
              <div className="px-8 py-4 border-b border-[var(--theme-border)] bg-[var(--theme-background-secondary)]/30">
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {prompt.cloudinary_images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border border-[var(--theme-border)]"
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

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="w-full max-w-4xl mx-auto px-8 py-10">
                {allMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-5 py-7 ${
                      idx > 0 ? "border-t border-[var(--theme-border)]/50" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {msg.role === "assistant" ? (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] flex items-center justify-center shadow-lg">
                          <Sparkles className="h-5 w-5 text-[var(--theme-accent-text)]" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[var(--theme-background-tertiary)] flex items-center justify-center border border-[var(--theme-border)]">
                          <User className="h-5 w-5 text-[var(--theme-text)]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="whitespace-pre-wrap text-[var(--theme-text)] text-lg leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="px-8 py-6 border-t border-[var(--theme-border)] bg-[var(--theme-background-secondary)]/50 backdrop-blur-sm">
              <div className="w-full max-w-4xl mx-auto">
                <form onSubmit={handleSendMessage} className="relative">
                  <Textarea
                    placeholder="Message PromptCraft AI..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full min-h-[60px] max-h-[200px] resize-y bg-[var(--theme-background-tertiary)]/70 border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-tertiary)] focus:ring-0 focus-visible:ring-0 focus:border-[var(--theme-accent-1)]/50 pr-16 rounded-2xl text-base"
                    rows={1}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="absolute right-3 bottom-3 h-12 w-12 bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] hover:brightness-110 text-[var(--theme-accent-text)] rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
