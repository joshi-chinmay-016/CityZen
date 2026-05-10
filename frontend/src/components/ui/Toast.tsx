"use client";

import React from "react";
import { toast as hotToast, Toast as HotToastType } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface CustomToastProps {
  t: HotToastType;
  title: string;
  message?: string;
  type?: "success" | "error" | "info";
}

const CustomToastUI = ({ t, title, message, type = "info" }: CustomToastProps) => {
  const isVisible = t.visible;

  const iconMap = {
    success: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
    error: <AlertCircle className="w-6 h-6 text-rose-400" />,
    info: <Info className="w-6 h-6 text-cyan-400" />,
  };

  const borderMap = {
    success: "border-emerald-500/30",
    error: "border-rose-500/30",
    info: "border-cyan-500/30",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className={`flex items-start gap-4 p-4 min-w-[320px] max-w-md bg-slate-900/90 backdrop-blur-xl border ${borderMap[type]} rounded-2xl shadow-2xl pointer-events-auto`}
        >
          <div className="shrink-0 mt-0.5">{iconMap[type]}</div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-100">{title}</h4>
            {message && <p className="text-xs text-slate-400 mt-1">{message}</p>}
          </div>
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className="shrink-0 p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Exportable utility object to trigger toasts anywhere
export const Toast = {
  success: (title: string, message?: string) => {
    hotToast.custom((t) => <CustomToastUI t={t} title={title} message={message} type="success" />, {
      duration: 4000,
    });
  },
  error: (title: string, message?: string) => {
    hotToast.custom((t) => <CustomToastUI t={t} title={title} message={message} type="error" />, {
      duration: 5000,
    });
  },
  info: (title: string, message?: string) => {
    hotToast.custom((t) => <CustomToastUI t={t} title={title} message={message} type="info" />, {
      duration: 4000,
    });
  },
  dismiss: hotToast.dismiss,
};

// Export the underlying UI component in case users want to render it manually
export default CustomToastUI;
