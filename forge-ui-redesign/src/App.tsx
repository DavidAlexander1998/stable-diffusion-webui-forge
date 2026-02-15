import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import WorkflowSidebar from './components/WorkflowSidebar';
import MainCanvas from './components/MainCanvas';
import ControlsPanel from './components/ControlsPanel';
import Header from './components/Header';
import ErrorModal from './components/ErrorModal';
import { WorkflowMode, ControlMode, GenerationParams } from './types';
import { useGeneration } from './hooks/useGeneration';
import { useProgress } from './hooks/useProgress';
import { useSettings } from './hooks/useSettings';
import './App.css';

function App() {
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>('txt2img');
  const [controlMode, setControlMode] = useState<ControlMode>('standard');
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Initialize params with proper API field names
  const [params, setParams] = useState<GenerationParams>({
    prompt: '',
    negative_prompt: '',
    width: 896,
    height: 1152,
    steps: 20,
    cfg_scale: 7,
    sampler_name: 'DPM++ 2M SDE Karras',
    scheduler: 'Karras',
    seed: -1,
    batch_count: 1,
    batch_size: 1,
    denoising_strength: 0.75,
    subseed: -1,
    subseed_strength: 0,
    clip_skip: 1,
    restore_faces: false,
    tiling: false,
    enable_hr: false,
    hr_scale: 2.0,
    hr_upscaler: 'Latent',
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
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    error: {
      title: string;
      message: string;
      details?: string;
      type?: 'network' | 'api' | 'validation' | 'unknown';
    };
  }>({
    isOpen: false,
    error: { title: '', message: '' }
  });

  // Use our custom hooks for real API integration
  const { generate, isGenerating, error: genError } = useGeneration();
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
  const { settings, updateSetting } = useSettings();

  // Handle generation errors
  useEffect(() => {
    if (genError) {
      console.error('Generation error:', genError);
      setErrorModal({
        isOpen: true,
        error: {
          title: 'Generation Failed',
          message: 'The image generation request could not be completed.',
          details: genError,
          type: genError.includes('fetch') || genError.includes('network') ? 'network' : 'api'
        }
      });
      stopPolling();
    }
  }, [genError, stopPolling]);

  // Auto-stop polling when generation completes
  useEffect(() => {
    if (!isGenerating && progressActive) {
      stopPolling();
    }
  }, [isGenerating, progressActive, stopPolling]);

  const handleGenerate = async () => {
    console.log('🚀 Starting generation with params:', params);

    // Build LoRA prompt if any
    let finalPrompt = params.prompt;
    if (params._loras && params._loras.length > 0) {
      const loraStrings = params._loras
        .filter((lora) => lora.enabled)
        .map((lora) => `<lora:${lora.model}:${lora.weight}>`)
        .join(' ');
      finalPrompt = `${params.prompt} ${loraStrings}`.trim();
    }

    // Prepare params for API
    const apiParams: GenerationParams = {
      ...params,
      prompt: finalPrompt,
    };

    // Remove internal fields
    delete apiParams._loras;

    // Start progress polling
    startPolling();

    // Add to queue for UI feedback
    const newJob = {
      id: Date.now(),
      params: { ...apiParams },
      status: 'generating',
      progress: 0,
    };
    setGenerationQueue((prev) => [...prev, newJob]);

    try {
      // Make real API call
      const result = await generate(apiParams, workflowMode);

      if (result && result.images && result.images.length > 0) {
        console.log('✅ Generation completed!', result);

        // Add to history
        setHistory((prev) => [
          {
            id: newJob.id,
            image: `data:image/png;base64,${result.images[0]}`,
            params: apiParams,
            timestamp: new Date(),
            info: result.info,
          },
          ...prev,
        ]);

        // Set as current result
        setLastResult(`data:image/png;base64,${result.images[0]}`);

        // Remove from queue
        setGenerationQueue((prev) => prev.filter((j) => j.id !== newJob.id));
      } else {
        throw new Error('No images in response');
      }
    } catch (err) {
      console.error('❌ Generation failed:', err);
      setGenerationQueue((prev) =>
        prev.map((j) => (j.id === newJob.id ? { ...j, status: 'failed' } : j))
      );
    } finally {
      stopPolling();
    }
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
    if (workflowMode !== 'img2img' && workflowMode !== 'inpaint') {
      setWorkflowMode('img2img');
    }
  };

  const handleImageRemove = () => {
    setUploadedImage(null);
  };

  return (
    <div className="app">
      {/* Animated grain overlay */}
      <div className="grain-overlay" />

      {/* Gradient mesh background */}
      <div className="gradient-mesh" />

      <Header selectedModel={selectedModel} onModelChange={setSelectedModel} />

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
            onGenerate={handleGenerate}
            onVariation={handleVariation}
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
    </div>
  );
}

export default App;
