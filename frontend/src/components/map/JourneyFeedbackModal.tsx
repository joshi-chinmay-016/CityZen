"use client";

import React from "react";
import RatingPopup from "./RatingPopup";

interface JourneyFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  startLocation: string;
  endLocation: string;
  onSuccess: () => void;
}

export default function JourneyFeedbackModal({
  isOpen,
  onClose,
  startLocation,
  endLocation,
  onSuccess,
}: JourneyFeedbackModalProps) {
  return (
    <RatingPopup
      isOpen={isOpen}
      onClose={onClose}
      startLocation={startLocation}
      endLocation={endLocation}
      onSuccess={onSuccess}
    />
  );
}
