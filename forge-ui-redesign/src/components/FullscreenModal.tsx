import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import './FullscreenModal.css';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  history?: any[];
  currentIndex?: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export default function FullscreenModal({
  isOpen,
  onClose,
  imageSrc,
  history = [],
  currentIndex = 0,
  onNavigate,
}: FullscreenModalProps) {
  const canNavigatePrev = history.length > 0 && currentIndex < history.length - 1;
  const canNavigateNext = history.length > 0 && currentIndex > 0;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleArrows = (e: KeyboardEvent) => {
      if (!onNavigate) return;

      if (e.key === 'ArrowLeft' && canNavigatePrev) {
        onNavigate('prev');
      } else if (e.key === 'ArrowRight' && canNavigateNext) {
        onNavigate('next');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleArrows);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleArrows);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, onNavigate, canNavigatePrev, canNavigateNext]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fullscreen-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="fullscreen-modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={imageSrc} alt="Fullscreen view" />

            {/* Close Button */}
            <button className="fullscreen-close-btn" onClick={onClose}>
              <X size={24} />
            </button>

            {/* Navigation Buttons */}
            {onNavigate && canNavigatePrev && (
              <button
                className="fullscreen-nav-btn fullscreen-nav-prev"
                onClick={() => onNavigate('prev')}
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {onNavigate && canNavigateNext && (
              <button
                className="fullscreen-nav-btn fullscreen-nav-next"
                onClick={() => onNavigate('next')}
              >
                <ChevronRight size={32} />
              </button>
            )}

            {/* Counter */}
            {history.length > 0 && (
              <div className="fullscreen-counter">
                {currentIndex + 1} / {history.length}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
