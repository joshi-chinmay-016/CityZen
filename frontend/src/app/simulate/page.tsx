"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Compass, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Info,
  BarChart3,
  Gauge,
  RefreshCw,
  Layers
} from 'lucide-react';
import { sensorService, SensorDataInput, SensorAnalysisResult } from '@/services/sensorService';
import { toast } from 'react-hot-toast';

export default function SensorSimulationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SensorAnalysisResult | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<SensorDataInput>({
    accel_x: 0.1,
    accel_y: 0.1,
    accel_z: 9.8,
    gyro_x: 0.0,
    gyro_y: 0.0,
    gyro_z: 0.0,
    latitude: 12.9716,
    longitude: 77.5946,
    speed: 40,
    vibration_intensity: 0.2
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await sensorService.analyzeData(formData);
      setResult(data);
      toast.success('Sensor data analyzed and integrated!');
    } catch (error) {
      toast.error('Analysis failed. Ensure ML service is running.');
    } finally {
      setLoading(false);
    }
  };

  const randomizeData = (level: 'smooth' | 'rough' | 'moderate') => {
    const presets = {
      smooth: {
        accel_x: 0.05, accel_y: 0.05, accel_z: 9.81,
        gyro_x: 0.01, gyro_y: 0.01, gyro_z: 0.01,
        vibration_intensity: 0.1, speed: 60
      },
      moderate: {
        accel_x: 0.5, accel_y: 0.3, accel_z: 9.2,
        gyro_x: 0.1, gyro_y: 0.1, gyro_z: 0.1,
        vibration_intensity: 0.4, speed: 45
      },
      rough: {
        accel_x: 1.8, accel_y: 1.2, accel_z: 7.5,
        gyro_x: 0.5, gyro_y: 0.4, gyro_z: 0.6,
        vibration_intensity: 0.85, speed: 25
      }
    };
    
    setFormData(prev => ({
      ...prev,
      ...presets[level],
      latitude: 12.9716 + (Math.random() - 0.5) * 0.01,
      longitude: 77.5946 + (Math.random() - 0.5) * 0.01,
    }));
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-6 bg-[#050505] relative overflow-hidden">
      {/* Visual background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-emerald-400 font-bold tracking-widest text-xs mb-3 uppercase"
            >
              <Zap size={14} /> Passive Road Intelligence
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold tracking-tighter"
            >
              Sensor <span className="text-white/40">Simulation</span>
            </motion.h1>
          </div>
          
          <div className="flex gap-3">
            {(['smooth', 'moderate', 'rough'] as const).map(level => (
              <button 
                key={level}
                onClick={() => randomizeData(level)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-wider"
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Simulation Controls */}
          <div className="lg:col-span-7 space-y-6">
            <motion.form 
              onSubmit={handleAnalyze}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="liquid-glass p-8 rounded-3xl border border-white/5 space-y-8"
            >
              <div className="grid md:grid-cols-3 gap-6">
                {/* Accelerometer */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                    <Activity size={14} className="text-blue-400" /> Accelerometer
                  </h3>
                  {['accel_x', 'accel_y', 'accel_z'].map(key => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">{key.split('_')[1]} axis (m/s²)</label>
                      <input 
                        type="number" step="0.01" name={key} value={formData[key as keyof SensorDataInput]} 
                        onChange={handleInputChange}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500/50 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>

                {/* Gyroscope */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                    <Compass size={14} className="text-emerald-400" /> Gyroscope
                  </h3>
                  {['gyro_x', 'gyro_y', 'gyro_z'].map(key => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">{key.split('_')[1]} axis (rad/s)</label>
                      <input 
                        type="number" step="0.01" name={key} value={formData[key as keyof SensorDataInput]} 
                        onChange={handleInputChange}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-emerald-500/50 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>

                {/* Environment */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                    <Layers size={14} className="text-purple-400" /> Context
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Speed (km/h)</label>
                      <input 
                        type="number" name="speed" value={formData.speed} onChange={handleInputChange}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Vibration (0-1)</label>
                      <input 
                        type="range" min="0" max="1" step="0.01" name="vibration_intensity" value={formData.vibration_intensity} onChange={handleInputChange}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>SMOOTH</span>
                        <span>{formData.vibration_intensity}</span>
                        <span>INTENSE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* GPS Coordinates */}
              <div className="pt-6 border-t border-white/5 grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                    <MapPin size={14} /> Latitude
                  </label>
                  <input 
                    type="number" step="0.0001" name="latitude" value={formData.latitude} onChange={handleInputChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/30 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                    <MapPin size={14} /> Longitude
                  </label>
                  <input 
                    type="number" step="0.0001" name="longitude" value={formData.longitude} onChange={handleInputChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/30 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-white text-black rounded-2xl font-bold hover:bg-gray-100 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5"
              >
                {loading ? <RefreshCw className="animate-spin" /> : <Activity size={20} />}
                {loading ? "Analyzing Data..." : "Run Road Intelligence Analysis"}
              </button>
            </motion.form>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className={`p-8 rounded-3xl border ${
                    result.stress_level === 'rough' ? 'bg-red-500/10 border-red-500/30' : 
                    result.stress_level === 'moderate' ? 'bg-amber-500/10 border-amber-500/30' : 
                    'bg-emerald-500/10 border-emerald-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-8">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Road Intelligence Status</span>
                        <h2 className={`text-4xl font-bold uppercase tracking-tight ${
                          result.stress_level === 'rough' ? 'text-red-400' : 
                          result.stress_level === 'moderate' ? 'text-amber-400' : 
                          'text-emerald-400'
                        }`}>
                          {result.stress_level}
                        </h2>
                      </div>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                        result.stress_level === 'rough' ? 'border-red-500/50' : 
                        result.stress_level === 'moderate' ? 'border-amber-500/50' : 
                        'border-emerald-500/50'
                      }`}>
                        {result.stress_level === 'rough' ? <AlertTriangle className="text-red-400" /> : <CheckCircle2 className="text-emerald-400" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                        <span className="text-[10px] block mb-1 text-slate-500 font-bold uppercase">Roughness Score</span>
                        <span className="text-2xl font-bold text-white">{Math.round(result.roughness_score * 100)}%</span>
                      </div>
                      <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                        <span className="text-[10px] block mb-1 text-slate-500 font-bold uppercase">Confidence</span>
                        <span className="text-2xl font-bold text-white uppercase">{result.anomaly_confidence}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                        <span>Stress Probability</span>
                        <span>{result.heatmap_intensity * 100}%</span>
                      </div>
                      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.heatmap_intensity * 100}%` }}
                          className={`h-full ${
                            result.stress_level === 'rough' ? 'bg-red-500' : 
                            result.stress_level === 'moderate' ? 'bg-amber-500' : 
                            'bg-emerald-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="liquid-glass p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                      <Layers className="text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Heatmap Integration</h4>
                      <p className="text-xs text-slate-500">Global stress indices updated in real-time based on your input.</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="liquid-glass p-12 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[400px]">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 animate-pulse">
                    <Gauge className="w-10 h-10 text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-300">Ready for Analysis</h3>
                    <p className="text-sm text-slate-500 max-w-[240px]">Enter simulated sensor metrics to generate road intelligence insights.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Technical Overview */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { icon: Gauge, title: "Roughness Score", desc: "Derived from Z-axis acceleration variance and vibration frequency analysis." },
            { icon: BarChart3, title: "Stress Index", desc: "Correlates speed and impact magnitude to classify road comfort levels." },
            { icon: MapPin, title: "Spatial Integration", desc: "Geotagged anomalies update the global safety heatmap instantly." }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all bg-white/[0.02]">
              <item.icon className="w-6 h-6 text-slate-500 mb-4" />
              <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
