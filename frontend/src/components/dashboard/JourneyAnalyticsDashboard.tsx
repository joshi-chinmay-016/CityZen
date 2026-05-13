"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, Users, MapPin, Frown } from 'lucide-react';
import { useJourneyAnalytics } from '@/hooks/useJourneyAnalytics';

const COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

export const JourneyAnalyticsDashboard: React.FC = () => {
  const { analytics, isLoading, error } = useJourneyAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <AlertTriangle className="mx-auto mb-2 text-red-600" size={24} />
        <p className="text-red-700">Failed to load journey analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Journey Reports"
          value={analytics.totalJourneyReports}
          icon={<Users size={20} className="text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Low Ratings"
          value={analytics.lowRatings}
          icon={<Frown size={20} className="text-red-600" />}
          bgColor="bg-red-50"
          highlight={analytics.lowRatings > 0}
        />
        <StatCard
          title="Unsafe Road Complaints"
          value={analytics.unsafeRoadComplaints}
          icon={<AlertTriangle size={20} className="text-orange-600" />}
          bgColor="bg-orange-50"
        />
        <StatCard
          title="Avg Rating"
          value={analytics.averageRating.toFixed(1)}
          subtitle="out of 5"
          icon={<TrendingUp size={20} className="text-green-600" />}
          bgColor="bg-green-50"
        />
      </div>

      {/* High Risk Zones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MapPin className="text-red-600" size={20} />
          High Risk Zones
        </h3>
        {analytics.highRiskZones && analytics.highRiskZones.length > 0 ? (
          <div className="space-y-3">
            {analytics.highRiskZones.slice(0, 5).map((zone, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <div>
                  <p className="font-semibold text-gray-800">{zone.location}</p>
                  <p className="text-xs text-gray-600">{zone.incidents} incidents</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">{zone.riskScore.toFixed(1)}</div>
                  <div className="text-xs text-gray-600">Risk Score</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No high risk zones detected</p>
        )}
      </motion.div>

      {/* Issue Breakdown & Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="font-semibold mb-4">Most Common Issues</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={Object.entries(analytics.issueBreakdown || {}).map(([name, value]) => ({ name, value }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="font-semibold mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={Object.entries(analytics.ratingDistribution || {}).map(([rating, count]) => ({
                  name: `${rating} ⭐`,
                  value: count,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[COLORS.high, COLORS.medium, COLORS.low, COLORS.low, COLORS.low].map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Trends */}
      {analytics.trends && analytics.trends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="font-semibold mb-4">Incidents & Ratings Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.trends.slice(-14)}> {/* Last 14 days */}
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="incidents" stroke="#ef4444" name="Incidents" />
              <Line yAxisId="right" type="monotone" dataKey="averageRating" stroke="#10b981" name="Avg Rating" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  bgColor: string;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, bgColor, highlight }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`${bgColor} p-4 rounded-lg border-2 ${highlight ? 'border-red-400' : 'border-transparent'}`}
  >
    <div className="flex items-start justify-between mb-2">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      {icon}
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
  </motion.div>
);

export default JourneyAnalyticsDashboard;
