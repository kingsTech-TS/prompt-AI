"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { promptsApi, authApi } from "@/lib/api";
import { ApiError } from "@/lib/errors";
import { Upload, X, ArrowRight, Link as LinkIcon, Image as ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";

export default function GeneratePage() {
  const [url, setUrl] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => authApi.getMe(),
  });

  const generateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await promptsApi.generate(formData);
    },
    onSuccess: (data) => {
      toast({
        title: "Prompt generated successfully!",
        description: "Redirecting to prompt detail...",
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

  const addFiles = (files: File[]) => {
    if (files.length === 0) return;
    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/")));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && images.length === 0) {
      toast({
        title: "Missing input",
        description: "Please provide either a URL or upload images",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    if (url) formData.append("url", url);
    images.forEach((image) => formData.append("images", image));

    generateMutation.mutate(formData);
  };

  const limitReached = user ? user.role !== "admin" && user.prompts_used >= user.max_prompts : false;
  const canSubmit = !!url.trim() || images.length > 0;

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <Sidebar />
        <main className="ambient flex-1 overflow-y-auto pt-14 lg:pt-0">
          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-4 py-10 sm:px-6">
            {/* Heading */}
            <div className="animate-rise text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                <Sparkles className="h-3.5 w-3.5" />
                UI/UX prompt generator
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                Turn any design into a <span className="text-gradient">build-ready prompt</span>
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-[15px] text-fg-muted">
                Paste a website link or drop screenshots. You&apos;ll get a detailed spec ready for v0, Cursor, Bolt or Lovable.
              </p>
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 animate-rise overflow-hidden rounded-3xl border border-line bg-surface shadow-lift [animation-delay:80ms]"
            >
              {/* URL */}
              <div className="flex items-center gap-3 border-b border-line px-5">
                <LinkIcon className="h-4 w-4 flex-shrink-0 text-fg-subtle" />
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-14 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-subtle"
                />
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl("")}
                    className="rounded-md p-1 text-fg-subtle hover:bg-elevated hover:text-fg"
                    aria-label="Clear URL"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Dropzone */}
              <div className="p-4">
                <div
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                    isDragOver
                      ? "border-brand bg-brand/5"
                      : "border-line hover:border-line-strong hover:bg-elevated/40"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                      isDragOver ? "bg-brand text-brand-fg" : "bg-elevated text-fg-muted"
                    }`}
                  >
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-fg">
                    {isDragOver ? "Drop to add screenshots" : "Drop screenshots here, or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-fg-subtle">PNG, JPG or GIF · up to 10MB each</p>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-line bg-elevated">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          width={80}
                          height={80}
                          className="h-20 w-20 object-cover"
                        />
                        <button
                          type="button"
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-opacity hover:bg-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          aria-label="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-3 border-t border-line bg-canvas/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-fg-subtle">
                  {limitReached
                    ? "You've reached your prompt limit."
                    : user?.role === "admin"
                      ? "Admin accounts can't generate prompts."
                      : user
                        ? `${Math.max(0, user.max_prompts - user.prompts_used)} prompts remaining`
                        : ""}
                </p>
                <Button
                  type="submit"
                  className="h-11 px-5"
                  disabled={!canSubmit || generateMutation.isPending || (user ? user.role === "admin" || limitReached : false)}
                >
                  {generateMutation.isPending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Analyzing design...
                    </>
                  ) : (
                    <>
                      Generate prompt
                      <ArrowRight />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* How it works */}
            <div className="mt-8 grid animate-rise grid-cols-1 gap-3 [animation-delay:160ms] sm:grid-cols-3">
              {[
                { icon: LinkIcon, title: "Add a source", text: "A live URL, screenshots, or both." },
                { icon: ImageIcon, title: "AI analyzes it", text: "Layout, typography, color and components." },
                { icon: Sparkles, title: "Refine in chat", text: "Iterate, then copy or download as Markdown." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-3 rounded-2xl border border-line bg-surface/50 p-4">
                  <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                  <div>
                    <h3 className="text-sm font-medium text-fg">{title}</h3>
                    <p className="mt-0.5 text-xs text-fg-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
