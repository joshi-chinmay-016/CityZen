"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface RouteCardSkeletonProps {
  count?: number;
}

export const RouteCardSkeleton: React.FC<RouteCardSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {[...Array(count)].map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="rounded-xl border-2 border-gray-200 p-4 space-y-3"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Badge */}
          <div className="h-6 bg-gray-200 rounded w-full animate-pulse" />

          {/* Hazards */}
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
        </motion.div>
      ))}
    </>
  );
};

export default RouteCardSkeleton;
