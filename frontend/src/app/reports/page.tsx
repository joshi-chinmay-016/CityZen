"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  MapPin, 
  Camera, 
  Upload, 
  CheckCircle, 
  ShieldCheck, 
  TrendingUp, 
  Award, 
  List,
  Search,
  Loader2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { geocodingService } from '@/services/geocodingService';
import { reportService, HazardReport } from '@/services/reportService';
import { toast } from 'react-hot-toast';

/*
SECTION: Status Tracker
Submitted -> AI Verified -> Community Confirmed -> Live on Map
*/
const StatusTracker = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'Submitted', icon: Upload },
    { id: 2, label: 'AI Verified', icon: ShieldCheck },
    { id: 3, label: 'Confirmed', icon: CheckCircle },
    { id: 4, label: 'Live on Map', icon: MapPin },
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-12">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-2 relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
              currentStep >= step.id 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-slate-900 border-slate-800 text-slate-600'
            }`}>
              <step.icon size={20} />
            </div>
            <span className={`text-xs font-bold uppercase tracking-tighter ${currentStep >= step.id ? 'text-emerald-400' : 'text-slate-600'}`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-[2px] mx-4 bg-slate-800 relative overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                className="absolute top-0 left-0 h-full bg-emerald-500"
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [hazardType, setHazardType] = useState<string>('pothole');
  const [severity, setSeverity] = useState<number>(3);
  const [description, setDescription] = useState<string>('');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiVerified, setAiVerified] = useState(false);
  const [step, setStep] = useState(1);

  // Mock Leaders
  const leaders = [
    { name: 'Alex Urban', points: 4250, rank: 1, badge: 'Guardian' },
    { name: 'Sarah City', points: 3820, rank: 2, badge: 'Sentinel' },
    { name: 'Mike Road', points: 2900, rank: 3, badge: 'Watchman' },
  ];

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords([latitude, longitude]);
          try {
            const address = await geocodingService.reverseGeocode(latitude, longitude);
            setLocationQuery(address);
          } catch (e) {
            setLocationQuery(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          }
          setIsLocating(false);
          toast.success('Location detected');
        },
        () => {
          setIsLocating(false);
          toast.error('Failed to get location');
        }
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (!coords) {
        toast.error('Please detect your location first so the AI can geotag the report.');
        return;
      }

      const file = e.target.files[0];
      setUploadProgress(10);
      setAiVerified(false);
      setStep(1);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('latitude', coords[0].toString());
        formData.append('longitude', coords[1].toString());

        setUploadProgress(30);
        const result = await reportService.uploadReport(formData);
        setUploadProgress(100);

        if (result && result.predictions && result.predictions.length > 0) {
          const prediction = result.predictions[0];
          setHazardType(prediction.label || 'pothole');
          setAiVerified(true);
          setStep(2);
          toast.success(`AI Verified: ${prediction.label} detected with ${Math.round(prediction.confidence * 100)}% confidence`);
        } else {
          setAiVerified(false);
          toast.error('AI could not confidently identify a hazard in this image.');
        }
      } catch (err) {
        console.error('AI Verification failed:', err);
        setUploadProgress(0);
        toast.error('AI Verification service unavailable.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) return toast.error('Please specify location');
    
    setIsSubmitting(true);
    try {
      // The ML service already saves the report if called via uploadReport
      // But we call createReport here to ensure it's finalized with user-provided description/severity
      await reportService.createReport({
        type: hazardType,
        severity,
        description,
        latitude: coords[0],
        longitude: coords[1],
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=1470&auto=format&fit=crop'
      });
      toast.success('Report synchronized to safety map!');
      setStep(4);
      
      // Reset form after a delay
      setTimeout(() => {
        setStep(1);
        setAiVerified(false);
        setUploadProgress(0);
        setDescription('');
        setLocationQuery('');
        setCoords(null);
      }, 5000);
    } catch (error) {
      toast.error('Failed to sync report to map');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Report Hazard</h1>
          <p className="text-slate-500 max-w-xl">
            Help your community by identifying road hazards. Our AI engine will verify 
            submissions in real-time to update the live safety map.
          </p>
        </div>

        <StatusTracker currentStep={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Type Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hazard Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['pothole', 'manhole', 'crack'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setHazardType(type)}
                          className={`py-3 rounded-xl text-sm font-bold capitalize transition-all border ${
                            hazardType === type 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Severity Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Severity Level ({severity})</label>
                    <div className="flex items-center gap-2 h-11 px-2 bg-slate-950 rounded-xl border border-slate-800">
                      {[1, 2, 3, 4, 5].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSeverity(lvl)}
                          className={`flex-1 h-7 rounded-lg text-xs font-bold transition-all ${
                            severity === lvl 
                              ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]' 
                              : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Location Search */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input 
                        type="text"
                        placeholder="Search location or enter coordinates..."
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating}
                      className="px-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                    >
                      {isLocating ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />}
                      <span className="hidden sm:inline font-bold text-sm">Locate</span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide additional context (optional)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !aiVerified}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    aiVerified 
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                  Complete Report
                </button>
              </form>
            </motion.div>

            {/* AI verification Preview */}
            <AnimatePresence>
              {uploadProgress > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-48 h-48 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                      {aiVerified ? (
                        <>
                          <img 
                            src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=1470&auto=format&fit=crop" 
                            className="w-full h-full object-cover opacity-50"
                            alt="Preview"
                          />
                          <div className="absolute inset-0 border-2 border-emerald-500/50 flex items-center justify-center">
                            <ShieldCheck className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" size={48} />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Loader2 className="animate-spin text-emerald-500 mx-auto mb-2" size={32} />
                          <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Analyzing Image...</div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">AI Diagnostic Result</h3>
                        {aiVerified && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/30">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Confidence</div>
                          <div className="text-xl font-bold text-emerald-400">{aiVerified ? '98.2%' : '--'}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Severity Rank</div>
                          <div className="text-xl font-bold text-rose-400">{aiVerified ? `LVL ${severity}` : '--'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebars */}
          <div className="space-y-8">
            {/* Rewards System */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <Award className="text-emerald-400" size={24} />
                <h3 className="text-lg font-bold text-white tracking-tight">Citizen Status</h3>
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-white mb-2 tracking-tighter">1,250</div>
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">SafePoints Earned</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
                  <span className="text-slate-400">Streak Bonus</span>
                  <span className="text-emerald-400 font-bold">+15%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
                  <span className="text-slate-400">Submission Tier</span>
                  <span className="text-cyan-400 font-bold">Gold Sentinel</span>
                </div>
              </div>
            </div>

            {/* AI Verification Logic Card (Upload area) */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl">
              <label className="group cursor-pointer">
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center group-hover:border-emerald-500/50 transition-all bg-slate-950/30">
                  <Camera className="mx-auto mb-4 text-slate-600 group-hover:text-emerald-400 transition-colors" size={40} />
                  <h3 className="text-white font-bold mb-1">Click to Analyze</h3>
                  <p className="text-xs text-slate-500 mb-4">Upload a clear image of the hazard for AI verification</p>
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest py-1 px-3 bg-emerald-500/10 rounded-full inline-block border border-emerald-500/20">
                    Auto-ML Active
                  </div>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>

            {/* Leaderboard Card */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-cyan-400" size={20} />
                <h3 className="text-lg font-bold text-white tracking-tight">Safety Guardians</h3>
              </div>
              <div className="space-y-4">
                {leaders.map(leader => (
                  <div key={leader.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      leader.rank === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-white'
                    }`}>
                      {leader.rank}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white leading-none mb-1">{leader.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-medium">{leader.badge}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">{leader.points}</div>
                      <div className="text-[8px] text-slate-600 uppercase font-bold tracking-widest">PTS</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 group">
                View Full Leaderboard
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
