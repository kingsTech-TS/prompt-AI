"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { promptsApi } from "@/lib/api";
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
    onError: (error: any) => {
      toast({
        title: "Failed to generate prompt",
        description:
          error.message || "An error occurred while generating the prompt",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
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
      const newFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (newFiles.length > 0) {
        setImages((prev) => [...prev, ...newFiles]);
        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
      }
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

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-[var(--theme-background)] to-[var(--theme-background-secondary)]">
          <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 lg:pt-0">
            <div className="w-full max-w-3xl">
              <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] flex items-center justify-center shadow-lg">
                    <Sparkles className="h-8 w-8 text-[var(--theme-accent-text)]" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold mb-3 text-[var(--theme-text)]">Generate New Prompt</h1>
                <p className="text-[var(--theme-text-secondary)] text-lg">
                  Enter a website URL or upload images to get started
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* URL Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[var(--theme-text-secondary)] font-medium">
                    <LinkIcon className="h-5 w-5" />
                    <span>Website URL</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-14 bg-[var(--theme-background-tertiary)]/70 border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-tertiary)] focus:ring-0 focus-visible:ring-0 focus:border-[var(--theme-accent-1)]/50 rounded-xl text-base"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-[var(--theme-border)]" />
                  <span className="text-[var(--theme-text-tertiary)] text-sm font-medium">or</span>
                  <div className="flex-1 h-px bg-[var(--theme-border)]" />
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[var(--theme-text-secondary)] font-medium">
                    <ImageIcon className="h-5 w-5" />
                    <span>Upload Images</span>
                  </div>
                  <div
                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                      isDragOver 
                        ? "border-[var(--theme-accent-1)] bg-[var(--theme-background-tertiary)]/70" 
                        : "border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] hover:bg-[var(--theme-background-tertiary)]/30"
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
                    <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${isDragOver ? "text-[var(--theme-accent-1)]" : "text-[var(--theme-text-tertiary)]"}`} />
                    <p className={`text-lg font-medium ${isDragOver ? "text-[var(--theme-accent-1)]" : "text-[var(--theme-text-secondary)]"}`}>
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[var(--theme-text-tertiary)] text-sm mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            width={120}
                            height={120}
                            className="w-28 h-28 object-cover rounded-xl border border-[var(--theme-border)]"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] hover:brightness-110 text-[var(--theme-accent-text)] font-bold gap-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <span className="animate-pulse">Generating...</span>
                  ) : (
                    <>
                      Generate Prompt
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
