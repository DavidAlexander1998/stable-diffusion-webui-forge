import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, X } from 'lucide-react';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="confirm-modal-overlay" onClick={onCancel}>
        <motion.div
          className="confirm-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="confirm-modal-header">
            <AlertCircle size={24} className="confirm-icon" />
            <h3>{title}</h3>
          </div>

          <div className="confirm-modal-body">
            <p>{message}</p>
          </div>

          <div className="confirm-modal-actions">
            <button className="confirm-cancel-btn" onClick={onCancel}>
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button className="confirm-ok-btn" onClick={onConfirm}>
              <Check size={16} />
              <span>Generate</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
