"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { ResetPasswordRequest } from "@/lib/types";
import { authApi } from "@/lib/api";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const form = useForm<{ new_password: string; confirmPassword: string }>({
    defaultValues: {
      new_password: "",
      confirmPassword: "",
    },
  });

  const token = params.token as string;

  const onSubmit = async (values: any) => {
    if (values.new_password !== values.confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        token,
        newPassword: values.new_password,
      });
      setIsPasswordReset(true);
      toast({
        title: "Password reset successful!",
        description: "You can now log in with your new password",
      });
    } catch (error: any) {
      toast({
        title: "Failed to reset password",
        description:
          error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--theme-background)]">
        <Card className="w-full max-w-md bg-[var(--theme-background-secondary)] border-[var(--theme-border)]">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-[var(--theme-accent-text)]" />
              </div>
            </div>
            <CardTitle className="text-2xl text-[var(--theme-text)]">Password reset!</CardTitle>
            <CardDescription className="text-[var(--theme-text-secondary)]">
              Your password has been reset successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="w-full h-12 bg-gradient-to-br from-[var(--theme-accent-1)] to-[var(--theme-accent-2)] text-[var(--theme-accent-text)] font-medium hover:brightness-110"
            >
              <Link href="/login">
                Go to login
              </Link>
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
          <CardTitle className="text-2xl text-[var(--theme-text)]">Set new password</CardTitle>
          <CardDescription className="text-[var(--theme-text-secondary)]">
            Choose a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                  control={form.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--theme-text-secondary)]">New password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-tertiary)] focus:ring-0 focus-visible:ring-0"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--theme-text-secondary)]">Confirm password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
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
                  {isLoading ? "Resetting password..." : "Reset password"}
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