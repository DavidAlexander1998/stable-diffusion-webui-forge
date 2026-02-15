import { useState, useEffect, useRef, useCallback } from 'react';
import { forgeAPI } from '../services/api';
import type { ProgressResponse } from '../types';

export interface UseProgressReturn {
  progress: number;
  eta: number;
  currentStep: number;
  totalSteps: number;
  previewImage: string | null;
  isGenerating: boolean;
  startPolling: () => void;
  stopPolling: () => void;
}

export function useProgress(): UseProgressReturn {
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const intervalRef = useRef<number | null>(null);

  const pollProgress = useCallback(async () => {
    try {
      const data: ProgressResponse = await forgeAPI.getProgress();

      setProgress(data.progress);
      setEta(data.eta_relative);
      setCurrentStep(data.state.sampling_step);
      setTotalSteps(data.state.sampling_steps);
      setIsGenerating(data.progress > 0 && data.progress < 1);

      if (data.current_image) {
        setPreviewImage(data.current_image);
      }

      // Stop polling if generation is complete
      if (data.progress === 0 || data.state.interrupted || data.state.skipped) {
        setIsGenerating(false);
      }
    } catch (err) {
      console.error('Failed to poll progress:', err);
      // Don't stop polling on error - backend might be temporarily unavailable
    }
  }, []);

  const startPolling = useCallback(() => {
    if (intervalRef.current !== null) return;

    setIsGenerating(true);
    setProgress(0);
    setEta(0);
    setCurrentStep(0);
    setTotalSteps(0);
    setPreviewImage(null);

    // Poll every 500ms
    intervalRef.current = window.setInterval(pollProgress, 500);
  }, [pollProgress]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsGenerating(false);
    setProgress(0);
    setEta(0);
    setPreviewImage(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-stop polling when generation completes
  useEffect(() => {
    if (!isGenerating && intervalRef.current !== null) {
      stopPolling();
    }
  }, [isGenerating, stopPolling]);

  return {
    progress,
    eta,
    currentStep,
    totalSteps,
    previewImage,
    isGenerating,
    startPolling,
    stopPolling,
  };
}
