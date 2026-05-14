"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  Map as MapIcon, 
  LayoutDashboard, 
  AlertCircle, 
  Home,
  Menu,
  X,
  User
} from 'lucide-react';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="absolute top-0 w-full z-[5000] px-6 md:px-12 lg:px-16 pt-6">
      <div className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
        {/* Left: Logo text */}
        <Link href="/" className="text-2xl font-semibold tracking-tight text-white">
          CityZen
        </Link>

        {/* Center: Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/map" className="text-sm text-white hover:text-gray-300 transition-colors">Live Map</Link>
          <Link href="/map" className="text-sm text-white hover:text-gray-300 transition-colors">Safe Routes</Link>
          <Link href="/dashboard" className="text-sm text-white hover:text-gray-300 transition-colors">Dashboard</Link>
          <Link href="/reports" className="text-sm text-white hover:text-gray-300 transition-colors">Reports</Link>
          <Link href="/delivery" className="text-sm text-white hover:text-gray-300 transition-colors">Driver Feedback</Link>
        </div>

        {/* Right: Find Safe Route Button */}
        <Link 
          href="/map"
          className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Find Safe Route
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
