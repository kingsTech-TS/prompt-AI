"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { UserCreate } from "@/lib/types";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, AtSign, Lock, Mail } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STRENGTH = [
  { label: "Too weak", color: "bg-red-500", text: "text-red-400" },
  { label: "Weak", color: "bg-orange-500", text: "text-orange-400" },
  { label: "Fair", color: "bg-amber-400", text: "text-amber-400" },
  { label: "Good", color: "bg-lime-500", text: "text-lime-400" },
  { label: "Strong", color: "bg-emerald-500", text: "text-emerald-400" },
];

/** 0–4: one point each for length ≥ 8, mixed case, a number, a symbol (length < 6 caps it at 0). */
function passwordScore(pw: string) {
  if (pw.length < 6) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const form = useForm<UserCreate>({
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  const password = form.watch("password");
  const score = passwordScore(password);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

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
      triggerShake();
      toast({
        title: "Couldn't create your account",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const iconClass =
    "pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-fg-subtle transition-colors group-focus-within:text-brand";

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start turning designs and ideas into prompts. It's free."
      heroTitle={
        <>
          Ship faster with
          <br />
          <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
            build-ready prompts.
          </span>
        </>
      }
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, triggerShake)}
          className={cn("space-y-4", shake && "animate-shake")}
          noValidate
        >
          <FormField
            control={form.control}
            name="username"
            rules={{ required: "Username is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-fg">Username</FormLabel>
                <div className="group relative">
                  <AtSign className={iconClass} />
                  <FormControl>
                    <Input autoComplete="username" placeholder="johndoe" {...field} className="h-12 pl-10" />
                  </FormControl>
                </div>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

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
                  <Mail className={iconClass} />
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
                <FormLabel className="text-sm font-medium text-fg">Password</FormLabel>
                <div className="group relative">
                  <Lock className={iconClass} />
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Create a password"
                      {...field}
                      className="h-12 pl-10"
                    />
                  </FormControl>
                </div>

                {/* Strength meter: slides open once the user starts typing */}
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    password ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex flex-1 gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-elevated">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500 ease-out",
                                STRENGTH[score].color,
                                i < Math.max(score, 1) ? "w-full" : "w-0"
                              )}
                              style={{ transitionDelay: `${i * 60}ms` }}
                            />
                          </div>
                        ))}
                      </div>
                      <span className={cn("w-16 text-right text-[11px] font-medium transition-colors", STRENGTH[score].text)}>
                        {STRENGTH[score].label}
                      </span>
                    </div>
                    <p className="pt-1.5 text-[11px] text-fg-subtle">
                      Use 8+ characters with upper & lower case, a number and a symbol.
                    </p>
                  </div>
                </div>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

          <Button
            id="register-submit"
            type="submit"
            className="group mt-2 h-12 w-full text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>

          <p className="text-center text-[11px] text-fg-subtle">
            Free plan includes 3 prompts. No credit card required.
          </p>
        </form>
      </Form>
    </AuthShell>
  );
}
