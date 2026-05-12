"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import ImageUploader from "./ImageUploader";
import ReportPreview from "./ReportPreview";
import { mlService, MLPredictionResponse } from "@/services/mlService";
import { reportService } from "@/services/reportService";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<MLPredictionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    
    // Create object URL for local preview
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    
    // Send to ML service for prediction
    setIsPredicting(true);
    try {
      // Add slight artificial delay to show off the fancy loading state if API is too fast
      const [result] = await Promise.all([
        mlService.predictHazard(selectedFile),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      setPrediction(result);
      toast.success("AI Analysis Complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze image. Please try again.");
      handleReset();
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSubmit = async () => {
    if (!file || !prediction) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("hazardType", prediction.hazardType);
      formData.append("confidenceScore", prediction.confidenceScore.toString());
      formData.append("stressMultiplier", prediction.stressMultiplier.toString());
      // Here you would also grab and append geolocation
      
      await reportService.uploadReport(formData);
      toast.success("Report successfully submitted to CityZen!");
      
      // Reset form after 2 seconds
      setTimeout(() => {
        handleReset();
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit report. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPrediction(null);
    setIsPredicting(false);
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Toast notifications provider */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#06b6d4',
              secondary: '#fff',
            },
          },
        }} 
      />

      <AnimatePresence mode="wait">
        {!prediction ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
          >
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-100 mb-2">Report a Hazard</h2>
              <p className="text-slate-400">Help improve urban mobility by reporting road issues.</p>
            </div>
            
            <ImageUploader 
              onFileSelect={handleFileSelect} 
              isLoading={isPredicting} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <ReportPreview 
              imageFile={file!}
              previewUrl={previewUrl!}
              prediction={prediction}
              onReset={handleReset}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
