"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Zap, AlertTriangle, Check } from 'lucide-react';
import { SingleRoute, RouteSeverity } from '@/types/route';
import { stressService } from '@/services/stressService';

interface RouteCardProps {
  route: SingleRoute;
  isSelected: boolean;
  isSafest: boolean;
  index: number;
  onClick: () => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, isSelected, isSafest, index, onClick }) => {
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes} min`;
  };

  const getSeverityColor = (severity: RouteSeverity) => {
    const colors: Record<RouteSeverity, string> = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600',
    };
    return colors[severity];
  };

  const getSeverityBg = (severity: RouteSeverity) => {
    const colors: Record<RouteSeverity, string> = {
      low: 'bg-green-50 border-green-200',
      medium: 'bg-yellow-50 border-yellow-200',
      high: 'bg-red-50 border-red-200',
    };
    return colors[severity];
  };

  const getSeverityLabel = (severity: RouteSeverity) => {
    const labels: Record<RouteSeverity, string> = {
      low: 'Low Risk',
      medium: 'Moderate Risk',
      high: 'High Risk',
    };
    return labels[severity];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
        isSelected
          ? 'border-emerald-500 bg-emerald-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      {/* Header with route type and recommended badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-lg capitalize">
            {route.type === 'safe' ? '✓ Safest Route' : route.type === 'moderate' ? '⚠ Alternative' : '🚨 Risky'}
          </div>
          {isSafest && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold"
            >
              <Check size={12} />
              RECOMMENDED
            </motion.div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Distance */}
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Distance</p>
            <p className="font-semibold text-sm">{formatDistance(route.distance)}</p>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">ETA</p>
            <p className="font-semibold text-sm">{formatDuration(route.duration)}</p>
          </div>
        </div>

        {/* Stress Score */}
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-600" />
          <div>
            <p className="text-xs text-gray-500">Stress</p>
            <p className="font-semibold text-sm">{route.stress_score}</p>
          </div>
        </div>
      </div>

      {/* Severity Badge */}
      <div className={`rounded-lg border p-2 mb-3 ${getSeverityBg(route.type as RouteSeverity)}`}>
        <p className={`text-xs font-semibold ${getSeverityColor(route.type as RouteSeverity)}`}>
          {getSeverityLabel(route.type as RouteSeverity)}
        </p>
      </div>

      {/* Hazards Info */}
      {route.nearby_hazards && route.nearby_hazards.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
          <AlertTriangle size={14} className="text-orange-600" />
          <span>{route.nearby_hazards.length} hazard{route.nearby_hazards.length !== 1 ? 's' : ''} detected</span>
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          layoutId="routeSelection"
          className="absolute inset-0 rounded-xl border-2 border-emerald-500"
        />
      )}
    </motion.div>
  );
};

export default RouteCard;
