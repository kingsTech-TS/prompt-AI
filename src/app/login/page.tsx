"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { UserLogin } from "@/lib/types";
import { authApi } from "@/lib/api";
import { setToken, clearAllAuthData } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserLogin>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: UserLogin) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(values);
      // Security: wipe any previous user's token + session data
      // and clear all cached query data before logging in the new user.
      clearAllAuthData();
      queryClient.clear();
      // Now set the new user's token
      setToken(response.access_token);
      toast({
        title: "Login successful!",
        description: "Redirecting to dashboard...",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* ── Left hero panel ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex relative lg:w-[55%] flex-col justify-between p-8 sm:p-12 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #2d0a6e 0%, #4b1299 40%, #7c3abf 70%, #9b59d0 100%)",
        }}
      >
        {/* Animated star dots */}
        {[...Array(22)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white/60 animate-pulse"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 90}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}

        {/* Glowing orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-60px] w-96 h-96 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="PromptCraft"
              width={40}
              height={40}
              className="rounded-xl group-hover:scale-105 transition-transform"
            />
            <span className="text-white font-bold text-xl tracking-tight">
              PromptCraft
            </span>
          </Link>
        </div>

        {/* Hero text + rocket */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-0">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/90 text-xs font-medium tracking-wide">
                  AI-Powered UI Prompt Generator
                </span>
              </div>
              <h1
                className="text-white font-bold leading-tight mb-4"
                style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
              >
                Launch Your
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #e2baff 0%, #c084fc 50%, #f0abfc 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Creative Vision
                </span>
              </h1>
              <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-md">
                Transform any website or image into precision-crafted UI/UX
                prompts. Your next great design starts here.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-3 mt-8">
                {["✦ AI-Powered", "✦ Instant Results", "✦ Chat & Refine"].map(
                  (f) => (
                    <span
                      key={f}
                      className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm backdrop-blur-sm"
                    >
                      {f}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Rocket illustration */}
            <div className="relative lg:absolute lg:right-8 lg:bottom-24 flex-shrink-0">
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56">
                <div className="absolute inset-0 rounded-full bg-white/5 blur-xl animate-pulse" />
                <Image
                  src="/rocket.png"
                  alt="Rocket launching"
                  fill
                  className="object-contain drop-shadow-[0_0_30px_rgba(192,132,252,0.6)]"
                  style={{
                    animation: "rocketFloat 3s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-t border-white/15 pt-6">
          <p className="text-white/50 text-xs">
            "The best design tool is the one that understands your vision."
          </p>
        </div>

        <style>{`
          @keyframes rocketFloat {
            0%, 100% { transform: translateY(0px) rotate(-5deg); }
            50% { transform: translateY(-16px) rotate(-5deg); }
          }
        `}</style>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <div className="flex-1 lg:flex-none lg:w-[45%] min-h-screen lg:min-h-0 flex items-center justify-center p-6 sm:p-10 bg-[var(--theme-background)]">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Mobile logo (hidden on desktop) */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/logo.png" alt="PromptCraft" width={36} height={36} className="rounded-xl" />
              <span className="font-bold text-lg text-[var(--theme-text)]">PromptCraft</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-[var(--theme-text)] font-bold text-3xl mb-2">
              Welcome back 👋
            </h2>
            <p className="text-[var(--theme-text-secondary)] text-sm">
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--theme-text-secondary)] text-sm font-medium">
                      Email address
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                        className="h-12 rounded-xl bg-[var(--theme-background-secondary)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-tertiary)] focus:ring-0 focus-visible:ring-0 focus:border-purple-500/60 transition-all hover:border-[var(--theme-border-hover)] shadow-sm hover:shadow-md"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-1.5">
                      <FormLabel className="text-[var(--theme-text-secondary)] text-sm font-medium">
                        Password
                      </FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="h-12 rounded-xl bg-[var(--theme-background-secondary)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-tertiary)] focus:ring-0 focus-visible:ring-0 focus:border-purple-500/60 transition-all hover:border-[var(--theme-border-hover)] shadow-sm hover:shadow-md"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <Button
                id="login-submit"
                type="submit"
                className="w-full h-12 rounded-xl font-semibold text-white text-base transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3abf 0%, #9b59d0 50%, #b06de0 100%)",
                  boxShadow: isLoading
                    ? "none"
                    : "0 4px 24px rgba(124,58,191,0.4)",
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeOpacity="0.3"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Divider */}
              <div className="relative flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-[var(--theme-border)]" />
                <span className="text-[var(--theme-text-tertiary)] text-xs">or</span>
                <div className="flex-1 h-px bg-[var(--theme-border)]" />
              </div>

              <p className="text-center text-sm text-[var(--theme-text-secondary)]">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
