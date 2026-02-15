import React from 'react';
import { X, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import './ErrorModal.css';

export interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: {
    title: string;
    message: string;
    details?: string;
    type?: 'network' | 'api' | 'validation' | 'unknown';
  };
  onRetry?: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  error,
  onRetry
}) => {
  if (!isOpen) return null;

  const handleCopyDetails = () => {
    const details = `Error: ${error.title}\n\nMessage: ${error.message}${error.details ? `\n\nDetails: ${error.details}` : ''}`;
    navigator.clipboard.writeText(details);
  };

  const getSuggestion = () => {
    switch (error.type) {
      case 'network':
        return 'Check that the Forge backend is running on localhost:7860 and that the API is enabled with the --api flag.';
      case 'api':
        return 'The Forge API may not be available. Ensure the backend is running with --api flag enabled.';
      case 'validation':
        return 'Please check your input parameters and try again.';
      default:
        return 'Please try again or check the console for more details.';
    }
  };

  return (
    <div className="error-modal-overlay" onClick={onClose}>
      <div className="error-modal" onClick={(e) => e.stopPropagation()}>
        <div className="error-modal-header">
          <div className="error-modal-icon">
            <AlertCircle size={24} />
          </div>
          <h2>{error.title}</h2>
          <button className="error-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="error-modal-content">
          <p className="error-message">{error.message}</p>

          {error.details && (
            <div className="error-details">
              <div className="error-details-label">Technical Details:</div>
              <div className="error-details-text">{error.details}</div>
            </div>
          )}

          <div className="error-suggestion">
            <strong>Suggestion:</strong> {getSuggestion()}
          </div>
        </div>

        <div className="error-modal-actions">
          <button className="error-btn error-btn-secondary" onClick={handleCopyDetails}>
            <Copy size={16} />
            Copy Details
          </button>
          {onRetry && (
            <button className="error-btn error-btn-primary" onClick={onRetry}>
              <RefreshCw size={16} />
              Retry
            </button>
          )}
          <button className="error-btn error-btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
