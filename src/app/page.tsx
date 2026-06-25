"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Lightbulb,
  Link as LinkIcon,
  Image as ImageIcon,
  MessageSquare,
  FolderOpen,
  Palette,
  Shield,
  ArrowRight,
  Terminal,
  Zap,
  CheckCircle,
  Code2,
  Layers,
  Brain,
  Star,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────
function useIsLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("access_token"));
  }, []);
  return loggedIn;
}

// ── Sub-components ────────────────────────────────────────────────

function Navbar({ loggedIn }: { loggedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0d0d1a]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">PromptCraft</span>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Stack"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-violet-500/25"
            >
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-white/70 hover:text-white transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-violet-500/25"
              >
                Get Started Free
              </Link>
            </>
          )}
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
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden text-center px-6 pt-24 pb-20">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[#080814]" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-700/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-indigo-600/15 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Star field */}
      {[...Array(60)].map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${[1, 1.5, 2, 1, 2.5][i % 5]}px`,
            height: `${[1, 1.5, 2, 1, 2.5][i % 5]}px`,
            top: `${(i * 37 + 5) % 100}%`,
            left: `${(i * 61 + 7) % 100}%`,
            opacity: Math.random() * 0.5 + 0.1,
            animation: `pulse ${(i % 3) + 2}s ease-in-out infinite`,
            animationDelay: `${(i * 0.15) % 3}s`,
          }}
        />
      ))}

      {/* Badge */}
      <div className="relative z-10 opacity-start animate-fade-in-down mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-medium tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          AI-Powered Design Toolchain
        </span>
      </div>

      {/* Heading */}
      <h1 className="relative z-10 opacity-start animate-fade-in-up delay-200 text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.08] max-w-4xl mb-6">
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

      {/* Typewriter */}
      <p className="relative z-10 opacity-start animate-fade-in-up delay-300 text-white/60 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10 font-light min-h-[3.5rem]">
        {typedText}
        <span className="animate-cursor-blink text-violet-400">|</span>
      </p>

      {/* CTA Buttons */}
      <div className="relative z-10 opacity-start animate-fade-in-up delay-500 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={loggedIn ? "/dashboard" : "/register"}
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105"
        >
          <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          {loggedIn ? "Open Dashboard" : "Start for Free"}
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="#features"
          className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 font-semibold text-lg transition-all"
        >
          See Features
        </Link>
      </div>

      {/* Floating stat chips */}
      <div className="relative z-10 opacity-start animate-fade-in-up delay-700 flex flex-wrap justify-center gap-4 mt-14">
        {[
          { icon: "⚡", text: "Instant results" },
          { icon: "🎨", text: "URL & Image analysis" },
          { icon: "💬", text: "Chat & refine" },
          { icon: "🗂️", text: "Organized collections" },
        ].map((chip) => (
          <span
            key={chip.text}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm backdrop-blur-sm"
          >
            <span>{chip.icon}</span> {chip.text}
          </span>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs animate-float-y">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/30" />
        <span>scroll</span>
      </div>
    </section>
  );
}

function MockupSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden bg-[#080814]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-violet-500/50" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 opacity-start animate-fade-in-up">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Live Preview</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">See it in action</h2>
        </div>

        {/* Browser mockup */}
        <div className="relative opacity-start animate-scale-in delay-200">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 blur-2xl" />
          <div className="relative rounded-3xl border border-white/10 bg-[#0f0f1e] overflow-hidden shadow-2xl shadow-black/60 animate-glow-pulse">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 bg-white/[0.03]">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
              <div className="flex-1 mx-4 px-4 py-1 rounded-full bg-white/5 text-white/30 text-xs font-mono text-center">
                promptcraft.app/generate
              </div>
            </div>

            {/* App content */}
            <div className="flex h-[420px]">
              {/* Sidebar */}
              <div className="w-56 border-r border-white/10 bg-white/[0.02] p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                    <Terminal className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-white text-sm font-bold">PromptCraft</span>
                </div>
                <div className="px-3 py-2 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-medium flex items-center gap-2">
                  <Sparkles className="h-3 w-3" /> New Prompt
                </div>
                <div className="px-3 py-2 rounded-lg text-white/40 text-xs flex items-center gap-2 hover:bg-white/5">
                  <Lightbulb className="h-3 w-3 text-yellow-400/60" /> Idea Generator
                </div>
                <div className="px-3 py-2 rounded-lg text-white/40 text-xs flex items-center gap-2">
                  <FolderOpen className="h-3 w-3 text-blue-400/60" /> Collections
                </div>
                <div className="mt-4">
                  <p className="text-white/20 text-[10px] uppercase tracking-wider mb-2 px-1">Today</p>
                  {["E-commerce dashboard UI", "SaaS landing page", "Mobile app wireframe"].map((t) => (
                    <div key={t} className="px-3 py-2 rounded text-white/30 text-[11px] truncate hover:text-white/50">{t}</div>
                  ))}
                </div>
              </div>

              {/* Main panel */}
              <div className="flex-1 p-6 overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs">AI-Powered Analysis</div>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">Transform Your Design</h3>
                <p className="text-white/40 text-sm mb-6">Paste a URL or upload screenshots to generate developer-ready prompts</p>

                {/* Input area */}
                <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02] mb-4 hover:border-violet-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-4 w-4 text-white/30" />
                    <span className="text-white/20 text-sm font-mono">https://example.com/dashboard</span>
                  </div>
                </div>

                {/* Generated prompt preview */}
                <div className="border border-violet-500/20 rounded-xl p-4 bg-violet-500/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
                    <span className="text-violet-300 text-xs font-semibold">Generated Blueprint</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      "Build a responsive admin dashboard with a fixed sidebar...",
                      "Navigation: 280px width, dark bg (#1a1a2e), icon + label items...",
                      "Header: 64px height, search bar (60%), notification bell, avatar...",
                    ].map((line, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="text-violet-500/50 text-xs font-mono mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                        <p className="text-white/50 text-xs font-mono leading-relaxed">{line}</p>
                      </div>
                    ))}
                    <div className="flex gap-2 items-start">
                      <span className="text-violet-500/50 text-xs font-mono mt-0.5">04</span>
                      <p className="text-white/25 text-xs font-mono">
                        <span className="animate-cursor-blink text-violet-400">|</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <LinkIcon className="h-6 w-6" />,
      title: "URL Analyzer",
      desc: "Paste any live URL. Our AI scrapes and visually maps the full UI layout — spacing, typography, component hierarchies, and patterns.",
      color: "from-blue-500 to-cyan-500",
      glow: "blue",
    },
    {
      icon: <ImageIcon className="h-6 w-6" />,
      title: "Screenshot Analysis",
      desc: "Upload design screenshots or mockups. Vision AI evaluates visual layers, grid structures, colour relationships, and component anatomy.",
      color: "from-violet-500 to-purple-600",
      glow: "violet",
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Idea → Blueprint",
      desc: "Describe your app idea in plain English. Get phased roadmaps, database schemas, environment configs, and technology stack recommendations.",
      color: "from-yellow-500 to-orange-500",
      glow: "yellow",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Chat & Refine",
      desc: "Every prompt has a persistent AI chat session. Ask follow-up questions, request code snippets, and iterate on component details.",
      color: "from-green-500 to-emerald-500",
      glow: "green",
    },
    {
      icon: <FolderOpen className="h-6 w-6" />,
      title: "Collections",
      desc: "Organize blueprints into domain-tagged collections (frontend, backend, data). Create sub-collections for large project hierarchies.",
      color: "from-pink-500 to-rose-500",
      glow: "pink",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "10 Visual Themes",
      desc: "Switch instantly between 10 curated dark & light themes. Your aesthetic, your workflow — live-preview every change.",
      color: "from-indigo-500 to-violet-600",
      glow: "indigo",
    },
  ];

  const glowMap: Record<string, string> = {
    blue: "0 0 30px rgba(59,130,246,0.25)",
    violet: "0 0 30px rgba(139,92,246,0.25)",
    yellow: "0 0 30px rgba(234,179,8,0.25)",
    green: "0 0 30px rgba(16,185,129,0.25)",
    pink: "0 0 30px rgba(236,72,153,0.25)",
    indigo: "0 0 30px rgba(99,102,241,0.25)",
  };

  return (
    <section id="features" className="relative py-28 px-6 bg-[#080814]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#080814] via-[#0b0b1f] to-[#080814]" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20 opacity-start animate-fade-in-up">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Everything you need</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Built for developers,<br />designed for speed</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">Every feature designed to eliminate the gap between design thinking and production code.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative p-7 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 hover:scale-[1.02] cursor-default opacity-start animate-slide-in-card overflow-hidden"
              style={{
                animationDelay: `${i * 100}ms`,
                ["--hover-shadow" as string]: glowMap[f.glow],
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = glowMap[f.glow];
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              {/* Gradient shimmer on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.04) 0%, transparent 70%)" }} />

              <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${f.color} mb-5 shadow-lg`}>
                <div className="text-white">{f.icon}</div>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Choose Your Input",
      desc: "Select from a live URL, design screenshots, or describe your app idea in plain language. All three modes are fully supported.",
      icon: <Layers className="h-7 w-7" />,
    },
    {
      num: "02",
      title: "AI Processes & Analyzes",
      desc: "Our AI engine dissects the visual design or idea into structured data — components, layouts, typography, interactions, and technical requirements.",
      icon: <Brain className="h-7 w-7" />,
    },
    {
      num: "03",
      title: "Receive Your Blueprint",
      desc: "Get a comprehensive, developer-ready prompt covering every design decision, system architecture detail, and implementation specification.",
      icon: <Code2 className="h-7 w-7" />,
    },
    {
      num: "04",
      title: "Refine with Chat",
      desc: "Open the built-in chat session to ask follow-ups, request code samples, adjust architectural decisions, and iterate until perfect.",
      icon: <MessageSquare className="h-7 w-7" />,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[#07071a]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-violet-900/20 blur-3xl" />

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-20 opacity-start animate-fade-in-up">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple workflow</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">How it works</h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-[2.2rem] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-purple-500/30 to-transparent" />

          <div className="space-y-16">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`relative flex gap-8 items-start opacity-start animate-fade-in-${i % 2 === 0 ? "left" : "right"}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Step icon on the line */}
                <div className="relative flex-shrink-0 z-10">
                  <div className="w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-xl shadow-violet-500/30 text-white animate-glow-pulse">
                    {step.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#07071a] border-2 border-violet-500/50 flex items-center justify-center">
                    <span className="text-violet-400 text-[9px] font-black">{step.num}</span>
                  </div>
                </div>

                <div className="flex-1 pb-4">
                  <h3 className="text-white font-bold text-2xl mb-3">{step.title}</h3>
                  <p className="text-white/50 text-base leading-relaxed max-w-lg">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StackSection() {
  const tech = [
    { name: "Next.js 14", icon: "▲", color: "#ffffff" },
    { name: "TypeScript", icon: "TS", color: "#3178c6" },
    { name: "TanStack Query", icon: "⚛", color: "#ff4154" },
    { name: "Tailwind CSS", icon: "🌊", color: "#38bdf8" },
    { name: "FastAPI", icon: "⚡", color: "#009688" },
    { name: "Radix UI", icon: "◎", color: "#a855f7" },
    { name: "Cloudinary", icon: "☁", color: "#3448c5" },
    { name: "Lucide Icons", icon: "✦", color: "#f59e0b" },
  ];

  return (
    <section id="stack" className="relative py-28 px-6 bg-[#080814]">
      <div className="max-w-5xl mx-auto text-center">
        <div className="opacity-start animate-fade-in-up mb-16">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Powered by</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">Built on a world-class stack</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tech.map((t, i) => (
            <div
              key={t.name}
              className="group relative p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 hover:scale-105 hover:-translate-y-1 opacity-start animate-slide-in-card cursor-default"
              style={{ animationDelay: `${i * 80}ms` }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${t.color}40`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${t.color}20`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                className="text-3xl font-black mb-3 flex items-center justify-center h-10 transition-transform group-hover:scale-110"
                style={{ color: t.color, fontFamily: "monospace" }}
              >
                {t.icon}
              </div>
              <p className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "< 5s", label: "Average prompt generation time" },
    { value: "3", label: "Input modes supported" },
    { value: "10", label: "Visual themes available" },
    { value: "∞", label: "Possibilities unlocked" },
  ];

  return (
    <section className="relative py-20 px-6 border-y border-white/5 bg-[#07071a]">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="text-center opacity-start animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400 mb-2">{s.value}</p>
            <p className="text-white/40 text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-[#080814]">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-violet-700/25 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] rounded-full bg-purple-600/20 blur-2xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative max-w-3xl mx-auto text-center opacity-start animate-scale-in">
        <div className="inline-flex p-5 rounded-3xl bg-gradient-to-br from-violet-600/20 to-purple-700/20 border border-violet-500/20 mb-8">
          <Zap className="h-10 w-10 text-violet-400" />
        </div>
        <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
          Ready to supercharge<br />
          <span
            style={{
              background: "linear-gradient(90deg, #c084fc, #a855f7, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            your workflow?
          </span>
        </h2>
        <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
          Join developers who use PromptCraft to turn any design or idea into a precise, actionable development blueprint — in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={loggedIn ? "/dashboard" : "/register"}
            className="group flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-lg hover:brightness-110 transition-all shadow-2xl shadow-violet-500/30 hover:scale-105"
          >
            <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            {loggedIn ? "Go to Dashboard" : "Get Started — It's Free"}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-white/30 text-sm">
          <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-400/70" /> No credit card required</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-400/70" /> Free tier available</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-400/70" /> Instant access</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07071a] py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">PromptCraft</span>
          <span className="text-white/30 text-sm ml-2">© 2026</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/40">
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          <span className="flex items-center gap-1.5">
            <Star className="h-3 w-3 text-yellow-400" /> AI-Powered Design Toolchain
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── Main Export ────────────────────────────────────────────────────
export default function LandingPage() {
  const loggedIn = useIsLoggedIn();

  // Intersection observer for scroll-triggered reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-start");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    document.querySelectorAll(".opacity-start").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#080814] text-white overflow-x-hidden">
      <Navbar loggedIn={loggedIn} />
      <HeroSection loggedIn={loggedIn} />
      <StatsSection />
      <MockupSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StackSection />
      <CTASection loggedIn={loggedIn} />
      <Footer />
    </div>
  );
}
