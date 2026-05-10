"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, CheckCircle2, RotateCcw, Crosshair } from "lucide-react";
import SeverityBadge from "./SeverityBadge";

interface MLPredictionResponse {
  hazardDetected: boolean;
  hazardType: string;
  confidenceScore: number;
  stressMultiplier: number;
}

interface ReportPreviewProps {
  imageFile: File;
  previewUrl: string;
  prediction: MLPredictionResponse;
  onReset: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function ReportPreview({
  previewUrl,
  prediction,
  onReset,
  onSubmit,
  isSubmitting,
}: ReportPreviewProps) {
  
  // Determine severity string based on stressMultiplier
  const getSeverity = (stress: number) => {
    if (stress >= 2.0) return "Critical";
    if (stress >= 1.5) return "High";
    if (stress >= 1.2) return "Medium";
    return "Low";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Image Preview Side */}
        <div className="relative h-64 md:h-auto bg-slate-900 overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Hazard Preview"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
          {prediction.hazardDetected && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-md text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Analyzed
            </div>
          )}
        </div>

        {/* Results Side */}
        <div className="p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-1">AI Prediction Result</h3>
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                  {prediction.hazardDetected ? prediction.hazardType : "No Hazard Detected"}
                </h2>
              </div>
              {prediction.hazardDetected && (
                <SeverityBadge severity={getSeverity(prediction.stressMultiplier)} />
              )}
            </div>

            {prediction.hazardDetected ? (
              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400 flex items-center gap-2">
                      <Crosshair className="w-4 h-4" /> Confidence Score
                    </span>
                    <span className="text-sm font-bold text-cyan-400">
                      {(prediction.confidenceScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prediction.confidenceScore * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-cyan-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-amber-400/80 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <p>This hazard applies a {prediction.stressMultiplier}x stress multiplier to routing algorithms.</p>
                </div>
              </div>
            ) : (
               <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 text-center">
                 <p className="text-slate-400">Our ML model did not detect any significant road hazards in this image. You can still submit it manually.</p>
               </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={onReset}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600"
              disabled={isSubmitting}
            >
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex-[2] px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                "Confirm & Submit Report"
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
