"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Eye, Trash2 } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<PaginatedPromptResponse>({
    queryKey: ["prompts", page, limit],
    queryFn: async () => {
      return await promptsApi.getAll(page, limit);
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Prompts</h1>
            <Button asChild>
              <Link href="/generate">Generate New Prompt</Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-10 w-20" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-lg">Failed to load prompts</p>
            </div>
          ) : data?.prompts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                You haven't created any prompts yet
              </p>
              <Button asChild>
                <Link href="/generate">Create your first prompt</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data?.prompts.map((prompt: PromptResponse) => (
                  <Card key={prompt.id}>
                    <CardHeader>
                      <CardTitle className="truncate">{prompt.title}</CardTitle>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">
                          {prompt.source_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(prompt.created_at)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {prompt.cloudinary_images.length > 0 && (
                        <div className="mb-4 h-32 relative overflow-hidden rounded-md">
                          <Image
                            src={prompt.cloudinary_images[0].url}
                            alt="Prompt preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/prompts/${prompt.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                            >
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
                    </CardContent>
                  </Card>
                ))}
              </div>
              {data && data.total > limit && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {Math.ceil(data.total / limit)}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= Math.ceil(data.total / limit)}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
