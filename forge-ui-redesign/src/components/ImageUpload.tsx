import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import {
  fileToBase64,
  validateImageFile,
  getImageDimensions,
  formatFileSize,
  resizeImageIfNeeded,
  resizeImageToCover,
} from "../utils/imageUtils";
import "./ImageUpload.css";

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  onImagesSelect?: (base64List: string[]) => void;
  onRemove: () => void;
  currentImage?: string;
  allowMultiple?: boolean;
  maxFiles?: number;
  maxWidth?: number;
  maxHeight?: number;
  label?: string;
}

export default function ImageUpload({
  onImageSelect,
  onImagesSelect,
  onRemove,
  currentImage,
  allowMultiple = false,
  maxFiles = 10,
  maxWidth = 2048,
  maxHeight = 2048,
  label = "Upload Image",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [originalBase64, setOriginalBase64] = useState<string | null>(null);
  const [resizeMode, setResizeMode] = useState<"fit" | "crop">("fit");
  const [needsResize, setNeedsResize] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyResizeMode = useCallback(
    async (base64: string, dims: { width: number; height: number }) => {
      if (dims.width <= maxWidth && dims.height <= maxHeight) {
        setNeedsResize(false);
        return base64;
      }

      setNeedsResize(true);
      if (resizeMode === "crop") {
        return resizeImageToCover(base64, maxWidth, maxHeight);
      }

      return resizeImageIfNeeded(base64, maxWidth, maxHeight);
    },
    [maxHeight, maxWidth, resizeMode],
  );

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        setOriginalBase64(base64);

        const dims = await getImageDimensions(base64);
        setOriginalDimensions(dims);
        let finalBase64 = await applyResizeMode(base64, dims);
        let finalDims = dims;
        setFileSize(file.size);

        if (dims.width > maxWidth || dims.height > maxHeight) {
          setError(
            `Image dimensions (${dims.width}x${dims.height}) exceed maximum (${maxWidth}x${maxHeight}). Resize tools are available.`,
          );
        }

        if (finalBase64 !== base64) {
          finalDims = await getImageDimensions(finalBase64);
        }

        setDimensions(finalDims);

        // Call parent handler
        onImageSelect(finalBase64);
      } catch (err) {
        console.error("Failed to process image:", err);
        setError("Failed to process image. Please try another file.");
      }
    },
    [applyResizeMode, maxHeight, maxWidth, onImageSelect],
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!allowMultiple) {
        if (files[0]) {
          await handleFile(files[0]);
        }
        return;
      }

      const limitedFiles = files.slice(0, maxFiles);
      const base64List: string[] = [];

      for (const file of limitedFiles) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          return;
        }

        const base64 = await fileToBase64(file);
        base64List.push(base64);
      }

      if (onImagesSelect) {
        onImagesSelect(base64List);
      } else if (base64List[0]) {
        onImageSelect(base64List[0]);
      }
    },
    [allowMultiple, handleFile, maxFiles, onImageSelect, onImagesSelect],
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
      handleFiles(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(Array.from(files));
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setError(null);
    setDimensions(null);
    setOriginalDimensions(null);
    setFileSize(null);
    setOriginalBase64(null);
    setNeedsResize(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove();
  };

  useEffect(() => {
    const reapplyResize = async () => {
      if (!originalBase64 || !originalDimensions || !needsResize) return;
      const updatedBase64 = await applyResizeMode(
        originalBase64,
        originalDimensions,
      );
      if (updatedBase64 !== currentImage) {
        onImageSelect(updatedBase64);
      }
    };

    reapplyResize();
  }, [
    applyResizeMode,
    currentImage,
    needsResize,
    onImageSelect,
    originalBase64,
    originalDimensions,
  ]);

  return (
    <div className="image-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple={allowMultiple}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
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
                <span className="image-filesize">
                  {formatFileSize(fileSize)}
                </span>
              )}
            </div>

            {needsResize && (
              <div className="image-resize-controls">
                <span>Resize Mode</span>
                <div className="resize-toggle">
                  <button
                    className={resizeMode === "fit" ? "active" : ""}
                    onClick={() => setResizeMode("fit")}
                    type="button"
                  >
                    Fit
                  </button>
                  <button
                    className={resizeMode === "crop" ? "active" : ""}
                    onClick={() => setResizeMode("crop")}
                    type="button"
                  >
                    Crop
                  </button>
                </div>
              </div>
            )}

            {/* Remove Button */}
            <button
              className="image-remove-btn"
              onClick={handleRemove}
              title="Remove image"
            >
              <X size={18} />
            </button>

            {/* Replace Button */}
            <button
              className="image-replace-btn"
              onClick={handleClick}
              title="Replace image"
            >
              <Upload size={16} />
              <span>Replace</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            className={`image-dropzone ${isDragging ? "dragging" : ""}`}
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
              {isDragging ? "Drop image here" : label}
            </h4>
            <p className="dropzone-subtitle">
              {isDragging
                ? "Release to upload"
                : "Drag and drop or click to browse"}
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
            animate={{ opacity: 1, height: "auto" }}
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
