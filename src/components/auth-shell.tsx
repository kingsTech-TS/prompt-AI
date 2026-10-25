"use client";

import Link from "next/link";
import { ArrowLeft, Check, Sparkles, Terminal } from "lucide-react";

// Fixed positions (not Math.random) so server and client render the same markup.
const STARS = Array.from({ length: 24 }, (_, i) => ({
  top: (i * 37 + 11) % 100,
  left: (i * 53 + 7) % 100,
  size: [2, 3, 2, 4][i % 4],
  delay: (i * 0.37) % 3,
}));

const PREVIEW_LINES = [
  "## Layout",
  "- Fixed 260px sidebar, fluid main column",
  "- 12-column grid, 24px gutters",
  "## Typography",
  "- Inter, 15px base, tight headings",
];

/**
 * Split-screen layout shared by the login and register pages:
 * an animated brand panel on the left (desktop only) and the form on the right.
 */
export function AuthShell({
  title,
  subtitle,
  heroTitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  heroTitle: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* ── Brand panel ───────────────────────────────────────── */}
      <aside className="relative hidden w-[52%] flex-col justify-between overflow-hidden bg-[#0b0718] p-12 text-white lg:flex">
        {/* Mesh gradient blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-violet-600/40 blur-3xl animate-drift" />
        <div className="pointer-events-none absolute -bottom-32 right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/25 blur-3xl animate-drift-slow" />
        <div className="pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl animate-drift" />
        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
          }}
        />
        {STARS.map((s, i) => (
          <span
            key={i}
            className="pointer-events-none absolute animate-pulse rounded-full bg-white/50"
            style={{ top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
          />
        ))}

        {/* Logo */}
        <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-700">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/30">
            <Terminal className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">PromptCraft</span>
        </Link>

        {/* Headline + floating preview */}
        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            AI prompt generator for builders
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:100ms] [animation-fill-mode:both] xl:text-5xl">
            {heroTitle}
          </h1>

          {/* Mock generated prompt, gently floating */}
          <div className="mt-10 animate-in fade-in zoom-in-95 duration-700 [animation-delay:250ms] [animation-fill-mode:both]">
            <div className="animate-float-y rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600">
                  <Sparkles className="h-3 w-3" />
                </span>
                <span className="text-xs font-medium text-white/80">Generated UI prompt</span>
                <span className="ml-auto rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">ready</span>
              </div>
              <div className="space-y-1.5 font-mono text-[12px]">
                {PREVIEW_LINES.map((line, i) => (
                  <p
                    key={i}
                    className={`animate-in fade-in slide-in-from-left-2 duration-500 [animation-fill-mode:both] ${
                      line.startsWith("##") ? "pt-1 text-violet-300" : "text-white/60"
                    }`}
                    style={{ animationDelay: `${600 + i * 180}ms` }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <ul className="mt-10 space-y-2.5 text-sm text-white/70">
            {["Website & screenshot analysis", "Idea → full build blueprint", "Copy or download as Markdown"].map((f, i) => (
              <li
                key={f}
                className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-3 duration-500 [animation-fill-mode:both]"
                style={{ animationDelay: `${900 + i * 120}ms` }}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                  <Check className="h-3 w-3 text-emerald-300" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/40">© {new Date().getFullYear()} PromptCraft</p>
      </aside>

      {/* ── Form panel ────────────────────────────────────────── */}
      <main className="ambient relative flex flex-1 flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-fg-muted transition-colors hover:bg-elevated hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Home
          </Link>
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
              <Terminal className="h-4 w-4 text-brand-fg" />
            </div>
            <span className="font-semibold text-fg">PromptCraft</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
              <h2 className="text-3xl font-semibold tracking-tight text-fg">{title}</h2>
              <p className="mt-2 text-sm text-fg-muted">{subtitle}</p>
            </div>

            <div className="mt-8 animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:100ms] [animation-fill-mode:both]">
              {children}
            </div>

            <div className="mt-8 text-center text-sm text-fg-muted animate-in fade-in duration-700 [animation-delay:300ms] [animation-fill-mode:both]">
              {footer}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
