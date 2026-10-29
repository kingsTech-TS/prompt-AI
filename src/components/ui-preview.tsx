"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Monitor, Tablet, Smartphone, RefreshCw, Maximize2, Minimize2, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThinkingStatus, ThinkingStep } from "@/components/thinking-status";
import { cn } from "@/lib/utils";

const DEVICES = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: 1280 },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 768 },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 390 },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];

const PREVIEW_STEPS: ThinkingStep[] = [
  { label: "Reading the prompt", seconds: 4 },
  { label: "Laying out the page", seconds: 20 },
  { label: "Styling the components", seconds: 30 },
  { label: "Adding interactions", seconds: 60 },
];

/** Renders the page at the device's real width, scaled down to fit the available space. */
function ScaledFrame({ html, width }: { html: string; width: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = box.w ? Math.min(1, box.w / width) : 1;

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      {box.w > 0 && (
        <iframe
          title="UI preview"
          srcDoc={html}
          // Scripts only, no same-origin: the generated page can't read this app's storage, cookies or auth token
          sandbox="allow-scripts"
          className="absolute top-0 border-0 bg-white shadow-soft"
          style={{
            width,
            height: box.h / scale,
            left: Math.max(0, (box.w - width * scale) / 2),
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      )}
    </div>
  );
}

interface UiPreviewProps {
  html: string | null | undefined;
  generatedAt?: string | null;
  isLoading: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  /** False once the user has used this month's preview generations. */
  canGenerate?: boolean;
  /** e.g. "2 previews left this month" */
  allowanceLabel?: string;
}

export function UiPreview({
  html,
  generatedAt,
  isLoading,
  isGenerating,
  onGenerate,
  canGenerate = true,
  allowanceLabel,
}: UiPreviewProps) {
  const [device, setDevice] = useState<DeviceId>("desktop");
  const [expanded, setExpanded] = useState(false);
  const width = DEVICES.find((d) => d.id === device)!.width;

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const download = () => {
    if (!html) return;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "preview.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="h-[60vh] animate-pulse bg-elevated/60" />;
  }

  if (isGenerating) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <ThinkingStatus steps={PREVIEW_STEPS} note="Building a live page from your prompt. This usually takes about a minute." />
        </div>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-canvas/60">
          <Eye className="h-5 w-5 text-brand" />
        </div>
        <p className="font-medium text-fg">See what this prompt builds</p>
        <p className="max-w-sm text-sm text-fg-muted">
          We&apos;ll turn the prompt into a live page you can click through on desktop, tablet and mobile.
        </p>
        <Button className="mt-2" onClick={onGenerate} disabled={!canGenerate}>
          <Eye className="h-3.5 w-3.5" />
          Generate preview
        </Button>
        {allowanceLabel && (
          <p className={cn("text-xs", canGenerate ? "text-fg-subtle" : "text-red-400")}>
            {canGenerate ? `Uses 1 preview · ${allowanceLabel}` : "You've used this month's previews."}
          </p>
        )}
      </div>
    );
  }

  const viewer = (
    <div className={cn("flex flex-col", expanded ? "fixed inset-0 z-50 bg-canvas p-3 sm:p-4" : "h-[60vh]")}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div className="flex items-center gap-0.5 rounded-lg border border-line bg-canvas/60 p-0.5" role="group" aria-label="Device size">
          {DEVICES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDevice(id)}
              aria-pressed={device === id}
              title={label}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors",
                device === id ? "bg-elevated text-fg" : "text-fg-muted hover:text-fg"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", device === id && "text-brand")} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {generatedAt && (
            <span className="mr-1 hidden text-[11px] text-fg-subtle md:inline">
              Built {new Date(generatedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {allowanceLabel && (
            <span className={cn("mr-1 hidden text-[11px] sm:inline", canGenerate ? "text-fg-subtle" : "text-red-400")}>
              {canGenerate ? allowanceLabel : "No previews left"}
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5"
            onClick={onGenerate}
            disabled={!canGenerate}
            title={canGenerate ? "Build a new preview (uses 1 preview)" : "No previews left this month"}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Regenerate</span>
          </Button>
          <Button size="sm" variant="ghost" className="h-7 gap-1.5" onClick={download} title="Download as preview.html">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">.html</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Exit full screen (Esc)" : "Full screen"}
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 bg-canvas/60 p-3">
        <ScaledFrame html={html} width={width} />
      </div>

      <p className="border-t border-line px-3 py-1.5 text-[11px] text-fg-subtle">
        AI-generated approximation of what the prompt describes. Your coding agent&apos;s result will differ in the details.
      </p>
    </div>
  );

  // Full screen renders at the body so the animated message card's transform can't trap the fixed overlay
  return expanded ? (
    <>
      <div className="h-[60vh]" />
      {createPortal(viewer, document.body)}
    </>
  ) : (
    viewer
  );
}
