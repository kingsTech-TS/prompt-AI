"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserResponse } from "@/lib/types";
import { authApi } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import Image from "next/image";
import { Camera, User as UserIcon, LogOut, Mail, CalendarDays, ShieldCheck } from "lucide-react";
import { clearAllAuthData } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { planById, previewUsage, promptUsage } from "@/lib/plans";

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
    // Same as the sidebar: drop the token and every cached query for this user
    clearAllAuthData();
    queryClient.clear();
    router.push("/login");
  };

  const usage = user ? promptUsage(user) : null;
  const usagePct = usage?.unlimited ? 100 : usage?.percent ?? 0;
  const limitReached = !!usage?.limitReached;

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <Sidebar />
        <main className="ambient flex-1 overflow-y-auto pt-14 lg:pt-0">
          <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:py-14">
            <h1 className="text-2xl font-semibold tracking-tight text-fg">Profile</h1>
            <p className="mt-1 text-sm text-fg-muted">Manage your account and usage.</p>

            {userLoading ? (
              <div className="mt-8 space-y-4">
                <div className="h-40 animate-pulse rounded-3xl bg-elevated" />
                <div className="h-28 animate-pulse rounded-3xl bg-elevated" />
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {/* Identity */}
                <section className="animate-rise overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
                  <div className="h-24 bg-brand-gradient opacity-80" />
                  <div className="px-6 pb-6">
                    <div className="-mt-12 flex items-end justify-between gap-4">
                      <button
                        type="button"
                        className={cn(
                          "group relative h-24 w-24 overflow-hidden rounded-full border-4 border-surface bg-elevated shadow-soft transition-all",
                          isDragging && "ring-4 ring-brand/40"
                        )}
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
                        title="Change profile picture"
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
                          <UserIcon className="mx-auto h-10 w-10 text-fg-subtle" />
                        )}
                        <div
                          className={cn(
                            "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity",
                            isLoading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}
                        >
                          {isLoading ? (
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Camera className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </button>
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
                      {user?.role === "admin" && (
                        <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Admin
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-xl font-semibold text-fg">{user?.username}</h2>
                    <div className="mt-3 flex flex-col gap-2 text-sm text-fg-muted sm:flex-row sm:gap-6">
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-fg-subtle" />
                        {user?.email}
                      </span>
                      <span className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-fg-subtle" />
                        Joined{" "}
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
                          : "-"}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Usage */}
                {user && user.role !== "admin" && (
                  <section className="animate-rise rounded-3xl border border-line bg-surface p-6 shadow-soft [animation-delay:60ms]">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-fg">Prompt usage · {planById(user.subscription).label} plan</h3>
                        <p className="mt-0.5 text-xs text-fg-muted">
                          Each generated prompt uses one credit.
                          {usage?.resetsOn && !usage.unlimited && ` Your credits renew on ${usage.resetsOn}.`}
                        </p>
                      </div>
                      {limitReached && (
                        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                          Limit reached
                        </span>
                      )}
                    </div>
                    <div className="mt-5 flex items-baseline gap-1.5">
                      <span className="text-3xl font-semibold tabular-nums tracking-tight text-fg">{user.prompts_used}</span>
                      <span className="text-sm text-fg-muted">
                        {usage?.unlimited ? "used · unlimited" : `/ ${user.max_prompts} used this month`}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-elevated">
                      <div
                        className={cn("h-full rounded-full transition-all", limitReached ? "bg-red-500" : "bg-brand-gradient")}
                        style={{ width: `${usagePct}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs text-fg-muted">
                      UI previews: <span className="tabular-nums text-fg">{previewUsage(user).usedLabel}</span> used this month
                    </p>
                  </section>
                )}

                {/* Session */}
                <section className="flex animate-rise items-center justify-between gap-4 rounded-3xl border border-line bg-surface p-6 shadow-soft [animation-delay:120ms]">
                  <div>
                    <h3 className="text-sm font-medium text-fg">Sign out</h3>
                    <p className="mt-0.5 text-xs text-fg-muted">End your session on this device.</p>
                  </div>
                  <Button variant="outline" className="hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400" onClick={handleLogout}>
                    <LogOut />
                    Sign out
                  </Button>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
