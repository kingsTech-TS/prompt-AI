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
import { UserLogin } from "@/lib/types";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
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
      setToken(response.access_token);
      toast({
        title: "Login successful!",
        description: "Redirecting to dashboard...",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description:
          error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#212121]">
      <Card className="w-full max-w-md bg-[#2f2f2f] border-[#3f3f3f]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-black" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Login to PromptCraft</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your credentials to access your account
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
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                        className="bg-[#212121] border-[#3f3f3f] text-white placeholder:text-gray-500 focus:ring-0 focus-visible:ring-0"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="bg-[#212121] border-[#3f3f3f] text-white placeholder:text-gray-500 focus:ring-0 focus-visible:ring-0"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-12 bg-white text-black hover:bg-gray-200 font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link href="/register" className="text-white hover:underline">
                  Register
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
