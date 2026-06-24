"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { promptsApi, authApi } from "@/lib/api";
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
    onError: (error: any) => {
      if (error.message && (error.message.includes("403") || error.message.toLowerCase().includes("limit") || error.message.toLowerCase().includes("forbidden"))) {
        toast({
          title: "Limit Reached",
          description: "You have used all your available prompts. Please upgrade to Pro to generate more.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to generate prompt",
          description:
            error.message || "An error occurred while generating the prompt",
          variant: "destructive",
        });
      }
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
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-[var(--theme-background)] to-[var(--theme-background-secondary)] overflow-y-auto">
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:px-8 mt-16 lg:mt-0">
            <div className="w-full max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Left Side: Elegant Guide & Features */}
                <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-3xl bg-[var(--theme-background-secondary)] border border-[var(--theme-border)] relative overflow-hidden group">
                  {/* Glowing background shapes for premium look */}
                  <div 
                    className="absolute -top-40 -left-40 w-80 h-80 rounded-full blur-3xl transition-all duration-700" 
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent-1) 10%, transparent)' }}
                  />
                  <div 
                    className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full blur-3xl transition-all duration-700" 
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent-2) 10%, transparent)' }}
                  />
                  
                  <div className="relative z-10 space-y-8">
                    <div>
                      <div 
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--theme-accent-1)] mb-4 uppercase tracking-wider border"
                        style={{ 
                          backgroundColor: 'color-mix(in srgb, var(--theme-accent-1) 10%, transparent)',
                          borderColor: 'color-mix(in srgb, var(--theme-accent-1) 20%, transparent)'
                        }}
                      >
                        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                        AI-Powered Analysis
                      </div>
                      <h1 className="text-4xl font-extrabold text-[var(--theme-text)] tracking-tight leading-tight">
                        Generate Premium <br />
                        <span className="bg-gradient-to-r from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] bg-clip-text text-transparent">
                          UI/UX Prompts
                        </span>
                      </h1>
                      <p className="text-[var(--theme-text-secondary)] mt-4 text-base leading-relaxed">
                        Transform reference designs or live websites into detailed, copy-pasteable prompts. Perfect for v0, Claude, and ChatGPT.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--theme-background-tertiary)] flex items-center justify-center border border-[var(--theme-border)] flex-shrink-0 text-[var(--theme-accent-1)] shadow-sm">
                          <span className="font-bold text-sm">1</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--theme-text)] text-sm">Enter a Website URL</h3>
                          <p className="text-xs text-[var(--theme-text-secondary)] mt-1">Provide any live website link to extract layout schemas, components, and styling tokens.</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--theme-background-tertiary)] flex items-center justify-center border border-[var(--theme-border)] flex-shrink-0 text-[var(--theme-accent-1)] shadow-sm">
                          <span className="font-bold text-sm">2</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--theme-text)] text-sm">Or Upload Screenshots</h3>
                          <p className="text-xs text-[var(--theme-text-secondary)] mt-1">Drag and drop screenshots to inspect typography, layout hierarchy, and style elements.</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--theme-background-tertiary)] flex items-center justify-center border border-[var(--theme-border)] flex-shrink-0 text-[var(--theme-accent-1)] shadow-sm">
                          <span className="font-bold text-sm">3</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--theme-text)] text-sm">Get AI-Generated Prompts</h3>
                          <p className="text-xs text-[var(--theme-text-secondary)] mt-1">Obtain structure-rich UI prompts, component definitions, and Tailwind code blueprints instantly.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-8 border-t border-[var(--theme-border)] mt-8">
                    <p className="text-xs text-[var(--theme-text-tertiary)]">
                      Supported file formats: PNG, JPG, GIF up to 10MB each.
                    </p>
                  </div>
                </div>

                {/* Right Side: Form Container */}
                <div className="lg:col-span-7">
                  <div className="h-full p-8 lg:p-10 rounded-3xl bg-[var(--theme-background-secondary)] border border-[var(--theme-border)] shadow-2xl relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col justify-between">
                      <div className="space-y-6">
                        {/* URL Section */}
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
                            <LinkIcon className="h-4 w-4 text-[var(--theme-accent-1)]" />
                            <span>Analyze Live Website</span>
                          </label>
                          <div className="relative group">
                            <Input
                              type="url"
                              placeholder="https://example.com"
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              className="h-14 bg-[var(--theme-background-tertiary)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-tertiary)] focus:ring-1 focus:ring-[var(--theme-accent-1)] focus-visible:ring-0 focus:border-[var(--theme-accent-1)] rounded-2xl text-base px-5 shadow-inner transition-all"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 py-2">
                          <div className="flex-1 h-px bg-[var(--theme-border)]" />
                          <span className="text-[var(--theme-text-tertiary)] text-xs font-bold uppercase tracking-wider">Or</span>
                          <div className="flex-1 h-px bg-[var(--theme-border)]" />
                        </div>

                        {/* Drag and Drop Section */}
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
                            <ImageIcon className="h-4 w-4 text-[var(--theme-accent-1)]" />
                            <span>Upload Reference Images</span>
                          </label>
                          <div
                            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 relative ${
                              isDragOver 
                                ? "border-[var(--theme-accent-1)] bg-[var(--theme-background-tertiary)]" 
                                : "border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] hover:bg-[var(--theme-background-tertiary)] bg-[var(--theme-background-tertiary)]"
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
                            <div className="flex flex-col items-center justify-center">
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors text-[var(--theme-accent-1)]"
                                style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent-1) 10%, transparent)' }}
                              >
                                <Upload className="h-6 w-6" />
                              </div>
                              <p className={`text-base font-semibold ${isDragOver ? "text-[var(--theme-accent-1)]" : "text-[var(--theme-text-secondary)]"}`}>
                                {isDragOver ? "Drop files here" : "Click to upload or drag & drop"}
                              </p>
                              <p className="text-[var(--theme-text-tertiary)] text-xs mt-1">
                                Drag and drop screenshots directly into this area
                              </p>
                            </div>
                          </div>

                          {imagePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-4 max-h-40 overflow-y-auto p-1">
                              {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group rounded-xl overflow-hidden shadow-md border border-[var(--theme-border)] bg-[var(--theme-background-tertiary)] flex-shrink-0">
                                  <Image
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="h-8 w-8 rounded-lg shadow-lg hover:scale-105 transition-transform"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(index);
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-6">
                        <Button
                          type="submit"
                          className="w-full h-14 bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] hover:brightness-110 text-[var(--theme-accent-text)] font-bold gap-3 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={generateMutation.isPending || (user ? user.role === "admin" || user.prompts_used >= user.max_prompts : false)}
                        >
                          {generateMutation.isPending ? (
                            <div className="flex items-center gap-2 justify-center">
                              <span className="w-2 h-2 rounded-full bg-[var(--theme-accent-text)] animate-bounce" />
                              <span className="w-2 h-2 rounded-full bg-[var(--theme-accent-text)] animate-bounce [animation-delay:0.2s]" />
                              <span className="w-2 h-2 rounded-full bg-[var(--theme-accent-text)] animate-bounce [animation-delay:0.4s]" />
                              <span className="ml-1">Analyzing and Generating...</span>
                            </div>
                          ) : (
                            <>
                              Generate Custom Prompt
                              <ArrowRight className="h-5 w-5 animate-pulse" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
