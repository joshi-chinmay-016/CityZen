"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Map as MapIcon, 
  Activity, 
  AlertTriangle, 
  Navigation, 
  Layers, 
  Users, 
  Target,
  ArrowRight,
  Globe,
  MessageCircle,
  Share2
} from 'lucide-react';

/* 
SECTION 1 — HERO
- AI-powered road safety badge
- Large heading: "Navigate roads stress-free"
- subtitle: AI-powered pothole/manhole/crack detection
- CTA buttons: Find Safe Route, View Live Map
*/

const FadeIn = ({ children, delay = 0, duration = 1000 }: { children: React.ReactNode, delay?: number, duration?: number }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className="transition-opacity"
      style={{ opacity: visible ? 1 : 0, transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

const AnimatedHeading = ({ text }: { text: string }) => {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const lines = text.split('\n');
  const charDelay = 30;
  const transitionDuration = 500;
  
  let cumulativeLength = 0;

  return (
    <div style={{ letterSpacing: '-0.04em' }} className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4 text-white">
      {lines.map((line, lineIndex) => {
        const lineElements = (
          <div key={lineIndex}>
            {line.split('').map((char, charIndex) => {
              const delay = started ? (cumulativeLength + charIndex) * charDelay : 0;
              const displayChar = char === ' ' ? '\u00A0' : char;
              return (
                <span
                  key={charIndex}
                  className="inline-block transition-all"
                  style={{
                    opacity: started ? 1 : 0,
                    transform: started ? 'translateX(0)' : 'translateX(-18px)',
                    transitionDuration: `${transitionDuration}ms`,
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  {displayChar}
                </span>
              );
            })}
          </div>
        );
        cumulativeLength += line.length;
        return lineElements;
      })}
    </div>
  );
};

const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-12 lg:pb-16 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <video
          className="w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* Main Content Container */}
      <div className="w-full lg:grid lg:grid-cols-2 lg:items-end relative z-10">
        
        {/* Left Column - Main content */}
        <div>
          <AnimatedHeading text={"Navigate roads\nstress-free"} />

          <FadeIn delay={800}>
            <p className="text-base md:text-lg text-gray-300 mb-5 max-w-lg">
              Harnessing advanced machine learning to detect potholes, manholes, and cracks in real-time. The safest route for you and your vehicle is just a click away.
            </p>
          </FadeIn>

          <FadeIn delay={1200}>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/map" 
                className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Find Safe Route
              </Link>
              <Link 
                href="/map" 
                className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors"
              >
                View Live Map
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Right Column - Tag */}
        <div className="hidden lg:flex items-end justify-end">
          <FadeIn delay={1400}>
            <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
              <span className="text-lg md:text-xl lg:text-2xl font-light text-white">
                AI-Powered Road Safety
              </span>
            </div>
          </FadeIn>
        </div>

      </div>
    </div>
  );
};

/*
SECTION 2 — LIVE STATS
*/
const StatsSection = () => {
  const stats = [
    { label: 'Hazards Mapped', value: '1.2M+', icon: AlertTriangle, color: 'text-rose-400' },
    { label: 'Route Accuracy', value: '99.4%', icon: Target, color: 'text-emerald-400' },
    { label: 'Users Protected', value: '500k+', icon: Users, color: 'text-cyan-400' },
  ];

  return (
    <div className="py-20 px-6 bg-slate-950/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl hover:border-slate-700 transition-colors group"
            >
              <stat.icon className={`mb-4 ${stat.color} transition-transform group-hover:scale-110`} size={32} />
              <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-slate-500 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

/*
SECTION 3 — FEATURES
*/
const FeaturesSection = () => {
  const features = [
    { title: 'Live Hazard Map', desc: 'Real-time visualization of city-wide road conditions.', icon: MapIcon },
    { title: 'Stress Score Routing', desc: 'Calculate the emotional toll of your journey.', icon: Activity },
    { title: 'Community Reporting', desc: 'Join thousands of citizens reporting hazards.', icon: Users },
    { title: 'AI Detection', desc: 'YOLO-powered automatic hazard identification.', icon: ShieldCheck },
    { title: 'Heatmap Intelligence', desc: 'Identify danger zones with advanced analytics.', icon: Layers },
    { title: 'Safe Navigation', desc: 'Turn-by-turn guidance through optimal paths.', icon: Navigation },
  ];

  return (
    <div className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4">Smart City Intelligence</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Experience the future of urban mobility with our suite of AI-driven tools.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-md hover:border-emerald-500/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

/*
SECTION 4 — HOW IT WORKS
*/
const HowItWorks = () => {
  const steps = [
    { title: 'Data Collection', desc: 'IoT sensors and community reports feed live data.' },
    { title: 'AI Verification', desc: 'ML models analyze and rate hazard severity.' },
    { title: 'Stress Calculation', desc: 'We calculate the Urban Friction Index.' },
    { title: 'Safe Routing', desc: 'The most optimal, low-stress path is generated.' },
  ];

  return (
    <div className="py-32 px-6 bg-slate-950/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4">How it Works</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-800 -translate-y-1/2 -z-10" />
          
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                {index + 1}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/*
SECTION 5 — FOOTER
*/
const Footer = () => {
  return (
    <footer className="py-20 px-6 border-t border-slate-900 bg-slate-950">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Navigation className="text-slate-950" size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">CityZen</span>
          </div>
          <p className="text-slate-500 max-w-sm mb-6">
            Redefining urban navigation through AI-powered road intelligence and community reporting.
          </p>
          <div className="flex items-center gap-4">
            <Globe className="text-slate-400 hover:text-white cursor-pointer transition-colors" size={20} />
            <MessageCircle className="text-slate-400 hover:text-white cursor-pointer transition-colors" size={20} />
            <Share2 className="text-slate-400 hover:text-white cursor-pointer transition-colors" size={20} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Platform</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li className="hover:text-emerald-400 transition-colors cursor-pointer">Live Map</li>
              <li className="hover:text-emerald-400 transition-colors cursor-pointer">Safe Routes</li>
              <li className="hover:text-emerald-400 transition-colors cursor-pointer">Dashboard</li>
              <li className="hover:text-emerald-400 transition-colors cursor-pointer">Reports</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li className="hover:text-emerald-400 transition-colors cursor-pointer">About Us</li>
              <li className="hover:text-emerald-400 transition-colors cursor-pointer">Privacy</li>
              <li className="hover:text-emerald-400 transition-colors cursor-pointer">Terms</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-900 text-center text-slate-600 text-xs">
        © 2026 CityZen Intelligence Systems. All rights reserved.
      </div>
    </footer>
  );
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorks />
      <Footer />
    </main>
  );
}
