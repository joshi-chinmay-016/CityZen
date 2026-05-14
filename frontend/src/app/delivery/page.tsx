"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Navigation, MessageSquare, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, ChevronRight, X } from 'lucide-react';
import { journeyService, JourneyFeedbackRequest } from '@/services/journeyService';
import { toast } from 'react-hot-toast';

const issueTypes = [
  { id: 'pothole', label: 'Pothole', icon: AlertTriangle, color: 'text-amber-400' },
  { id: 'crack', label: 'Road Crack', icon: AlertTriangle, color: 'text-orange-400' },
  { id: 'manhole', label: 'Open Manhole', icon: AlertTriangle, color: 'text-red-400' },
  { id: 'traffic', label: 'Heavy Traffic', icon: AlertTriangle, color: 'text-blue-400' },
  { id: 'unsafe road', label: 'Unsafe Road', icon: ShieldCheck, color: 'text-rose-400' },
] as const;

export default function DeliverySurveyPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [rating, setRating] = useState(0);
  const [issueType, setIssueType] = useState<typeof issueTypes[number]['id'] | null>(null);
  const [landmark, setLandmark] = useState('');

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !destination || rating === 0) {
      toast.error('Please fill in all basic details');
      return;
    }
    setStep(2);
  };

  const submitFinalFeedback = async (detailed: boolean) => {
    setLoading(true);
    try {
      const payload: JourneyFeedbackRequest = {
        start,
        destination,
        rating,
        // If not detailed, we provide a default issue type based on rating
        issueType: detailed && issueType ? issueType : (rating <= 2 ? 'unsafe road' : 'traffic'),
        severity: rating <= 2 ? 'high' : (rating === 3 ? 'medium' : 'low'),
        landmark: detailed ? landmark : ''
      };

      await journeyService.submitFeedback(payload);
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-6 flex items-center justify-center bg-[#050505]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full liquid-glass p-12 text-center rounded-3xl"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Feedback Received!</h2>
          <p className="text-slate-400 mb-8">
            Your journey data has been integrated into CityZen's crowd intelligence engine. This helps make the city safer for everyone.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
          >
            Return to Home <ChevronRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-12 px-6 bg-[#050505] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            Driver <span className="text-emerald-400">Feedback</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Share your experience to help us improve city routes. Your on-road insights are the backbone of our safety engine.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left Side: Progress/Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="liquid-glass p-6 rounded-2xl border border-white/5">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-400" />
                Crowd Intelligence
              </h3>
              <div className="space-y-6">
                {[
                  { label: 'Step 1: Basic Info', active: step >= 1 },
                  { label: 'Step 2: Experience Detail', active: step >= 2 },
                  { label: 'Step 3: Specific Hazards', active: step === 3 }
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-all ${
                      s.active ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-slate-500'
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`font-medium ${s.active ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
              <p className="text-sm text-emerald-400/80 leading-relaxed italic">
                "By reporting hazards, you help delivery boys avoid high-stress zones and reduce vehicle wear and tear."
              </p>
            </div>
          </div>

          {/* Right Side: Forms */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="liquid-glass p-8 rounded-3xl border border-white/10 shadow-2xl"
                >
                  <form onSubmit={handleInitialSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                          <MapPin size={14} className="text-emerald-400" /> Start Location
                        </label>
                        <input 
                          type="text" 
                          value={start}
                          onChange={(e) => setStart(e.target.value)}
                          placeholder="e.g. Indiranagar"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                          <MapPin size={14} className="text-blue-400" /> Destination
                        </label>
                        <input 
                          type="text" 
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="e.g. Koramangala"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-slate-400 block text-center">
                        How was your journey experience?
                      </label>
                      <div className="flex justify-center gap-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setRating(star)}
                            className="focus:outline-none group"
                          >
                            <Star 
                              className={`w-10 h-10 transition-all ${
                                star <= rating 
                                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' 
                                  : 'text-slate-700 group-hover:text-slate-500'
                              }`} 
                            />
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-center text-xs text-slate-500 font-medium">
                        {rating === 1 && "Extremely Poor"}
                        {rating === 2 && "Poor"}
                        {rating === 3 && "Average"}
                        {rating === 4 && "Good"}
                        {rating === 5 && "Excellent!"}
                      </p>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      Next Step <ArrowRight size={20} />
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="liquid-glass p-12 rounded-3xl border border-white/10 text-center shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <button onClick={() => setStep(1)} className="text-slate-500 hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/30">
                    <MessageSquare className="w-10 h-10 text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">One last thing...</h2>
                  <p className="text-slate-400 mb-10 text-lg">
                    Would you like to share more details about specific issues you encountered during your journey?
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => submitFinalFeedback(false)}
                      disabled={loading}
                      className="py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all disabled:opacity-50"
                    >
                      {loading ? "Submitting..." : "No, Skip"}
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      className="py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                    >
                      Yes, Share More
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="liquid-glass p-8 rounded-3xl border border-white/10 shadow-2xl"
                >
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-2">Identify Hazards</h3>
                    <p className="text-slate-400 text-sm">Select what issues you saw on the road.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                    {issueTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setIssueType(type.id)}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                          issueType === type.id 
                            ? 'bg-blue-600/20 border-blue-500 shadow-inner' 
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <type.icon className={`w-6 h-6 ${issueType === type.id ? 'text-white' : type.color}`} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">{type.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 mb-8">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                      <MapPin size={14} className="text-emerald-400" /> Specific Landmark (Optional)
                    </label>
                    <input 
                      type="text" 
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Sony World Signal"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(2)}
                      className="w-1/3 py-5 bg-white/5 text-white rounded-2xl font-bold border border-white/10 hover:bg-white/10 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => submitFinalFeedback(true)}
                      disabled={loading || !issueType}
                      className="w-2/3 py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-900/40 hover:bg-blue-500 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? "Submitting..." : "Submit Journey Report"} <ChevronRight size={20} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
