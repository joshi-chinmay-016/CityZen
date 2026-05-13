"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { RouteSeverity } from '@/types/route';

interface SeverityBadgeProps {
  severity: RouteSeverity;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ 
  severity, 
  size = 'md', 
  showLabel = true,
  animated = true
}) => {
  const config = {
    low: {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-800',
      icon: CheckCircle,
      label: 'Safe',
      color: '#10b981',
    },
    medium: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
      text: 'text-yellow-800',
      icon: AlertCircle,
      label: 'Moderate',
      color: '#f59e0b',
    },
    high: {
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-800',
      icon: AlertTriangle,
      label: 'High Risk',
      color: '#ef4444',
    },
  };

  const current = config[severity];
  const Icon = current.icon;

  const sizeConfig = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  const badge = (
    <div className={`inline-flex items-center gap-2 rounded-lg border ${current.bg} ${current.border} ${current.text} font-semibold ${sizeConfig[size]}`}>
      <Icon size={iconSize[size]} />
      {showLabel && <span>{current.label}</span>}
    </div>
  );

  if (!animated) return badge;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.05 }}
    >
      {badge}
    </motion.div>
  );
};

export default SeverityBadge;
