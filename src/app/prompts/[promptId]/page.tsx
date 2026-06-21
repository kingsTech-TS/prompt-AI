"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { Copy, Trash2, Send, RefreshCw } from "lucide-react";
import Image from "next/image";

export default function PromptDetailPage() {
  const { promptId } = useParams<{ promptId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
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

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      return await chatApi.clearHistory(promptId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", promptId] });
      toast({
        title: "Chat history cleared",
        description: "The chat has been reset to the original prompt",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to clear history",
        description:
          error.message || "An error occurred while clearing the history",
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
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!prompt || !chatSession) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8 text-center">
            <p className="text-destructive text-lg">Prompt not found</p>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8 h-full">
            {/* Prompt Details */}
            <div className="space-y-6">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{prompt.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Source: {prompt.source_type}
                        {prompt.source_url && (
                          <span className="ml-2">
                            ({prompt.source_url})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyPrompt}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Prompt</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this prompt? This
                              action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
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
                </CardHeader>
                <CardContent className="space-y-4">
                  {prompt.cloudinary_images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {prompt.cloudinary_images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative h-32 overflow-hidden rounded-md"
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
                  )}
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {prompt.generated_prompt}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="flex flex-col h-full">
              <Card className="flex flex-col h-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Chat</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clearHistoryMutation.mutate()}
                      disabled={clearHistoryMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Clear History
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {chatSession.messages.map((msg: ChatMessageType, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-3 ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <Avatar>
                              <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          {msg.role === "user" && (
                            <Avatar>
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <Separator />
                  <div className="p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="resize-none"
                        rows={1}
                      />
                      <Button
                        type="submit"
                        disabled={!message.trim() || sendMessageMutation.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
