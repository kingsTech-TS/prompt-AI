"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthShell } from "@/components/auth-shell";
import { useToast } from "@/hooks/use-toast";
import { UserLogin } from "@/lib/types";
import { authApi } from "@/lib/api";
import { setToken, clearAllAuthData } from "@/lib/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Lock, Mail } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const form = useForm<UserLogin>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

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
      triggerShake();
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
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      heroTitle={
        <>
          Your designs and ideas,
          <br />
          <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
            turned into prompts.
          </span>
        </>
      }
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-brand underline-offset-4 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, triggerShake)}
          className={cn("space-y-5", shake && "animate-shake")}
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: { value: EMAIL_RE, message: "Enter a valid email address" },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-fg">Email</FormLabel>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-fg-subtle transition-colors group-focus-within:text-brand" />
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...field}
                      className="h-12 pl-10"
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            rules={{ required: "Password is required" }}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium text-fg">Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-brand underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-fg-subtle transition-colors group-focus-within:text-brand" />
                  <FormControl>
                    <PasswordInput
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      {...field}
                      className="h-12 pl-10"
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

          <Button
            id="login-submit"
            type="submit"
            className="group h-12 w-full text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
