"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserResponse } from "@/lib/types";
import { authApi } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import Image from "next/image";
import { Upload, User as UserIcon, LogOut } from "lucide-react";
import { removeToken } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: user, isLoading: userLoading } = useQuery<UserResponse>({
    queryKey: ["user"],
    queryFn: () => authApi.getMe(),
  });

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    try {
      const updatedUser = await authApi.uploadProfilePicture(formData);
      queryClient.setQueryData(["user"], updatedUser);
      toast({
        title: "Profile picture updated!",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update profile picture",
        description:
          error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  if (userLoading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center bg-[var(--theme-background)] pt-16 lg:pt-0">
            <div className="w-24 h-24 rounded-full bg-[var(--theme-background-tertiary)] animate-pulse"></div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-[var(--theme-background)] pt-16 lg:pt-0">
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="w-full max-w-md bg-[var(--theme-background-secondary)] border-[var(--theme-border)]">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-6">
                  <div
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center border-4 border-dashed border-[var(--theme-border)] overflow-hidden z-0 ${isDragging ? 'border-[var(--theme-accent-1)] bg-[var(--theme-background-tertiary)]' : 'bg-[var(--theme-background-tertiary)]'}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files?.[0]) {
                        handleFileChange(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {user?.profile_picture_url ? (
                      <Image
                        src={user.profile_picture_url}
                        alt={user.username}
                        fill
                        unoptimized={true}
                        className="object-cover"
                      />
                    ) : (
                      <UserIcon className="h-12 w-12 text-[var(--theme-text-secondary)]" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                </div>
                <CardTitle className="text-2xl text-[var(--theme-text)]">{user?.username}</CardTitle>
                <CardDescription className="text-[var(--theme-text-secondary)]">{user?.email}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="bg-[var(--theme-background-tertiary)] rounded-xl p-4 border border-[var(--theme-border)]">
                  <div className="text-sm text-[var(--theme-text-tertiary)] mb-1">Member since</div>
                  <div className="text-[var(--theme-text)]">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
                {user && user.role !== "admin" && (
                  <div className="bg-[var(--theme-background-tertiary)] rounded-xl p-4 border border-[var(--theme-border)] flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[var(--theme-text-tertiary)] mb-1">Prompts Used</div>
                      <div className={`font-semibold ${user.prompts_used >= user.max_prompts ? 'text-red-500' : 'text-[var(--theme-text)]'}`}>
                        {user.prompts_used} / {user.max_prompts}
                      </div>
                    </div>
                    {user.prompts_used >= user.max_prompts && (
                      <span className="text-xs font-semibold px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full">
                        Limit Reached
                      </span>
                    )}
                  </div>
                )}
                <Button
                  variant="ghost"
                  className="w-full h-12 text-red-400 hover:text-red-400 hover:bg-red-400/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
