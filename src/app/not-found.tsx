import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, LayoutGrid, SearchX, Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found · PromptCraft AI",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-canvas text-fg">
      {/* Ambient background */}
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl animate-drift" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-brand-2/10 blur-3xl animate-drift-slow" />

      <header className="relative z-10 px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-glow">
            <Terminal className="h-4 w-4 text-brand-fg" />
          </div>
          <span className="font-semibold tracking-tight">PromptCraft</span>
        </Link>
      </header>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        <div className="animate-in fade-in zoom-in-95 duration-700">
          <div className="mx-auto mb-6 flex h-14 w-14 animate-float-y items-center justify-center rounded-2xl border border-line bg-surface shadow-lift">
            <SearchX className="h-6 w-6 text-brand" />
          </div>
          <p className="text-gradient select-none text-[7rem] font-bold leading-none tracking-tighter sm:text-[9rem]">
            404
          </p>
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight animate-in fade-in slide-in-from-bottom-3 duration-700 [animation-delay:150ms] [animation-fill-mode:both] sm:text-3xl">
          This page wandered off
        </h1>
        <p className="mt-3 max-w-md text-fg-muted animate-in fade-in slide-in-from-bottom-3 duration-700 [animation-delay:250ms] [animation-fill-mode:both]">
          The link may be broken, or the page may have been moved or deleted. Let&apos;s get you back on track.
        </p>

        {/* Fake terminal line for a bit of character */}
        <div className="mt-8 w-full max-w-sm rounded-xl border border-line bg-surface/80 px-4 py-3 text-left font-mono text-xs text-fg-muted shadow-soft backdrop-blur animate-in fade-in slide-in-from-bottom-3 duration-700 [animation-delay:350ms] [animation-fill-mode:both]">
          <span className="text-brand">$</span> find ./page <span className="text-fg-subtle">--exists</span>
          <br />
          <span className="text-red-400">error:</span> route not found
          <span className="animate-cursor-blink ml-0.5 text-brand">▍</span>
        </div>

        <div className="mt-8 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-3 duration-700 [animation-delay:450ms] [animation-fill-mode:both] sm:flex-row">
          <Link
            href="/"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 text-sm font-semibold text-brand-fg shadow-glow transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-medium text-fg transition-colors hover:border-line-strong hover:bg-elevated"
          >
            <LayoutGrid className="h-4 w-4" />
            Go to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
