"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export default function ImageUploader({ onFileSelect, isLoading }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 ${
        isDragging
          ? "border-cyan-400 bg-cyan-500/10"
          : "border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/60"
      } backdrop-blur-sm overflow-hidden`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        disabled={isLoading}
      />

      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <motion.div
          animate={{ y: isDragging ? -5 : 0 }}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
            isDragging ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-700/50 text-slate-400"
          }`}
        >
          <UploadCloud className="w-8 h-8" />
        </motion.div>
        
        <h3 className="text-xl font-bold text-slate-200 mb-2">
          {isDragging ? "Drop image here" : "Upload Hazard Image"}
        </h3>
        <p className="text-slate-400 max-w-sm">
          Drag and drop an image of the road hazard, or click to browse from your device.
        </p>
        
        <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-full">
          <ImageIcon className="w-4 h-4" />
          Supports JPG, PNG, WEBP up to 10MB
        </div>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-20"
          >
            <div className="w-12 h-12 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin mb-4" />
            <p className="text-cyan-400 font-medium animate-pulse">Analyzing with CityZen ML...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
