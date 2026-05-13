"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, AlertCircle, MapPin, X } from 'lucide-react';
import { feedbackService, IssueType, JourneyRating, getRatingSeverity } from '@/services/feedbackService';
import toast from 'react-hot-toast';

interface RatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  startLocation: string;
  endLocation: string;
  onSuccess?: () => void;
}

const ISSUE_TYPES: IssueType[] = ['pothole', 'crack', 'manhole', 'traffic', 'unsafe_road'];

export const RatingPopup: React.FC<RatingPopupProps> = ({
  isOpen,
  onClose,
  startLocation,
  endLocation,
  onSuccess,
}) => {
  const [rating, setRating] = useState<JourneyRating | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [issueType, setIssueType] = useState<IssueType | ''>('');
  const [landmark, setLandmark] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show details form when rating <= 2
  useEffect(() => {
    if (rating && rating <= 2) {
      setShowDetails(true);
    } else {
      setShowDetails(false);
      setIssueType('');
      setLandmark('');
      setComments('');
    }
  }, [rating]);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    if (rating <= 2 && !issueType) {
      toast.error('Please select an issue type');
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackService.submitJourneyFeedback({
        start: startLocation,
        destination: endLocation,
        rating,
        issueType: rating <= 2 ? (issueType as IssueType) : undefined,
        severity: getRatingSeverity(rating),
        landmark: rating <= 2 ? landmark : undefined,
        comments,
      });

      toast.success('Thank you for your feedback!');
      setRating(null);
      setIssueType('');
      setLandmark('');
      setComments('');
      onClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(null);
    setIssueType('');
    setLandmark('');
    setComments('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-6 text-white relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X size={20} />
                </button>
                <h2 className="text-2xl font-bold mb-2">Journey Complete!</h2>
                <p className="text-sm opacity-90">How was your experience?</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Route Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="font-semibold">{startLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 ml-6">
                    <span>→</span>
                    <span className="font-semibold">{endLocation}</span>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Rate your journey
                  </label>
                  <div className="flex justify-center gap-2">
                    {([1, 2, 3, 4, 5] as const).map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setRating(star)}
                        className={`p-2 rounded-lg transition-all ${
                          rating === star
                            ? 'bg-yellow-100'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <Star
                          size={28}
                          className={`${
                            rating && rating >= star
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Rating Label */}
                {rating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <p className="text-sm text-gray-600">
                      {rating === 1 && '😞 Poor'}
                      {rating === 2 && '😐 Fair'}
                      {rating === 3 && '🙂 Good'}
                      {rating === 4 && '😊 Very Good'}
                      {rating === 5 && '🎉 Excellent'}
                    </p>
                  </motion.div>
                )}

                {/* Details Form */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 border-t"
                    >
                      {/* Alert */}
                      <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg">
                        <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                          We'd like to know what went wrong so we can improve routes.
                        </p>
                      </div>

                      {/* Issue Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          What was the issue?
                        </label>
                        <select
                          value={issueType}
                          onChange={(e) => setIssueType(e.target.value as IssueType)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        >
                          <option value="">Select issue type...</option>
                          {ISSUE_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Landmark */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nearby landmark (optional)
                        </label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="e.g., Near Sony Signal"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>

                      {/* Comments */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Additional comments (optional)
                        </label>
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Tell us more about the issue..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold disabled:opacity-50"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!rating || isSubmitting}
                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RatingPopup;
