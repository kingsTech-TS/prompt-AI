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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ForgotPasswordRequest } from "@/lib/types";
import { authApi } from "@/lib/api";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<ForgotPasswordRequest>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordRequest) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(values);
      setIsEmailSent(true);
      toast({
        title: "Reset email sent!",
        description: "If the email exists, you'll receive a reset link",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send reset email",
        description:
          error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--theme-background)]">
        <Card className="w-full max-w-md bg-[var(--theme-background-secondary)] border-[var(--theme-border)]">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-[var(--theme-accent-text)]" />
              </div>
            </div>
            <CardTitle className="text-2xl text-[var(--theme-text)]">Check your email</CardTitle>
            <CardDescription className="text-[var(--theme-text-secondary)]">
              We've sent a password reset link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              asChild
              className="w-full h-12 bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] text-[var(--theme-accent-text)] font-medium hover:brightness-110"
            >
              <Link href="/login">
                Back to login
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsEmailSent(false);
                form.reset();
              }}
              className="text-[var(--theme-text-secondary)]"
            >
              Resend email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--theme-background)]">
      <Card className="w-full max-w-md bg-[var(--theme-background-secondary)] border-[var(--theme-border)]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-[var(--theme-accent-text)]" />
            </div>
          </div>
          <CardTitle className="text-2xl text-[var(--theme-text)]">Forgot your password?</CardTitle>
          <CardDescription className="text-[var(--theme-text-secondary)]">
            Enter your email address and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--theme-text-secondary)]">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                        className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-tertiary)] focus:ring-0 focus-visible:ring-0"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] text-[var(--theme-accent-text)] font-medium hover:brightness-110"
                disabled={isLoading}
              >
                {isLoading ? "Sending email..." : "Send reset link"}
              </Button>
              <p className="text-center text-sm text-[var(--theme-text-secondary)]">
                Remember your password?{" "}
                <Link href="/login" className="text-[var(--theme-text)] hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}