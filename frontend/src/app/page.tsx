"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ChevronRight,
  Cpu,
  Globe,
  Map,
  Navigation,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

type HazardDot = {
  label: string;
  color: string;
  position: string;
  delay: number;
};

type StatItem = {
  label: string;
  value: number;
  suffix: string;
  icon: typeof AlertTriangle;
  tone: string;
};

type FeatureItem = {
  title: string;
  description: string;
  href: string;
  icon: typeof Map;
  tone: string;
  glow: string;
};

const tickerItems = [
  "🔴 Pothole · MG Road",
  "🟡 Manhole · Koramangala",
  "🔵 Crack · Indiranagar",
  "🟠 Waterlogging · HSR Layout",
  "🔴 Pothole · Whitefield",
  "🟡 Manhole · Silk Board",
];

const hazardDots: HazardDot[] = [
  { label: "Pothole", color: "#ef4444", position: "top-[16%] left-[12%]", delay: 0 },
  { label: "Manhole", color: "#f59e0b", position: "top-[26%] right-[16%]", delay: 0.4 },
  { label: "Crack", color: "#63b3ed", position: "top-[48%] left-[8%]", delay: 0.8 },
  { label: "Pothole", color: "#ef4444", position: "bottom-[28%] right-[11%]", delay: 1.1 },
  { label: "Crack", color: "#63b3ed", position: "bottom-[14%] left-[22%]", delay: 1.5 },
];

const stats: StatItem[] = [
  { label: "Hazards mapped", value: 2847, suffix: "+", icon: AlertTriangle, tone: "emerald" },
  { label: "Route accuracy", value: 94, suffix: "%", icon: Navigation, tone: "cyan" },
  { label: "Users protected", value: 18, suffix: "K+", icon: Users, tone: "emerald" },
  { label: "Uptime", value: 99, suffix: "%", icon: TrendingUp, tone: "cyan" },
];

const features: FeatureItem[] = [
  {
    title: "Live Hazard Map",
    description: "Inspect potholes, manholes, and cracks across the city in real time.",
    href: "/map",
    icon: Map,
    tone: "emerald",
    glow: "rgba(16,185,129,0.28)",
  },
  {
    title: "Stress-Score Routing",
    description: "Balance travel time with road quality so the safest route wins.",
    href: "/map",
    icon: Shield,
    tone: "cyan",
    glow: "rgba(6,182,212,0.28)",
  },
  {
    title: "City Dashboard",
    description: "Track zone risk, volume spikes, and system health from one command view.",
    href: "/dashboard",
    icon: BarChart3,
    tone: "violet",
    glow: "rgba(139,92,246,0.28)",
  },
  {
    title: "Community Reporting",
    description: "Turn citizen reports into verified map intelligence in under a minute.",
    href: "/reports",
    icon: Zap,
    tone: "amber",
    glow: "rgba(245,158,11,0.28)",
  },
  {
    title: "AI Intelligence Layer",
    description: "Prioritize hazards and surface network-level patterns before commuters feel them.",
    href: "/dashboard",
    icon: Cpu,
    tone: "pink",
    glow: "rgba(236,72,153,0.28)",
  },
];

const steps = [
  {
    id: "01",
    title: "Capture city signals",
    description: "Live reports and route activity create a constantly updating picture of road conditions.",
  },
  {
    id: "02",
    title: "Classify the hazard",
    description: "Severity and type are normalized so route decisions stay consistent across the network.",
  },
  {
    id: "03",
    title: "Score commuter stress",
    description: "CityZen translates road friction into route-level risk and confidence signals.",
  },
  {
    id: "04",
    title: "Route with confidence",
    description: "Drivers get the safest available option, not just the shortest line on the map.",
  },
];

