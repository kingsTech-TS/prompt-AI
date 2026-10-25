"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Lightbulb,
  Link as LinkIcon,
  Image as ImageIcon,
  MessageSquare,
  FolderOpen,
  Palette,
  ArrowRight,
  Terminal,
  Zap,
  CheckCircle,
  Code2,
  Layers,
  Brain,
  Download,
  ClipboardCopy,
  Menu,
  X,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────
function useIsLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("access_token"));
  }, []);
  return loggedIn;
}

/** Counts up from 0 to `to` the first time it scrolls into view. */
function CountUp({ to, duration = 1200 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setValue(Math.round(to * (1 - Math.pow(1 - t, 3)))); // ease-out cubic
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, duration]);

  return <span ref={ref}>{value}</span>;
}

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Use it anywhere", href: "#use-anywhere" },
];

// Fixed positions (not Math.random) so server and client render identical markup.
const STARS = Array.from({ length: 60 }, (_, i) => ({
  size: [1, 1.5, 2, 1, 2.5][i % 5],
  top: (i * 37 + 5) % 100,
  left: (i * 61 + 7) % 100,
  opacity: 0.1 + ((i * 29) % 50) / 100,
  duration: (i % 3) + 2,
  delay: (i * 0.15) % 3,
}));

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-16 text-center">
      <Reveal variant="blur">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">{eyebrow}</p>
      </Reveal>
      <Reveal delay={100}>
        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={200}>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}

// ── Sections ─────────────────────────────────────────────────────

