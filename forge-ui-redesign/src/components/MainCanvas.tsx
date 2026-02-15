import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Share2,
  Repeat,
  Maximize2,
  Loader2,
  Check,
} from "lucide-react";
import {
  downloadImage,
  downloadAllImages,
  copyImageToClipboard,
  copyParamsAsText,
  exportParamsAsJSON,
} from "../utils/imageUtils";
import InpaintCanvas from "./InpaintCanvas";
import FullscreenModal from "./FullscreenModal";
import "./MainCanvas.css";
import type { WorkflowMode } from "../types";

interface MainCanvasProps {
  isGenerating: boolean;
  queue: any[];
  history: any[];
  workflowMode: WorkflowMode;
  uploadedImage?: string | null;
  inpaintMask?: string | null;
  onMaskChange?: (maskDataUrl: string | null) => void;
  onGenerate: () => void;
  onVariation?: (params: any) => void;
  previewImage?: string | null;
  showLivePreview?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export default function MainCanvas({
  isGenerating,
  queue,
  history,
  workflowMode,
  uploadedImage,
  inpaintMask,
  onMaskChange,
  onGenerate,
  onVariation,
  previewImage,
  showLivePreview = true,
  currentStep = 0,
  totalSteps = 0,
}: MainCanvasProps) {
  const latestImage = history[0];
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [shareNotification, setShareNotification] = useState<
    "image" | "params" | null
  >(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [variationMenuOpen, setVariationMenuOpen] = useState(false);

  const handleDownload = async () => {
    if (!latestImage) return;
    await downloadImage(latestImage.image, latestImage.params);
  };

  const handleShareCopyImage = async () => {
    if (!latestImage) return;

    // Try to copy image first
    const imageCopied = await copyImageToClipboard(latestImage.image);

    if (imageCopied) {
      setShareNotification("image");
      setTimeout(() => setShareNotification(null), 2000);
    }
  };

  const handleShareCopyParams = () => {
    if (!latestImage) return;
    const paramsCopied = copyParamsAsText(latestImage.params);
    if (paramsCopied) {
      setShareNotification("params");
      setTimeout(() => setShareNotification(null), 2000);
    }
  };

  const handleShareExportJson = () => {
    if (!latestImage) return;
    exportParamsAsJSON(latestImage.params);
  };

  const handleShareLink = async () => {
    if (!latestImage) return;
    try {
      if (!navigator.share) {
        handleShareCopyParams();
        return;
      }

      const response = await fetch(latestImage.image);
      const blob = await response.blob();
      const file = new File([blob], "forge-share.png", { type: blob.type });
      await navigator.share({
        title: "Forge Generation",
        text: latestImage.params?.prompt || "Forge image",
        files: [file],
        url: window.location.href,
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handleVariation = () => {
    if (!latestImage || !onVariation) return;

    // Create variation with slight seed modification
    const variationParams = {
      ...latestImage.params,
      seed: -1, // Random seed
      subseed_strength: 0.1, // Small variation
    };

    onVariation(variationParams);
    onGenerate();
  };

  const handleUpscale = () => {
    if (!latestImage || !onVariation) return;

    onVariation({
      ...latestImage.params,
      enable_hr: true,
      hr_scale: latestImage.params.hr_scale ?? 2.0,
      hr_denoising_strength: latestImage.params.hr_denoising_strength ?? 0.4,
    });
    onGenerate();
  };

  const handleFullscreen = () => {
    setFullscreenIndex(0);
    setShowFullscreen(true);
  };

  const handleDownloadAll = async () => {
    if (history.length === 0) return;
    await downloadAllImages(history);
  };

  const handleFullscreenNavigate = (direction: "prev" | "next") => {
    if (direction === "prev" && fullscreenIndex < history.length - 1) {
      setFullscreenIndex(fullscreenIndex + 1);
    } else if (direction === "next" && fullscreenIndex > 0) {
      setFullscreenIndex(fullscreenIndex - 1);
    }
  };

  const currentFullscreenImage =
    history[fullscreenIndex]?.image || latestImage?.image;

  const showInpaintCanvas =
    workflowMode === "inpaint" && uploadedImage && onMaskChange;
  const showSourcePreview =
    workflowMode === "img2img" && uploadedImage && !latestImage;

  return (
    <>
      <div className="main-canvas card">
        {/* Preview Area */}
        <div className="canvas-preview">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="generating"
                className="generating-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {showLivePreview && previewImage ? (
                  <div className="preview-container">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="preview-image"
                    />
                    <div className="preview-overlay">
                      <div className="generating-spinner">
                        <Loader2 size={32} className="spinner-icon" />
                      </div>
                      <p className="generating-subtitle">
                        Step {currentStep} / {totalSteps}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="generating-spinner">
                      <Loader2 size={48} className="spinner-icon" />
                    </div>
                    <h3 className="generating-title">Generating Image...</h3>
                    <div className="generating-progress">
                      <motion.div
                        className="progress-bar"
                        initial={{ width: 0 }}
                        animate={{ width: "75%" }}
                        transition={{ duration: 3, ease: "linear" }}
                      />
                    </div>
                    <p className="generating-subtitle">
                      Step {currentStep} / {totalSteps}
                    </p>
                  </>
                )}
              </motion.div>
            ) : showInpaintCanvas ? (
              <motion.div
                key="inpaint"
                className="image-display"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <InpaintCanvas
                  baseImage={uploadedImage as string}
                  maskImage={inpaintMask}
                  onMaskChange={
                    onMaskChange as (maskDataUrl: string | null) => void
                  }
                />
              </motion.div>
            ) : latestImage ? (
              <motion.div
                key="image"
                className="image-display"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <img src={latestImage.image} alt="Generated" />

                {/* Image Actions Overlay */}
                <div className="image-actions">
                  <button
                    className="image-action-btn"
                    title="Download"
                    onClick={handleDownload}
                  >
                    <Download size={18} />
                  </button>
                  <button
                    className="image-action-btn"
                    title="Share"
                    onClick={() => setShareMenuOpen((prev) => !prev)}
                  >
                    <Share2 size={18} />
                    {shareNotification && (
                      <motion.div
                        className="share-notification"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <Check size={12} />
                        {shareNotification === "image"
                          ? "Copied!"
                          : "Params copied!"}
                      </motion.div>
                    )}
                    {shareMenuOpen && (
                      <div className="image-action-menu">
                        <button
                          type="button"
                          onClick={() => {
                            handleShareCopyImage();
                            setShareMenuOpen(false);
                          }}
                        >
                          Copy Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleShareCopyParams();
                            setShareMenuOpen(false);
                          }}
                        >
                          Copy Params
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleShareExportJson();
                            setShareMenuOpen(false);
                          }}
                        >
                          Export JSON
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleShareLink();
                            setShareMenuOpen(false);
                          }}
                        >
                          Share Link
                        </button>
                      </div>
                    )}
                  </button>
                  <button
                    className="image-action-btn"
                    title="Variations"
                    onClick={() => setVariationMenuOpen((prev) => !prev)}
                  >
                    <Repeat size={18} />
                    {variationMenuOpen && (
                      <div className="image-action-menu">
                        <button
                          type="button"
                          onClick={() => {
                            handleVariation();
                            setVariationMenuOpen(false);
                          }}
                        >
                          Random Variation
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpscale();
                            setVariationMenuOpen(false);
                          }}
                        >
                          Upscale (Hires Fix)
                        </button>
                      </div>
                    )}
                  </button>
                  {history.length > 1 && (
                    <button
                      className="image-action-btn"
                      title="Download All"
                      onClick={handleDownloadAll}
                    >
                      <Download size={18} />
                    </button>
                  )}
                  <button
                    className="image-action-btn"
                    title="Fullscreen"
                    onClick={handleFullscreen}
                  >
                    <Maximize2 size={18} />
                  </button>
                </div>
              </motion.div>
            ) : showSourcePreview ? (
              <motion.div
                key="source"
                className="image-display"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <img src={uploadedImage as string} alt="Source" />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="empty-canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="empty-icon-container">
                  <motion.div
                    className="empty-icon"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    ✨
                  </motion.div>
                </div>
                <h3 className="empty-title">Ready to Create</h3>
                <p className="empty-subtitle">
                  Enter a prompt and hit generate to begin
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Generation Queue */}
        {queue.length > 0 && (
          <motion.div
            className="generation-queue"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="queue-header">
              <span className="queue-title">Generation Queue</span>
              <span className="queue-count">{queue.length} pending</span>
            </div>
            <div className="queue-items">
              {queue.map((item) => (
                <div key={item.id} className="queue-item">
                  <div className="queue-item-indicator" />
                  <div className="queue-item-details">
                    <span className="queue-item-prompt">
                      {item.params.prompt.slice(0, 40)}...
                    </span>
                    <span className="queue-item-status">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* History Carousel */}
        {history.length > 1 && (
          <div className="history-carousel">
            <div className="carousel-title">Recent Generations</div>
            <div className="carousel-track">
              {history.slice(1, 7).map((item, index) => (
                <motion.div
                  key={item.id}
                  className="carousel-item"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                >
                  <img src={item.image} alt={`Generation ${item.id}`} />
                  <div className="carousel-item-overlay">
                    <span className="carousel-item-time">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <FullscreenModal
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        imageSrc={currentFullscreenImage}
        history={history}
        currentIndex={fullscreenIndex}
        onNavigate={handleFullscreenNavigate}
      />
    </>
  );
}
