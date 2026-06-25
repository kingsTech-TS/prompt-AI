"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function IdeaResultRedirectPage() {
  const router = useRouter();
  const { promptId } = useParams();

  useEffect(() => {
    if (promptId) {
      router.replace(`/prompts/${promptId}`);
    }
  }, [promptId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--theme-background)]">
      <div className="w-8 h-8 border-4 border-[var(--theme-accent-1)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
