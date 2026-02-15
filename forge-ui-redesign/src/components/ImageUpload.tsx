import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import {
  fileToBase64,
  validateImageFile,
  getImageDimensions,
  formatFileSize,
} from '../utils/imageUtils';
import './ImageUpload.css';

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  onRemove: () => void;
  currentImage?: string;
  maxWidth?: number;
  maxHeight?: number;
  label?: string;
}

export default function ImageUpload({
  onImageSelect,
  onRemove,
  currentImage,
  maxWidth = 2048,
  maxHeight = 2048,
  label = 'Upload Image',
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      try {
        // Convert to base64
        const base64 = await fileToBase64(file);

        // Get dimensions
        const dims = await getImageDimensions(base64);
        setDimensions(dims);
        setFileSize(file.size);

        // Check if dimensions exceed limits
        if (dims.width > maxWidth || dims.height > maxHeight) {
          setError(
            `Image dimensions (${dims.width}x${dims.height}) exceed maximum (${maxWidth}x${maxHeight}). Image will be resized.`
          );
        }

        // Call parent handler
        onImageSelect(base64);
      } catch (err) {
        console.error('Failed to process image:', err);
        setError('Failed to process image. Please try another file.');
      }
    },
    [maxWidth, maxHeight, onImageSelect]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setError(null);
    setDimensions(null);
    setFileSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove();
  };

  return (
    <div className="image-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      <AnimatePresence mode="wait">
        {currentImage ? (
          <motion.div
            key="preview"
            className="image-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <img src={currentImage} alt="Uploaded" />

            {/* Image Info Overlay */}
            <div className="image-info-overlay">
              {dimensions && (
                <span className="image-dimensions">
                  {dimensions.width} × {dimensions.height}
                </span>
              )}
              {fileSize && (
                <span className="image-filesize">{formatFileSize(fileSize)}</span>
              )}
            </div>

            {/* Remove Button */}
            <button className="image-remove-btn" onClick={handleRemove} title="Remove image">
              <X size={18} />
            </button>

            {/* Replace Button */}
            <button className="image-replace-btn" onClick={handleClick} title="Replace image">
              <Upload size={16} />
              <span>Replace</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            className={`image-dropzone ${isDragging ? 'dragging' : ''}`}
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <motion.div
              className="dropzone-icon-container"
              animate={
                isDragging
                  ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }
                  : {}
              }
              transition={{
                duration: 0.5,
                repeat: isDragging ? Infinity : 0,
              }}
            >
              {isDragging ? (
                <ImageIcon size={48} className="dropzone-icon" />
              ) : (
                <Upload size={48} className="dropzone-icon" />
              )}
            </motion.div>

            <h4 className="dropzone-title">
              {isDragging ? 'Drop image here' : label}
            </h4>
            <p className="dropzone-subtitle">
              {isDragging ? 'Release to upload' : 'Drag and drop or click to browse'}
            </p>
            <p className="dropzone-hint">
              PNG, JPEG, WebP • Max {maxWidth}×{maxHeight} • Up to 10MB
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="upload-error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