const routeRows = [
  {
    title: "Route A — Safest",
    badge: "Low stress",
    badgeClass: "bg-emerald-500/14 text-emerald-300 border-emerald-400/20",
    width: "28%",
    meta: "22 min · 8.4 km · 2 hazards",
  },
  {
    title: "Route B — Moderate",
    badge: "Medium stress",
    badgeClass: "bg-amber-500/14 text-amber-300 border-amber-400/20",
    width: "58%",
    meta: "19 min · 7.9 km · 5 hazards",
  },
  {
    title: "Route C — Shortest",
    badge: "High risk",
    badgeClass: "bg-red-500/14 text-red-300 border-red-400/20",
    width: "86%",
    meta: "16 min · 7.1 km · 9 hazards",
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toneClasses(tone: string) {
  switch (tone) {
    case "emerald":
      return {
        pill: "bg-emerald-500/14 border-emerald-400/20 text-emerald-300",
        text: "text-emerald-300",
        line: "from-emerald-400/90 to-emerald-400/0",
      };
    case "cyan":
      return {
        pill: "bg-cyan-500/14 border-cyan-400/20 text-cyan-300",
        text: "text-cyan-300",
        line: "from-cyan-400/90 to-cyan-400/0",
      };
    case "violet":
      return {
        pill: "bg-violet-500/14 border-violet-400/20 text-violet-300",
        text: "text-violet-300",
        line: "from-violet-400/90 to-violet-400/0",
      };
    case "amber":
      return {
        pill: "bg-amber-500/14 border-amber-400/20 text-amber-300",
        text: "text-amber-300",
        line: "from-amber-400/90 to-amber-400/0",
      };
    case "pink":
      return {
        pill: "bg-pink-500/14 border-pink-400/20 text-pink-300",
        text: "text-pink-300",
        line: "from-pink-400/90 to-pink-400/0",
      };
    default:
      return {
        pill: "bg-white/6 border-white/10 text-white",
        text: "text-white",
        line: "from-white/80 to-white/0",
      };
  }
}

function useAnimatedCount(target: number, isActive: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let frame = 0;
    const totalFrames = 60;
    const interval = window.setInterval(() => {
      frame += 1;
      const next = Math.round((target * frame) / totalFrames);
      setCount(next);
      if (frame >= totalFrames) {
        window.clearInterval(interval);
      }
    }, 16);

    return () => window.clearInterval(interval);
  }, [isActive, target]);

  return count;
}

function CountCard({ stat, index }: { stat: StatItem; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const count = useAnimatedCount(stat.value, inView);
  const tone = toneClasses(stat.tone);
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="glass-card group relative overflow-hidden rounded-[28px] p-6"
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className={cn("mb-5 inline-flex rounded-2xl border px-3 py-3", tone.pill)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-display text-4xl tracking-tight text-white">
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <p className="mt-2 text-sm text-white/52">{stat.label}</p>
    </motion.div>
  );
}

function FeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const tone = toneClasses(feature.tone);
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.015 }}
      className="group relative"
    >
      <Link
        href={feature.href}
        className="glass-card relative flex h-full flex-col overflow-hidden rounded-[28px] p-7"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: feature.glow }}
        />
        <div className={cn("mb-6 inline-flex w-fit rounded-2xl border px-3 py-3 transition-transform duration-300 group-hover:rotate-6", tone.pill)}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-display text-2xl tracking-tight text-white">{feature.title}</h3>
        <p className="mt-3 max-w-sm text-sm leading-6 text-white/58">{feature.description}</p>
        <div className={cn("mt-6 inline-flex items-center gap-2 text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100", tone.text)}>
          <span>Explore</span>
          <ChevronRight className="h-4 w-4" />
        </div>
        <div className={cn("mt-6 h-px w-0 bg-gradient-to-r transition-all duration-300 group-hover:w-full", tone.line)} />
      </Link>
    </motion.div>
  );
}

function NoiseOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.09]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(false);
  const routeCardRef = useRef<HTMLDivElement | null>(null);
  const routeCardInView = useInView(routeCardRef, { once: true, margin: "-80px" });
  const stepsRef = useRef<HTMLDivElement | null>(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 60]);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (window.innerWidth < 768) return;
      setCursor({ x: event.clientX, y: event.clientY });
      setShowCursor(true);
    };

    const hideCursor = () => setShowCursor(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", hideCursor);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", hideCursor);
    };
  }, []);

  const tickerLoop = useMemo(() => [...tickerItems, ...tickerItems], []);

  return (
    <main className="overflow-hidden bg-[#050505] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_26%),radial-gradient(circle_at_80%_24%,rgba(6,182,212,0.1),transparent_24%),linear-gradient(180deg,#050505_0%,#050505_100%)]" />
      <NoiseOverlay />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(circle_at_center,black,transparent_86%)] opacity-30" />

      <motion.div
        className="pointer-events-none fixed z-10 hidden h-48 w-48 rounded-full bg-emerald-500/18 blur-3xl md:block"
        animate={{
          x: cursor.x - 96,
          y: cursor.y - 96,
          opacity: showCursor ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.6 }}
      />

      <section ref={heroRef} className="relative px-6 pb-24 pt-32 md:px-10 md:pt-36">
        <motion.div style={{ y: parallaxY }} className="absolute inset-0 -z-10">
          <motion.div
            style={{ rotate: ringRotate }}
            className="absolute left-1/2 top-28 h-[620px] w-[620px] -translate-x-1/2 rounded-full border border-white/6"
          />
          <motion.div
            style={{ rotate: useTransform(ringRotate, (value) => value * -1.25) }}
            className="absolute left-1/2 top-20 h-[720px] w-[720px] -translate-x-1/2 rounded-full border border-white/5"
          />
          <motion.div
            style={{ rotate: useTransform(ringRotate, (value) => value * 0.7) }}
            className="absolute left-1/2 top-10 h-[840px] w-[840px] -translate-x-1/2 rounded-full border border-white/[0.045]"
          />
          <motion.div
            style={{ rotate: useTransform(ringRotate, (value) => value * -0.4) }}
            className="absolute left-1/2 top-2 h-[960px] w-[960px] -translate-x-1/2 rounded-full border border-white/[0.04]"
          />
        </motion.div>

        {hazardDots.map((dot) => (
          <motion.div
            key={`${dot.label}-${dot.position}`}
            className={cn("pointer-events-none absolute hidden md:block", dot.position)}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, delay: dot.delay }}
          >
            <div
              className="h-3 w-3 rounded-full shadow-[0_0_18px_currentColor]"
              style={{ backgroundColor: dot.color, color: dot.color }}
            />
            <div className="mt-3 text-xs uppercase tracking-[0.22em] text-white/35">{dot.label}</div>
          </motion.div>
        ))}

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span>🟢 Live · Bangalore Road Safety Platform</span>
          </motion.div>

          <div className="mt-10 grid items-end gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="font-display text-[3.6rem] leading-[0.95] tracking-[-0.05em] text-white sm:text-[5.1rem] md:text-[6.4rem]"
              >
                Navigate{" "}
                <span className="relative inline-block">
                  roads
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
                    className="absolute bottom-1 left-0 h-[0.2em] w-full origin-left rounded-full bg-emerald-400/85"
                  />
                </span>{" "}
                <span className="text-white/38">stress-free.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12 }}
                className="mt-8 max-w-2xl text-lg leading-8 text-white/58"
              >
                CityZen turns live hazard intelligence into calmer urban movement, guiding commuters away from friction before the road pushes back.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/map"
                    className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-emerald-500 px-6 py-4 font-medium text-black shadow-[0_18px_60px_rgba(16,185,129,0.28)]"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.28),transparent)] transition-transform duration-500 group-hover:translate-x-full" />
                    <span>Find Safe Route</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/map"
                    className="group inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-4 font-medium text-white/82 backdrop-blur-md"
                  >
                    <span>View Live Map</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              className="glass-card relative overflow-hidden rounded-[32px] p-6"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.12),transparent_36%)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/48">
                  <Activity className="h-3.5 w-3.5 text-emerald-300" />
                  Live routing posture
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
                    <p className="text-sm text-white/48">Safest route confidence</p>
                    <div className="mt-4 font-mono text-4xl text-white">94%</div>
                    <div className="mt-4 h-2 rounded-full bg-white/8">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "94%" }}
                        transition={{ duration: 0.9, delay: 0.4 }}
                        className="h-2 rounded-full bg-emerald-400"
                      />
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
                    <p className="text-sm text-white/48">Active zones monitored</p>
                    <div className="mt-4 font-mono text-4xl text-white">128</div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-cyan-300">
                      <Globe className="h-4 w-4" />
                      Bengaluru network live
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-3xl border border-white/8 bg-black/20 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/48">Hazard load this hour</p>
                      <div className="mt-2 font-display text-3xl text-white">2,847 reports indexed</div>
                    </div>
                    <div className="rounded-2xl border border-cyan-400/18 bg-cyan-500/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-300">
                      +12%
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-16 overflow-hidden rounded-full border border-white/8 bg-white/[0.02] py-3">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="flex w-max gap-10 whitespace-nowrap px-6 text-sm text-white/55"
            >
              {tickerLoop.map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY }}
            className="mt-12 flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-white/38"
          >
            <span>Scroll</span>
            <ArrowRight className="h-4 w-4 rotate-90" />
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <CountCard key={stat.label} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.32em] text-white/38">Platform capabilities</p>
            <h2 className="mt-4 font-display text-4xl tracking-[-0.04em] text-white md:text-5xl">
              Enterprise-grade road safety intelligence without changing your workflow.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-6">
            {features.map((feature, index) => (
              <div key={feature.title} className={index < 3 ? "lg:col-span-2" : index === 3 ? "lg:col-span-3" : "lg:col-span-3"}>
                <FeatureCard feature={feature} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div ref={stepsRef}>
            <p className="text-sm uppercase tracking-[0.32em] text-white/38">How it works</p>
            <h2 className="mt-4 font-display text-4xl tracking-[-0.04em] text-white md:text-5xl">
              Road friction becomes a decision system, not a guess.
            </h2>
            <div className="mt-10 space-y-6">
              {steps.map((step, index) => {
                const tone = ["emerald", "cyan", "amber", "violet"][index] ?? "emerald";
                const toneStyle = toneClasses(tone);
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={stepsInView ? { opacity: 1, y: 0 } : undefined}
                    transition={{ duration: 0.6, delay: index * 0.08 }}
                    className="flex gap-4"
                  >
                    <div className={cn("mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-mono", toneStyle.pill)}>
                      {step.id}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl tracking-tight text-white">{step.title}</h3>
                      <p className="mt-2 max-w-xl text-sm leading-7 text-white/55">{step.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            ref={routeCardRef}
            initial={{ opacity: 0, y: 20 }}
            animate={routeCardInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7 }}
            className="glass-card rounded-[32px] p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-white/38">Route comparison</p>
                <h3 className="mt-3 font-display text-3xl tracking-tight text-white">
                  See the tradeoff before you drive into it.
                </h3>
              </div>
              <Navigation className="h-6 w-6 text-emerald-300" />
            </div>

            <div className="mt-10 space-y-5">
              {routeRows.map((route, index) => (
                <div key={route.title} className="rounded-3xl border border-white/8 bg-black/20 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-display text-2xl tracking-tight text-white">{route.title}</div>
                      <div className="mt-1 text-sm text-white/46">{route.meta}</div>
                    </div>
                    <div className={cn("w-fit rounded-full border px-3 py-1 text-xs uppercase tracking-[0.22em]", route.badgeClass)}>
                      {route.badge}
                    </div>
                  </div>
                  <div className="mt-4 h-2.5 rounded-full bg-white/8">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={routeCardInView ? { width: route.width } : undefined}
                      transition={{ duration: 0.9, delay: 0.15 + index * 0.1, ease: "easeOut" }}
                      className={cn(
                        "h-2.5 rounded-full",
                        index === 0 && "bg-emerald-400",
                        index === 1 && "bg-amber-400",
                        index === 2 && "bg-red-400"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/map"
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-5 py-3 font-medium text-black"
            >
              <span>Navigate safest route</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="glass-card relative overflow-hidden rounded-[32px] px-8 py-12 md:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.1),transparent_22%)]" />
            <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.3em] text-white/38">Start now</p>
                <h2 className="mt-4 font-display text-4xl tracking-[-0.04em] text-white md:text-5xl">
                  Safer roads start with better data
                </h2>
                <p className="mt-4 text-lg leading-8 text-white/55">
                  Build trust with every report, every route, and every city block your network understands.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/reports" className="rounded-2xl bg-emerald-500 px-6 py-4 font-medium text-black">
                  Report a hazard
                </Link>
                <Link href="/dashboard" className="rounded-2xl border border-cyan-400/16 bg-cyan-500/8 px-6 py-4 font-medium text-cyan-200">
                  View analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/6 px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-400/16 bg-emerald-500/12 p-3 text-emerald-300">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-2xl tracking-tight text-white">CityZen</div>
                <div className="text-sm text-white/42">Road Safety Platform</div>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm text-white/45">
              Real-time road intelligence for calmer commutes, safer routing, and stronger city operations.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/45">
            <Link href="/map">Platform</Link>
            <Link href="/dashboard">Analytics</Link>
            <Link href="/reports">Reports</Link>
            <Link href="/dashboard">API</Link>
            <Link href="/">About</Link>
            <Link href="/">Privacy</Link>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl text-sm text-white/28">
          © 2026 CityZen. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
