"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  FileText,
  Home,
  Map,
  Menu,
  Shield,
  X,
} from "lucide-react";

const links = [
  { label: "Home", href: "/", icon: Home },
  { label: "Map", href: "/map", icon: Map },
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Reports", href: "/reports", icon: FileText },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [liveCount, setLiveCount] = useState(2847);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLiveCount((current) => {
        const delta = Math.random() > 0.55 ? 1 : 0;
        return current >= 2899 ? 2847 : current + delta;
      });
    }, 2400);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const activeHref = useMemo(() => {
    const exact = links.find((link) => link.href === pathname);
    return exact?.href ?? "/";
  }, [pathname]);
  const forceSolid = pathname === "/map";

  return (
    <nav className="fixed inset-x-0 top-0 z-[2100] px-4 pt-4 md:px-6">
      <div
        className={[
          "mx-auto max-w-7xl rounded-[24px] transition-all duration-300",
          scrolled || forceSolid
            ? "border border-white/8 bg-[rgba(5,5,5,0.78)] shadow-[0_14px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl"
            : "border border-transparent bg-transparent",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-4 py-3 md:px-5">
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-2xl border border-emerald-400/16 bg-emerald-500/12 p-2.5 text-emerald-300"
            >
              <Shield className="h-5 w-5" />
            </motion.div>
            <div>
              <div className="font-display text-2xl leading-none tracking-tight text-white">CityZen</div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/32">
                <span>Road safety</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="font-mono text-emerald-200">{liveCount.toLocaleString()} live</span>
              </div>
            </div>
          </Link>

          <div className="hidden items-center rounded-full border border-white/8 bg-white/[0.03] p-1 md:flex">
            {links.map((link) => {
              const isActive = activeHref === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                    isActive ? "text-emerald-300" : "text-white/40 hover:text-white/80"
                  }`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full border border-emerald-400/14 bg-emerald-500/12"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    />
                  ) : null}
                  <Icon className="relative z-10 h-3.5 w-3.5" />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-white/55">
              <Activity className="h-4 w-4 text-emerald-300" />
              <span className="font-mono text-white/78">{liveCount.toLocaleString()}</span>
              <span>live</span>
            </div>
            <button className="rounded-full border border-emerald-400/18 bg-emerald-500/8 px-4 py-2 text-sm text-emerald-200 transition-colors hover:bg-emerald-500/12">
              Sign in
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-2 text-white/72 md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/6 md:hidden"
            >
              <div className="space-y-2 px-4 py-4">
                {links.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = activeHref === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                          isActive
                            ? "border-emerald-400/16 bg-emerald-500/10 text-emerald-200"
                            : "border-white/8 bg-white/[0.02] text-white/62"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
                <button className="mt-3 w-full rounded-2xl border border-emerald-400/16 bg-emerald-500 px-4 py-3 text-sm font-medium text-black">
                  Sign in
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </nav>
  );
}
