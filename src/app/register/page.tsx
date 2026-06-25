"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { UserCreate } from "@/lib/types";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserCreate>({
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: UserCreate) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(values);
      setToken(response.access_token);
      toast({
        title: "Registration successful!",
        description: "Redirecting to dashboard...",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
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
              width: `${[3, 2, 4, 2, 3, 5, 2, 3, 4, 2, 3, 2, 4, 3, 2, 5, 3, 2, 4, 3, 2, 3][i]}px`,
              height: `${[3, 2, 4, 2, 3, 5, 2, 3, 4, 2, 3, 2, 4, 3, 2, 5, 3, 2, 4, 3, 2, 3][i]}px`,
              top: `${[8, 15, 23, 38, 5, 55, 72, 85, 91, 45, 62, 30, 17, 77, 50, 33, 68, 12, 43, 80, 25, 60][i]}%`,
              left: `${[10, 30, 60, 80, 50, 20, 70, 40, 15, 85, 55, 45, 75, 25, 65, 35, 5, 90, 48, 72, 18, 82][i]}%`,
              animationDelay: `${[0, 0.5, 1, 1.5, 2, 0.3, 0.8, 1.2, 1.7, 2.2, 0.6, 1.1, 0.2, 0.9, 1.4, 1.9, 0.4, 0.7, 1.3, 1.8, 2.1, 0.1][i]}s`,
              animationDuration: `${[2, 3, 2.5, 3.5, 2, 4, 2.5, 3, 2, 3.5, 2.5, 4, 3, 2, 3.5, 2.5, 3, 2, 4, 2.5, 3.5, 2][i]}s`,
            }}
          />
        ))}

        {/* Glowing orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-60px] w-96 h-96 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none" />

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
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/90 text-xs font-medium tracking-wide">
                  Join thousands of designers
                </span>
              </div>
              <h1
                className="text-white font-bold leading-tight mb-4"
                style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
              >
                Start Your
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #e2baff 0%, #c084fc 50%, #f0abfc 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Design Journey
                </span>
              </h1>
              <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-md">
                Create your free account and unlock the power of AI-driven UI
                prompt generation. No credit card required.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 mt-8">
                {[
                  { value: "10k+", label: "Prompts generated" },
                  { value: "Free", label: "To get started" },
                  { value: "∞", label: "Possibilities" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-white font-bold text-xl">{stat.value}</p>
                    <p className="text-white/50 text-xs mt-0.5">{stat.label}</p>
                  </div>
                ))}
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
            "Great design is born from great prompts. We help you write both."
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
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/logo.png" alt="PromptCraft" width={36} height={36} className="rounded-xl" />
              <span className="font-bold text-lg text-[var(--theme-text)]">PromptCraft</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-[var(--theme-text)] font-bold text-3xl mb-2">
              Create account 🚀
            </h2>
            <p className="text-[var(--theme-text-secondary)] text-sm">
              Fill in the details below to get started for free
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--theme-text-secondary)] text-sm font-medium">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="register-username"
                        placeholder="johndoe"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--theme-text-secondary)] text-sm font-medium">
                      Email address
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="register-email"
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
                    <FormLabel className="text-[var(--theme-text-secondary)] text-sm font-medium">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="register-password"
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
                id="register-submit"
                type="submit"
                className="w-full h-12 rounded-xl font-semibold text-white text-base transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Divider */}
              <div className="relative flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-[var(--theme-border)]" />
                <span className="text-[var(--theme-text-tertiary)] text-xs">or</span>
                <div className="flex-1 h-px bg-[var(--theme-border)]" />
              </div>

              <p className="text-center text-sm text-[var(--theme-text-secondary)]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
