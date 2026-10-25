"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThinkingStep {
  label: string;
  /** Roughly how long this stage takes, in seconds. */
  seconds: number;
}

/**
 * "Thinking" panel shown while a prompt is generated.
 *
 * The API returns only when the whole job is done, so steps advance on estimated timings that follow the
 * backend's real order of work. The last step keeps spinning until the request finishes, so the panel never
 * claims to be done before the result arrives.
 */
export function ThinkingStatus({ steps, note }: { steps: ThinkingStep[]; note?: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - start) / 1000), 250);
    return () => clearInterval(id);
  }, []);

  // Index of the step in progress, based on cumulative estimated durations
  let current = steps.length - 1;
  let acc = 0;
  for (let i = 0; i < steps.length - 1; i++) {
    acc += steps[i].seconds;
    if (elapsed < acc) {
      current = i;
      break;
    }
  }

  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);

  return (
    <div className="animate-in fade-in slide-in-from-top-1 duration-300" role="status" aria-live="polite">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-brand-gradient">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />
            <Sparkles className="relative h-3 w-3 text-brand-fg" />
          </span>
          <span className="text-sm font-semibold text-fg">Thinking</span>
          <span className="flex gap-0.5" aria-hidden>
            {[0, 150, 300].map((d) => (
              <span key={d} className="h-1 w-1 animate-bounce rounded-full bg-fg-subtle" style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
        </div>
        <span className="font-mono text-xs tabular-nums text-fg-subtle">
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
      </div>

      <ol className="mt-4 space-y-2.5">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={step.label}
              className={cn(
                "flex items-center gap-3 text-sm transition-all duration-500",
                done && "text-fg-muted",
                active && "text-fg",
                !done && !active && "text-fg-subtle opacity-50"
              )}
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                {done ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/15 animate-in zoom-in-50 duration-300">
                    <Check className="h-3 w-3 text-brand" />
                  </span>
                ) : active ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-fg-subtle" />
                )}
              </span>
              <span className={cn(active && "font-medium")}>
                {step.label}
                {active && "..."}
              </span>
            </li>
          );
        })}
      </ol>

      {note && <p className="mt-4 text-[11px] text-fg-subtle">{note}</p>}
    </div>
  );
}