function Navbar({ loggedIn }: { loggedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors animate-in fade-in slide-in-from-top-4 duration-700",
        scrolled || open
          ? "border-b border-white/10 bg-[#0d0d1a]/80 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-500/30 transition-transform group-hover:rotate-6 group-hover:scale-105">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">PromptCraft</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-sm text-white/60 transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-violet-400 after:transition-transform hover:text-white hover:after:scale-x-100"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:brightness-110"
            >
              Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden px-3 py-2 text-sm text-white/70 transition-colors hover:text-white sm:block">
                Sign in
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:brightness-110"
              >
                Get started
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("grid transition-all duration-300 md:hidden", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <nav className="flex flex-col gap-1 px-6 pb-4">
            {NAV_LINKS.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
                {item.label}
              </a>
            ))}
            {!loggedIn && (
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function HeroSection({ loggedIn }: { loggedIn: boolean }) {
  const [typedText, setTypedText] = useState("");
  const fullText = "Generate precise UI/UX blueprints\nfrom any design or idea — instantly.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 28);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-24 text-center">
      <div className="absolute inset-0 bg-[#080814]" />
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-violet-700/20 blur-3xl animate-drift" />
        <div className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl animate-drift-slow" />
        <div className="absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl animate-drift" />
      </div>

      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${s.size}px`,
            height: `${s.size}px`,
            top: `${s.top}%`,
            left: `${s.left}%`,
            opacity: s.opacity,
            animation: `pulse ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

     
      <Reveal delay={150} className="relative z-10">
        <h1 className="mb-6 max-w-4xl text-5xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
          From{" "}
          <span
            className="animate-gradient-shift"
            style={{
              background: "linear-gradient(90deg, #c084fc, #a855f7, #7c3aed, #8b5cf6, #c084fc)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Design
          </span>{" "}
          to{" "}
          <span
            className="animate-gradient-shift"
            style={{
              background: "linear-gradient(90deg, #fb923c, #f97316, #fbbf24, #fb923c)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animationDelay: "1.5s",
            }}
          >
            Blueprint
          </span>{" "}
          in Seconds
        </h1>
      </Reveal>

      <Reveal delay={250} className="relative z-10">
        <p className="mb-10 min-h-[3.5rem] max-w-2xl whitespace-pre-line text-lg font-light leading-relaxed text-white/60 sm:text-xl">
          {typedText}
          <span className="animate-cursor-blink text-violet-400">|</span>
        </p>
      </Reveal>

      <Reveal delay={350} className="relative z-10 flex flex-col justify-center gap-4 sm:flex-row">
        <Link
          href={loggedIn ? "/dashboard" : "/register"}
          className="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-violet-500/30 transition-all hover:scale-105 hover:shadow-violet-500/50 hover:brightness-110"
        >
          <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
          {loggedIn ? "Open Dashboard" : "Start for Free"}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
        <a
          href="#how-it-works"
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-lg font-semibold text-white/80 transition-all hover:border-white/40 hover:bg-white/5 hover:text-white"
        >
          See how it works
        </a>
      </Reveal>

      <div className="relative z-10 mt-14 flex flex-wrap justify-center gap-3">
        {[
          { icon: Zap, text: "Instant results" },
          { icon: ImageIcon, text: "URL & image analysis" },
          { icon: MessageSquare, text: "Chat & refine" },
          { icon: Download, text: "Markdown export" },
        ].map((chip, i) => (
          <Reveal key={chip.text} variant="scale" delay={500 + i * 90}>
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur-sm transition-colors hover:border-violet-400/40 hover:text-white">
              <chip.icon className="h-3.5 w-3.5 text-violet-300" /> {chip.text}
            </span>
          </Reveal>
        ))}
      </div>

      <a
        href="#stats"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs text-white/30 transition-colors hover:text-white/60 animate-float-y"
      >
        <div className="h-8 w-px bg-gradient-to-b from-transparent to-white/30" />
        <span>scroll</span>
      </a>
    </section>
  );
}

function StatsSection() {
  const stats: { value: React.ReactNode; label: string }[] = [
    { value: <CountUp to={3} />, label: "Ways to start: URL, screenshots or an idea" },
    { value: <CountUp to={15} />, label: "Build steps in every idea blueprint" },
    { value: <CountUp to={10} />, label: "Dark & light themes" },
    { value: ".md", label: "One-click Markdown export" },
  ];

  return (
    <section id="stats" className="relative border-y border-white/5 bg-[#07071a] px-6 py-20">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 100} className="text-center">
            <p className="mb-2 bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-4xl font-black tabular-nums text-transparent sm:text-5xl">
              {s.value}
            </p>
            <p className="mx-auto max-w-[12rem] text-sm text-white/40">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function MockupSection() {
  const lines = [
    "Build a responsive admin dashboard with a fixed sidebar...",
    "Navigation: 280px width, dark surface, icon + label items...",
    "Header: 64px height, search bar (60%), notifications, avatar...",
  ];

  return (
    <section className="relative overflow-hidden bg-[#080814] px-6 py-24">
      <div className="absolute left-1/2 top-0 h-32 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-violet-500/50" />

      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Live preview" title="See it in action" />

        <Reveal variant="scale" delay={150} className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 blur-2xl animate-drift-slow" />
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f1e] shadow-2xl shadow-black/60">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-5 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
              <div className="h-3 w-3 rounded-full bg-green-400/80" />
              <div className="mx-4 flex-1 rounded-full bg-white/5 px-4 py-1 text-center font-mono text-xs text-white/30">
                promptcraft.app/generate
              </div>
            </div>

            <div className="flex h-[420px]">
              {/* Sidebar */}
              <div className="hidden w-56 flex-col gap-3 border-r border-white/10 bg-white/[0.02] p-4 sm:flex">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-700">
                    <Terminal className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white">PromptCraft</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/20 px-3 py-2 text-xs font-medium text-violet-300">
                  <Sparkles className="h-3 w-3" /> New Prompt
                </div>
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/40">
                  <Lightbulb className="h-3 w-3 text-yellow-400/60" /> Idea Generator
                </div>
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/40">
                  <FolderOpen className="h-3 w-3 text-blue-400/60" /> Collections
                </div>
                <div className="mt-4">
                  <p className="mb-2 px-1 text-[10px] uppercase tracking-wider text-white/20">Today</p>
                  {["E-commerce dashboard UI", "SaaS landing page", "Mobile app wireframe"].map((t) => (
                    <div key={t} className="truncate rounded px-3 py-2 text-[11px] text-white/30">{t}</div>
                  ))}
                </div>
              </div>

              {/* Main panel */}
              <div className="flex-1 overflow-hidden p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs text-violet-300">AI-Powered Analysis</div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Transform Your Design</h3>
                <p className="mb-6 text-sm text-white/40">Paste a URL or upload screenshots to generate developer-ready prompts</p>

                <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-4 w-4 text-white/30" />
                    <span className="font-mono text-sm text-white/20">https://example.com/dashboard</span>
                  </div>
                </div>

                {/* Generated prompt: lines "type" in once the mockup is visible */}
                <Reveal variant="up" delay={400} className="relative overflow-hidden rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse text-violet-400" />
                    <span className="text-xs font-semibold text-violet-300">Generated Blueprint</span>
                  </div>
                  <div className="space-y-1.5">
                    {lines.map((line, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 font-mono text-xs text-violet-500/50">{String(i + 1).padStart(2, "0")}</span>
                        <p
                          className="animate-type-line font-mono text-xs leading-relaxed text-white/50"
                          style={{ animationDelay: `${700 + i * 1000}ms` }}
                        >
                          {line}
                        </p>
                      </div>
                    ))}
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 font-mono text-xs text-violet-500/50">04</span>
                      <span className="animate-cursor-blink text-xs text-violet-400">|</span>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: LinkIcon,
      title: "URL Analyzer",
      desc: "Paste any live URL. The AI maps the full UI layout: spacing, typography, component hierarchy and patterns.",
      color: "from-blue-500 to-cyan-500",
      glow: "hover:shadow-[0_0_40px_-8px_rgba(59,130,246,0.45)]",
    },
    {
      icon: ImageIcon,
      title: "Screenshot Analysis",
      desc: "Upload screenshots or mockups. Vision AI reads visual layers, grid structure, color relationships and component anatomy.",
      color: "from-violet-500 to-purple-600",
      glow: "hover:shadow-[0_0_40px_-8px_rgba(139,92,246,0.45)]",
    },
    {
      icon: Lightbulb,
      title: "Idea → Blueprint",
      desc: "Describe your app in plain English. Get phased roadmaps, database schemas, environment configs and stack recommendations.",
      color: "from-yellow-500 to-orange-500",
      glow: "hover:shadow-[0_0_40px_-8px_rgba(234,179,8,0.45)]",
    },
    {
      icon: MessageSquare,
      title: "Chat & Refine",
      desc: "Every prompt has its own AI chat. Ask follow-ups, convert to a framework, and iterate on component details.",
      color: "from-green-500 to-emerald-500",
      glow: "hover:shadow-[0_0_40px_-8px_rgba(16,185,129,0.45)]",
    },
    {
      icon: FolderOpen,
      title: "Collections",
      desc: "Save reusable tech stacks and combine them into multi-stack groups to tailor every blueprint.",
      color: "from-pink-500 to-rose-500",
      glow: "hover:shadow-[0_0_40px_-8px_rgba(236,72,153,0.45)]",
    },
    {
      icon: Palette,
      title: "10 Visual Themes",
      desc: "Switch instantly between 10 curated dark and light themes. Your workspace, your look.",
      color: "from-indigo-500 to-violet-600",
      glow: "hover:shadow-[0_0_40px_-8px_rgba(99,102,241,0.45)]",
    },
  ];

  return (
    <section id="features" className="relative scroll-mt-16 bg-[#080814] px-6 py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-[#080814] via-[#0b0b1f] to-[#080814]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Everything you need"
          title={<>Built for developers,<br />designed for speed</>}
          subtitle="Every feature closes the gap between design thinking and production code."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 120 + Math.floor(i / 3) * 80}>
              <div
                className={cn(
                  "group relative h-full cursor-default overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]",
                  f.glow
                )}
              >
                <div className="absolute inset-0 rounded-3xl bg-[linear-gradient(135deg,rgba(139,92,246,0.06)_0%,transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className={`relative mb-5 inline-flex rounded-2xl bg-gradient-to-br p-3 shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 ${f.color}`}>
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="relative mb-3 text-xl font-bold text-white">{f.title}</h3>
                <p className="relative text-sm leading-relaxed text-white/50">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      title: "Choose your input",
      desc: "Paste a live URL, drop design screenshots, or describe your app idea in plain language.",
      icon: Layers,
    },
    {
      title: "AI analyzes it",
      desc: "Layout, components, typography, interactions and technical requirements are broken down into structure.",
      icon: Brain,
    },
    {
      title: "Get your blueprint",
      desc: "A detailed, developer-ready prompt covering every design decision and implementation detail.",
      icon: Code2,
    },
    {
      title: "Refine & export",
      desc: "Iterate in the built-in chat, then copy it or download it as prompt.md.",
      icon: MessageSquare,
    },
  ];

  return (
    <section id="how-it-works" className="relative scroll-mt-16 overflow-hidden px-6 py-28">
      <div className="absolute inset-0 bg-[#07071a]" />
      <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-violet-900/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <SectionHeading eyebrow="Simple workflow" title="How it works" subtitle="Four steps from inspiration to a prompt your AI tools can build from." />

        <Reveal variant="blur" className="relative">
          {/* Connector: horizontal on desktop (through the step nodes), vertical on mobile */}
          <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px overflow-hidden lg:block">
            <div className="animate-line-x h-full w-full bg-gradient-to-r from-violet-500/60 via-purple-400/40 to-fuchsia-500/60" />
          </div>
          <div className="absolute bottom-7 left-7 top-7 w-px overflow-hidden lg:hidden">
            <div className="animate-line-y h-full w-full bg-gradient-to-b from-violet-500/60 via-purple-400/40 to-transparent" />
          </div>

          <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={200 + i * 150} className="group flex gap-5 lg:flex-col lg:items-center lg:text-center">
                <div className="relative flex-shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-xl shadow-violet-500/30 ring-8 ring-[#07071a] transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-violet-400/50 bg-[#07071a] text-[10px] font-bold text-violet-300">
                    {i + 1}
                  </span>
                </div>
                <div className="pt-1 lg:pt-2">
                  <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50 lg:mx-auto lg:max-w-[15rem]">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

function UseAnywhereSection() {
  const tools = ["v0", "Cursor", "Bolt", "Lovable", "Claude", "ChatGPT", "Windsurf", "GitHub Copilot", "Replit", "Gemini"];
  // Duplicated so the marquee loops seamlessly at -50%
  const row = [...tools, ...tools];

  return (
    <section id="use-anywhere" className="relative scroll-mt-16 overflow-hidden bg-[#080814] px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Use it anywhere"
          title="Paste into the AI tools you already use"
          subtitle="Every prompt is clean Markdown. Copy it in one click or download prompt.md and drop it into any AI builder or chat."
        />

        <Reveal variant="blur" delay={100} className="marquee-mask space-y-4">
          {[false, true].map((reverse) => (
            <div key={String(reverse)} className="flex overflow-hidden">
              <div
                className="flex w-max animate-marquee gap-4 pr-4 hover:[animation-play-state:paused]"
                style={reverse ? { animationDirection: "reverse", animationDuration: "40s" } : undefined}
              >
                {row.map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="flex items-center gap-2 whitespace-nowrap rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/70 transition-colors hover:border-violet-400/40 hover:text-white"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </Reveal>

        {/* What the export looks like */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
          <Reveal variant="left" delay={150}>
            <div className="h-full rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                  <ClipboardCopy className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white">Copy as Markdown</h3>
              </div>
              <p className="text-sm leading-relaxed text-white/50">
                Headings, lists, tables and code blocks stay intact, so your AI tool gets the full structure.
              </p>
            </div>
          </Reveal>
          <Reveal variant="right" delay={250}>
            <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300">
                  <Download className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
                </div>
                <h3 className="font-semibold text-white">Download prompt.md</h3>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-[11px] leading-5 text-white/50">
                <p className="text-violet-300"># Dark Analytics Dashboard</p>
                <p>| Field  | Value          |</p>
                <p>| ------ | -------------- |</p>
                <p>| Source | Website URL    |</p>
                <p className="mt-2 text-violet-300">## Layout</p>
                <p>- Fixed sidebar, fluid content…</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CTASection({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="relative overflow-hidden bg-[#080814] px-6 py-32">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/25 blur-3xl animate-pulse" />
        <div className="absolute left-1/2 top-1/2 h-[250px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/20 blur-2xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal variant="scale">
          <div className="mb-8 inline-flex animate-float-y rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/20 to-purple-700/20 p-5">
            <Zap className="h-10 w-10 text-violet-400" />
          </div>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mb-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
            Ready to supercharge
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">your workflow?</span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mx-auto mb-10 max-w-xl text-lg text-white/50">
            Turn any design or idea into a precise, actionable development blueprint in seconds.
          </p>
        </Reveal>

        <Reveal delay={300} variant="scale" className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href={loggedIn ? "/dashboard" : "/register"}
            className="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-violet-500/30 transition-all hover:scale-105 hover:brightness-110"
          >
            <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
            {loggedIn ? "Go to Dashboard" : "Get Started — It's Free"}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/30">
          {["No credit card required", "Free tier available", "Instant access"].map((t, i) => (
            <Reveal key={t} delay={400 + i * 100}>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-400/70" /> {t}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07071a] px-6 py-10">
      <Reveal variant="blur" className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-700">
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">PromptCraft</span>
          <span className="ml-2 text-sm text-white/30">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/40">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hidden transition-colors hover:text-white sm:block">
              {l.label}
            </a>
          ))}
          <Link href="/login" className="transition-colors hover:text-white">Sign in</Link>
          <Link href="/register" className="transition-colors hover:text-white">Register</Link>
        </div>
      </Reveal>
    </footer>
  );
}

// ── Main Export ────────────────────────────────────────────────────
export default function LandingPage() {
  const loggedIn = useIsLoggedIn();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#080814] text-white">
      <Navbar loggedIn={loggedIn} />
      <HeroSection loggedIn={loggedIn} />
      <StatsSection />
      <MockupSection />
      <FeaturesSection />
      <HowItWorksSection />
      <UseAnywhereSection />
      <CTASection loggedIn={loggedIn} />
      <Footer />
    </div>
  );
}
