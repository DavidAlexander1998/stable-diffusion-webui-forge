import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import WorkflowSidebar from "./components/WorkflowSidebar";
import MainCanvas from "./components/MainCanvas";
import ControlsPanel from "./components/ControlsPanel";
import Header from "./components/Header";
import ErrorModal from "./components/ErrorModal";
import { ConfirmModal } from "./components/ConfirmModal";
import PresetManager from "./components/PresetManager";
import ShortcutsHelp from "./components/ShortcutsHelp";
import GalleryModal from "./components/GalleryModal";
import NotificationContainer from "./components/Notification";
import { WorkflowMode, ControlMode, GenerationParams } from "./types";
import { useGeneration } from "./hooks/useGeneration";
import { useProgress } from "./hooks/useProgress";
import { useSettings } from "./hooks/useSettings";
import { useNotifications } from "./hooks/useNotifications";
import {
  useKeyboardShortcuts,
  type KeyboardShortcut,
} from "./hooks/useKeyboardShortcuts";
import {
  downloadImage,
  ImageMetadata,
  extractBase64,
} from "./utils/imageUtils";
import { forgeAPI } from "./services/api";
import type { BatchItem, BatchOptions } from "./components/BatchPanel";
import type { ExtrasOptions } from "./components/ExtrasPanel";
import "./App.css";

