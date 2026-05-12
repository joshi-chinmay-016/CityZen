"use client";

import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className={`animate-pulse bg-slate-800/50 rounded ${className}`}
        />
      ))}
    </>
  );
};

export default Skeleton;
