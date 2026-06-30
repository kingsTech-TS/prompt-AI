"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearAllAuthData } from "@/lib/auth";
import { authApi } from "@/lib/api";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    // Validate token against server to catch expired/stale tokens
    authApi
      .getMe()
      .then(() => {
        setIsVerified(true);
      })
      .catch(() => {
        // Token is invalid or expired — force a clean logout
        clearAllAuthData();
        router.push("/login");
      });
  }, [router]);

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-sm text-[var(--theme-text-secondary)]">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