function App() {
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>("txt2img");
  const { settings, updateSetting } = useSettings();
  const [controlMode, setControlMode] = useState<ControlMode>(
    settings.defaultControlMode ?? "standard",
  );
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingGenerate, setPendingGenerate] = useState(false);
  const [presetManagerOpen, setPresetManagerOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("");

  // Initialize params with proper API field names
  const [params, setParams] = useState<GenerationParams>({
    prompt: "",
    negative_prompt: "",
    width: 896,
    height: 1152,
    steps: 20,
    cfg_scale: 7,
    sampler_name: "DPM++ 2M SDE Karras",
    scheduler: "Karras",
    seed: -1,
    batch_count: 1,
    batch_size: 1,
    denoising_strength: 0.75,
    resize_mode: 0,
    inpainting_fill: 1,
    inpaint_full_res: true,
    inpaint_full_res_padding: 0,
    mask_blur: 4,
    subseed: -1,
    subseed_strength: 0,
    clip_skip: 1,
    restore_faces: false,
    tiling: false,
    enable_hr: false,
    hr_scale: 2.0,
    hr_upscaler: "Latent",
    hr_second_pass_steps: 0,
    hr_denoising_strength: 0.7,
    eta: undefined,
    s_churn: undefined,
    s_tmax: undefined,
    s_tmin: undefined,
    s_noise: undefined,
    override_settings: {},
    override_settings_restore_afterwards: true,
  });

  const [generationQueue, setGenerationQueue] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [inpaintMask, setInpaintMask] = useState<string | null>(null);
  const [usePreviousSeed, setUsePreviousSeed] = useState(false);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchOptions, setBatchOptions] = useState<BatchOptions>({
    operation: "img2img",
    upscaler: "None",
    scale: 2,
    useCodeformer: false,
    codeformerWeight: 0.5,
    tileUpscale: false,
  });
  const [batchRunning, setBatchRunning] = useState(false);
  const [extrasImage, setExtrasImage] = useState<string | null>(null);
  const [extrasOptions, setExtrasOptions] = useState<ExtrasOptions>({
    upscaler: "None",
    scale: 2,
    useCodeformer: false,
    codeformerWeight: 0.5,
    tileUpscale: false,
  });
  const [extrasRunning, setExtrasRunning] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    error: {
      title: string;
      message: string;
      details?: string;
      type?: "network" | "api" | "validation" | "unknown";
    };
  }>({
    isOpen: false,
    error: { title: "", message: "" },
  });

  // Use our custom hooks for real API integration
  const {
    generate,
    isGenerating,
    error: genError,
    interrupt,
  } = useGeneration();
  const {
    progress,
    eta,
    currentStep,
    totalSteps,
    previewImage,
    isGenerating: progressActive,
    startPolling,
    stopPolling,
  } = useProgress();

  const {
    notifications,
    removeNotification,
    success: notifySuccess,
    error: notifyError,
    info: notifyInfo,
  } = useNotifications();

  // Handle generation errors
  useEffect(() => {
    if (genError) {
      console.error("Generation error:", genError);
      notifyError("Generation Failed", genError);
      setErrorModal({
        isOpen: true,
        error: {
          title: "Generation Failed",
          message: "The image generation request could not be completed.",
          details: genError,
          type:
            genError.includes("fetch") || genError.includes("network")
              ? "network"
              : "api",
        },
      });
      stopPolling();
    }
  }, [genError, stopPolling, notifyError]);

  // Auto-stop polling when generation completes
  useEffect(() => {
    if (!isGenerating && progressActive) {
      stopPolling();
    }
  }, [isGenerating, progressActive, stopPolling]);

  // Define keyboard shortcuts
  const keyboardShortcuts = useMemo<KeyboardShortcut[]>(
    () => [
      // Generation shortcuts
      {
        key: "Enter",
        ctrl: true,
        description: "Start generation",
        category: "generation",
        handler: () => {
          if (
            workflowMode === "batch" &&
            !batchRunning &&
            batchItems.length > 0
          ) {
            handleBatchRun();
          } else if (
            workflowMode === "extras" &&
            !extrasRunning &&
            extrasImage
          ) {
            handleExtrasRun();
          } else if (!isGenerating && params.prompt.trim()) {
            handleGenerate();
          }
        },
      },
      {
        key: "i",
        ctrl: true,
        description: "Interrupt generation",
        category: "generation",
        handler: () => {
          interrupt();
        },
      },
      // Image actions
      {
        key: "s",
        ctrl: true,
        description: "Save current image",
        category: "image",
        handler: () => {
          if (history.length > 0) {
            downloadImage(history[0].image, history[0].params);
          }
        },
      },
      {
        key: "d",
        ctrl: true,
        description: "Download current image",
        category: "image",
        handler: () => {
          if (history.length > 0) {
            downloadImage(history[0].image, history[0].params);
          }
        },
      },
      // Presets
      {
        key: "s",
        ctrl: true,
        shift: true,
        description: "Save preset",
        category: "presets",
        handler: () => {
          setPresetManagerOpen(true);
        },
      },
      {
        key: "l",
        ctrl: true,
        shift: true,
        description: "Load preset",
        category: "presets",
        handler: () => {
          setPresetManagerOpen(true);
        },
      },
      // UI
      {
        key: "Escape",
        description: "Close modals",
        category: "ui",
        handler: () => {
          if (errorModal.isOpen) {
            setErrorModal((prev) => ({ ...prev, isOpen: false }));
          } else if (presetManagerOpen) {
            setPresetManagerOpen(false);
          } else if (galleryOpen) {
            setGalleryOpen(false);
          } else if (shortcutsHelpOpen) {
            setShortcutsHelpOpen(false);
          }
        },
      },
      {
        key: "?",
        description: "Show keyboard shortcuts",
        category: "ui",
        handler: () => {
          setShortcutsHelpOpen(true);
        },
      },
      {
        key: "/",
        ctrl: true,
        description: "Show keyboard shortcuts",
        category: "ui",
        handler: () => {
          setShortcutsHelpOpen(true);
        },
      },
      // Navigation
      {
        key: "ArrowLeft",
        description: "Previous image in history",
        category: "navigation",
        handler: () => {
          // TODO: Implement navigation
        },
      },
      {
        key: "ArrowRight",
        description: "Next image in history",
        category: "navigation",
        handler: () => {
          // TODO: Implement navigation
        },
      },
    ],
    [
      workflowMode,
      batchRunning,
      batchItems.length,
      extrasRunning,
      extrasImage,
      isGenerating,
      params.prompt,
      errorModal.isOpen,
      presetManagerOpen,
      galleryOpen,
      shortcutsHelpOpen,
      history,
      interrupt,
    ],
  );

  // Apply keyboard shortcuts
  useKeyboardShortcuts({
    enabled: true,
    shortcuts: keyboardShortcuts,
  });

  // Global drag-and-drop handler
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingFile(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only set to false if we're leaving the window
      if (e.target === document.body || e.target === document.documentElement) {
        setIsDraggingFile(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingFile(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];

      // Handle JSON files (presets)
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        try {
          const text = await file.text();
          const presetData = JSON.parse(text);

          // Check if it's a preset
          if (presetData.params) {
            handleLoadPreset(presetData);
            return;
          }
        } catch (err) {
          console.error("Failed to parse JSON:", err);
        }
      }

      // Handle image files
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          setUploadedImage(base64);

          // Switch to img2img mode
          if (workflowMode === "txt2img") {
            setWorkflowMode("img2img");
          }

          // Try to extract metadata from PNG
          if (file.type === "image/png") {
            try {
              // Extract metadata and load params if available
              // This would require a more sophisticated PNG metadata parser
              console.log("PNG metadata extraction not yet implemented");
            } catch (err) {
              console.error("Failed to extract metadata:", err);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    };

    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, [workflowMode]);

  const buildPromptWithLoras = (baseParams: GenerationParams) => {
    let finalPrompt = baseParams.prompt;
    if (baseParams._loras && baseParams._loras.length > 0) {
      const loraStrings = baseParams._loras
        .filter((lora) => lora.enabled)
        .map((lora) => `<lora:${lora.model}:${lora.weight}>`)
        .join(" ");
      finalPrompt = `${baseParams.prompt} ${loraStrings}`.trim();
    }
    return finalPrompt;
  };

  const normalizeImageData = (image: string) =>
    image.startsWith("data:") ? image : `data:image/png;base64,${image}`;

  const executeGenerate = async () => {
    console.log("🚀 Starting generation with params:", params);

    // Auto-enable Hires Fix for large resolutions if setting is enabled
    const effectiveParams = { ...params };
    if (
      settings.autoHiresFix &&
      (params.width > 1024 || params.height > 1024) &&
      !params.enable_hr
    ) {
      effectiveParams.enable_hr = true;
      effectiveParams.hr_scale = 2;
      effectiveParams.hr_upscaler = "Latent";
      console.log("🔧 Auto-enabled Hires Fix for large resolution");
    }

    // Prepare params for API
    const apiParams: GenerationParams = {
      ...effectiveParams,
      prompt: buildPromptWithLoras(effectiveParams),
    };

    if (
      uploadedImage &&
      (workflowMode === "img2img" || workflowMode === "inpaint")
    ) {
      apiParams.init_images = [extractBase64(uploadedImage)];
    }

    if (
      usePreviousSeed &&
      (workflowMode === "img2img" || workflowMode === "inpaint")
    ) {
      const lastSeed = history[0]?.params?.seed;
      if (typeof lastSeed === "number" && lastSeed >= 0) {
        apiParams.seed = lastSeed;
      }
    }

    if (workflowMode === "inpaint" && inpaintMask) {
      apiParams.mask = extractBase64(inpaintMask);
    }

    if (apiParams.alwayson_scripts?.controlnet?.args) {
      apiParams.alwayson_scripts = {
        ...apiParams.alwayson_scripts,
        controlnet: {
          args: apiParams.alwayson_scripts.controlnet.args.map((unit) => ({
            ...unit,
            input_image: unit.input_image
              ? extractBase64(unit.input_image)
              : undefined,
            mask: unit.mask ? extractBase64(unit.mask) : undefined,
          })),
        },
      };
    }

    // Remove internal fields
    delete apiParams._loras;

    // Start progress polling
    startPolling();

    // Add to queue for UI feedback
    const newJob = {
      id: Date.now(),
      params: { ...apiParams },
      status: "generating",
      progress: 0,
    };
    setGenerationQueue((prev) => [...prev, newJob]);

    try {
      // Make real API call
      const result = await generate(apiParams, workflowMode);

      if (result && result.images && result.images.length > 0) {
        console.log("✅ Generation completed!", result);

        const imageData = `data:image/png;base64,${result.images[0]}`;

        // Add to history
        setHistory((prev) => [
          {
            id: newJob.id,
            image: imageData,
            params: apiParams,
            timestamp: new Date(),
            info: result.info,
          },
          ...prev,
        ]);

        // Set as current result
        setLastResult(imageData);

        // Notify success
        notifySuccess(
          "Generation Complete",
          "Your image has been generated successfully",
        );

        // Auto-download if setting is enabled
        if (settings.autoSaveImages) {
          const metadata: ImageMetadata = {
            prompt: apiParams.prompt,
            negative_prompt: apiParams.negative_prompt,
            seed: apiParams.seed,
            steps: apiParams.steps,
            cfg_scale: apiParams.cfg_scale,
            sampler_name: apiParams.sampler_name,
            width: apiParams.width,
            height: apiParams.height,
            model: apiParams.sd_model_checkpoint,
          };

          await downloadImage(imageData, metadata, {
            format: settings.saveFormat,
            quality: settings.imageQuality / 100,
            embedMetadata: settings.embedMetadata,
          });
          notifyInfo("Image Saved", "Image downloaded automatically");
          console.log("📥 Auto-saved image");
        }

        // Remove from queue
        setGenerationQueue((prev) => prev.filter((j) => j.id !== newJob.id));
      } else {
        throw new Error("No images in response");
      }
    } catch (err) {
      console.error("❌ Generation failed:", err);
      setGenerationQueue((prev) =>
        prev.map((j) => (j.id === newJob.id ? { ...j, status: "failed" } : j)),
      );
    } finally {
      stopPolling();
    }
  };

  const handleGenerate = () => {
    // Show confirmation modal if setting is enabled
    if (settings.confirmBeforeGenerate) {
      setConfirmModalOpen(true);
      setPendingGenerate(true);
    } else {
      executeGenerate();
    }
  };

  const confirmGenerate = () => {
    setConfirmModalOpen(false);
    setPendingGenerate(false);
    executeGenerate();
  };

  const cancelGenerate = () => {
    setConfirmModalOpen(false);
    setPendingGenerate(false);
  };

  const handleLoadPreset = (presetParams: Partial<GenerationParams>) => {
    setParams((prev) => ({
      ...prev,
      ...presetParams,
    }));
  };

  const handleDeleteHistoryItem = (id: number) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleFavorite = (id: number) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item,
      ),
    );
  };

  const handleVariation = (variationParams: Partial<GenerationParams>) => {
    setParams((prev) => ({
      ...prev,
      ...variationParams,
    }));
  };

  const handleImageUpload = (base64: string) => {
    setUploadedImage(base64);
    // Automatically switch to img2img if not already
    if (workflowMode !== "img2img" && workflowMode !== "inpaint") {
      setWorkflowMode("img2img");
    }
  };

  const handleImageRemove = () => {
    setUploadedImage(null);
    setInpaintMask(null);
  };

  const handleBatchAddImages = (images: string[]) => {
    setBatchItems((prev) => [
      ...prev,
      ...images.map((image, index) => ({
        id: Date.now() + index,
        image,
        status: "queued" as const,
        overrideDenoising: params.denoising_strength ?? 0.75,
      })),
    ]);
  };

  const handleBatchUpdateItem = (id: number, updates: Partial<BatchItem>) => {
    setBatchItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const handleBatchRemoveItem = (id: number) => {
    setBatchItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleBatchClear = () => {
    setBatchItems([]);
  };

  const handleBatchRun = async () => {
    if (batchRunning || batchItems.length === 0) return;
    setBatchRunning(true);

    for (const item of batchItems) {
      setBatchItems((prev) =>
        prev.map((current) =>
          current.id === item.id
            ? { ...current, status: "processing" }
            : current,
        ),
      );

      try {
        if (
          batchOptions.operation === "img2img" ||
          batchOptions.operation === "inpaint"
        ) {
          const apiParams: GenerationParams = {
            ...params,
            prompt: buildPromptWithLoras({
              ...params,
              prompt: item.overridePrompt || params.prompt,
            }),
            init_images: [extractBase64(item.image)],
            denoising_strength:
              item.overrideDenoising ?? params.denoising_strength,
          };

          if (batchOptions.operation === "inpaint") {
            if (!item.mask) {
              throw new Error("Missing inpaint mask");
            }
            apiParams.mask = extractBase64(item.mask);
          }

          delete apiParams._loras;
          const result = await generate(
            apiParams,
            batchOptions.operation === "inpaint" ? "inpaint" : "img2img",
          );
          if (result?.images?.[0]) {
            const finalImage = normalizeImageData(result.images[0]);
            setHistory((prev) => [
              {
                id: Date.now(),
                image: finalImage,
                params: apiParams,
                timestamp: new Date(),
                info: result.info,
              },
              ...prev,
            ]);
            setBatchItems((prev) =>
              prev.map((current) =>
                current.id === item.id
                  ? { ...current, status: "done", result: finalImage }
                  : current,
              ),
            );
          } else {
            throw new Error("No batch image returned");
          }
        } else {
          const response = await forgeAPI.extraSingleImage({
            image: extractBase64(item.image),
            upscaler_1: batchOptions.upscaler,
            upscaling_resize: batchOptions.scale,
            use_codeformer: batchOptions.useCodeformer,
            codeformer_weight: batchOptions.codeformerWeight,
            gfpgan_visibility:
              batchOptions.operation === "face_restore" ? 1 : 0,
            tiling: batchOptions.tileUpscale,
          });

          const finalImage = normalizeImageData(response.image);
          setHistory((prev) => [
            {
              id: Date.now(),
              image: finalImage,
              params: params,
              timestamp: new Date(),
              info: "extras",
            },
            ...prev,
          ]);
          setBatchItems((prev) =>
            prev.map((current) =>
              current.id === item.id
                ? { ...current, status: "done", result: finalImage }
                : current,
            ),
          );
        }
      } catch (error) {
        console.error("Batch item failed:", error);
        setBatchItems((prev) =>
          prev.map((current) =>
            current.id === item.id ? { ...current, status: "failed" } : current,
          ),
        );
      }
    }

    setBatchRunning(false);
  };

  const handleExtrasRun = async () => {
    if (!extrasImage || extrasRunning) return;
    setExtrasRunning(true);

    try {
      const response = await forgeAPI.extraSingleImage({
        image: extractBase64(extrasImage),
        upscaler_1: extrasOptions.upscaler,
        upscaling_resize: extrasOptions.scale,
        use_codeformer: extrasOptions.useCodeformer,
        codeformer_weight: extrasOptions.codeformerWeight,
        gfpgan_visibility: extrasOptions.useCodeformer ? 1 : 0,
        tiling: extrasOptions.tileUpscale,
      });

      const finalImage = normalizeImageData(response.image);
      setHistory((prev) => [
        {
          id: Date.now(),
          image: finalImage,
          params: params,
          timestamp: new Date(),
          info: "extras",
        },
        ...prev,
      ]);
      setLastResult(finalImage);
    } catch (error) {
      console.error("Extras failed:", error);
    } finally {
      setExtrasRunning(false);
    }
  };

  return (
    <div className="app">
      {/* Animated grain overlay */}
      <div className="grain-overlay" />

      {/* Gradient mesh background */}
      <div className="gradient-mesh" />

      <Header
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onOpenPresets={() => setPresetManagerOpen(true)}
      />

      <div className="app-content">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <WorkflowSidebar
            currentMode={workflowMode}
            onModeChange={setWorkflowMode}
            history={history}
            onOpenGallery={() => setGalleryOpen(true)}
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="main-canvas-container"
        >
          <MainCanvas
            isGenerating={isGenerating}
            queue={generationQueue}
            history={history}
            workflowMode={workflowMode}
            uploadedImage={uploadedImage}
            inpaintMask={inpaintMask}
            onMaskChange={setInpaintMask}
            onGenerate={handleGenerate}
            onVariation={handleVariation}
            previewImage={previewImage}
            showLivePreview={settings.showLivePreview}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <ControlsPanel
            mode={controlMode}
            onModeChange={setControlMode}
            params={params}
            onParamsChange={setParams}
            workflowMode={workflowMode}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            progress={progress}
            currentStep={currentStep}
            totalSteps={totalSteps}
            uploadedImage={uploadedImage}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            settings={settings}
            onSettingsChange={updateSetting}
            usePreviousSeed={usePreviousSeed}
            onUsePreviousSeedChange={setUsePreviousSeed}
            batchItems={batchItems}
            batchOptions={batchOptions}
            onBatchOptionsChange={setBatchOptions}
            onBatchAddImages={handleBatchAddImages}
            onBatchUpdateItem={handleBatchUpdateItem}
            onBatchRemoveItem={handleBatchRemoveItem}
            onBatchClear={handleBatchClear}
            onBatchRun={handleBatchRun}
            batchRunning={batchRunning}
            extrasImage={extrasImage}
            extrasOptions={extrasOptions}
            onExtrasOptionsChange={setExtrasOptions}
            onExtrasImageSelect={setExtrasImage}
            onExtrasImageRemove={() => setExtrasImage(null)}
            onExtrasRun={handleExtrasRun}
            extrasRunning={extrasRunning}
          />
        </motion.div>
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        error={errorModal.error}
        onRetry={() => {
          setErrorModal({ ...errorModal, isOpen: false });
          // Retry the last generation
          if (params.prompt) {
            handleGenerate();
          }
        }}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onConfirm={confirmGenerate}
        onCancel={cancelGenerate}
        title="Confirm Generation"
        message="Are you sure you want to start generating an image with these parameters?"
      />

      {/* Preset Manager */}
      <PresetManager
        isOpen={presetManagerOpen}
        onClose={() => setPresetManagerOpen(false)}
        currentParams={params}
        onLoadPreset={handleLoadPreset}
        lastGeneratedImage={lastResult || undefined}
      />

      {/* Gallery Modal */}
      <GalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        history={history}
        onDelete={handleDeleteHistoryItem}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Keyboard Shortcuts Help */}
      <ShortcutsHelp
        isOpen={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
        shortcuts={keyboardShortcuts}
      />

      {/* Notification Toasts */}
      <NotificationContainer
        notifications={notifications}
        onDismiss={removeNotification}
      />

      {/* Drag and Drop Overlay */}
      {isDraggingFile && (
        <motion.div
          className="drag-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="drag-overlay-content">
            <div className="drag-overlay-icon">📁</div>
            <h2>Drop to Upload</h2>
            <p>Drop images to switch to img2img mode</p>
            <p>Drop JSON files to load presets</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default App;
