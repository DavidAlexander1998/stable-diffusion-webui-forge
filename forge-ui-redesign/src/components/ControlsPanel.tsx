import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minimize2,
  Maximize2,
  Sparkles,
  Dices,
  ChevronDown,
  Settings,
  Zap,
} from 'lucide-react';
import { ControlMode, GenerationParams, WorkflowMode, PromptType, LoRAConfig } from '../types';
import { AppSettings } from '../hooks/useSettings';
import { LoraPanel } from './LoraPanel';
import { HiresFixPanel } from './HiresFixPanel';
import ImageUpload from './ImageUpload';
import { useModels } from '../hooks/useModels';
import './ControlsPanel.css';

interface ControlsPanelProps {
  mode: ControlMode;
  onModeChange: (mode: ControlMode) => void;
  params: GenerationParams;
  onParamsChange: (params: GenerationParams) => void;
  workflowMode: WorkflowMode;
  onGenerate?: () => void;
  isGenerating?: boolean;
  progress?: number;
  currentStep?: number;
  totalSteps?: number;
  uploadedImage?: string | null;
  onImageUpload?: (base64: string) => void;
  onImageRemove?: () => void;
  settings?: AppSettings;
  onSettingsChange?: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const ASPECT_RATIOS = [
  { label: '1:1', width: 1024, height: 1024 },
  { label: '16:9', width: 1024, height: 576 },
  { label: '9:16', width: 576, height: 1024 },
  { label: '4:3', width: 1024, height: 768 },
  { label: '3:4', width: 768, height: 1024 },
  { label: '7:9', width: 896, height: 1152 },
];

export default function ControlsPanel({
  mode,
  onModeChange,
  params,
  onParamsChange,
  workflowMode,
  onGenerate,
  settings,
  onSettingsChange,
  isGenerating = false,
  progress = 0,
  currentStep = 0,
  totalSteps = 0,
  uploadedImage,
  onImageUpload,
  onImageRemove,
}: ControlsPanelProps) {
  const [showSampling, setShowSampling] = useState(false);
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [showGeneration, setShowGeneration] = useState(false);
  const [showLoRA, setShowLoRA] = useState(false);
  const [showHiresFix, setShowHiresFix] = useState(false);
  const [showAdvancedSampling, setShowAdvancedSampling] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [promptType, setPromptType] = useState<PromptType>('simple');

  // Get models from API
  const {
    samplers,
    schedulers,
    upscalers,
    loraModels,
    sdModels,
    vaes,
    isLoading: modelsLoading,
    refreshLoras,
  } = useModels();

  // Initialize loras if not present
  const [loras, setLoras] = useState<LoRAConfig[]>([]);

  useEffect(() => {
    if (params._loras) {
      setLoras(params._loras);
    }
  }, [params._loras]);

  const handleLorasChange = (newLoras: LoRAConfig[]) => {
    setLoras(newLoras);
    onParamsChange({ ...params, _loras: newLoras });
  };

  const isMinimal = mode === 'minimal';
  const isStandard = mode === 'standard';
  const isAdvanced = mode === 'advanced';
  const isExpert = mode === 'expert';

  // Show different sections based on control mode
  const showLoRAPanel = isAdvanced || isExpert;
  const showHiresPanel = isAdvanced || isExpert;
  const showAdvancedParams = isExpert;

  return (
    <div className="controls-panel card">
      {/* Mode Toggle */}
      <div className="controls-header">
        <h3 className="controls-title">Controls</h3>
        <div className="mode-toggles">
          <button
            className={`mode-toggle ${mode === 'minimal' ? 'active' : ''}`}
            onClick={() => onModeChange('minimal')}
            title="Minimal Mode"
          >
            <Minimize2 size={14} />
          </button>
          <button
            className={`mode-toggle ${mode === 'standard' ? 'active' : ''}`}
            onClick={() => onModeChange('standard')}
            title="Standard Mode"
          >
            <Maximize2 size={14} />
          </button>
          <button
            className={`mode-toggle ${mode === 'advanced' ? 'active' : ''}`}
            onClick={() => onModeChange('advanced')}
            title="Advanced Mode"
          >
            <Zap size={14} />
          </button>
          <button
            className={`mode-toggle ${mode === 'expert' ? 'active' : ''}`}
            onClick={() => onModeChange('expert')}
            title="Expert Mode"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Prompt Type Selector */}
      <div className="control-section">
        <label className="control-label">Prompt Type</label>
        <select
          value={promptType}
          onChange={(e) => setPromptType(e.target.value as PromptType)}
          className="prompt-type-select"
        >
          <option value="simple">Simple</option>
          <option value="advanced">Advanced (Attention)</option>
          <option value="structured">Structured (Tags)</option>
          <option value="wildcard">Wildcard</option>
        </select>
      </div>

      {/* Prompt Enhancement Hints based on type */}
      {promptType === 'advanced' && (
        <div className="prompt-hint-box">
          <strong>Advanced Syntax:</strong> Use (word:weight) for emphasis, e.g., (masterpiece:1.2)
        </div>
      )}
      {promptType === 'structured' && (
        <div className="prompt-hint-box">
          <strong>Tag Format:</strong> Use comma-separated tags like: 1girl, blue hair, detailed eyes
        </div>
      )}
      {promptType === 'wildcard' && (
        <div className="prompt-hint-box">
          <strong>Wildcards:</strong> Use [word1|word2|word3] for random selection
        </div>
      )}

      {/* Prompt Editor */}
      <div className="control-section">
        <label className="control-label">
          <Sparkles size={14} />
          Prompt
        </label>
        <textarea
          className="prompt-input"
          placeholder="Describe what you want to create..."
          value={params.prompt}
          onChange={(e) => onParamsChange({ ...params, prompt: e.target.value })}
          rows={isMinimal ? 3 : 4}
        />
        <div className="prompt-hints">
          <span className="char-count">{params.prompt.length} chars</span>
        </div>
      </div>

      {/* Negative Prompt */}
      <div className="control-section">
        <label className="control-label">Negative Prompt</label>
        <textarea
          className="prompt-input negative"
          placeholder="What to avoid..."
          value={params.negative_prompt}
          onChange={(e) =>
            onParamsChange({ ...params, negative_prompt: e.target.value })
          }
          rows={isMinimal ? 2 : 3}
        />
      </div>

      {/* Image Upload (img2img and inpaint only) */}
      {(workflowMode === 'img2img' || workflowMode === 'inpaint') &&
        onImageUpload &&
        onImageRemove && (
          <div className="control-section">
            <label className="control-label">Source Image</label>
            <ImageUpload
              onImageSelect={onImageUpload}
              onRemove={onImageRemove}
              currentImage={uploadedImage || undefined}
              label={workflowMode === 'inpaint' ? 'Upload Image to Inpaint' : 'Upload Image'}
            />
          </div>
        )}

      {/* Model Selection (Standard+) */}
      {!isMinimal && sdModels.length > 0 && (
        <div className="control-section">
          <label className="control-label">Model</label>
          <select
            value={params.sd_model_checkpoint || sdModels[0]?.model_name || ''}
            onChange={(e) =>
              onParamsChange({ ...params, sd_model_checkpoint: e.target.value })
            }
            className="model-select"
          >
            {sdModels.map((model) => (
              <option key={model.model_name} value={model.model_name}>
                {model.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Aspect Ratio Grid */}
      <div className="control-section">
        <label className="control-label">Dimensions</label>
        <div className="aspect-grid">
          {ASPECT_RATIOS.map((ratio) => {
            const isSelected =
              params.width === ratio.width && params.height === ratio.height;

            return (
              <motion.button
                key={ratio.label}
                className={`aspect-btn ${isSelected ? 'active' : ''}`}
                onClick={() =>
                  onParamsChange({
                    ...params,
                    width: ratio.width,
                    height: ratio.height,
                  })
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="aspect-preview"
                  style={{
                    aspectRatio: `${ratio.width} / ${ratio.height}`,
                  }}
                />
                <span className="aspect-label">{ratio.label}</span>
                <span className="aspect-res">
                  {ratio.width}×{ratio.height}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sampling Settings (Standard+) */}
      {!isMinimal && (
        <>
          <button
            className="advanced-toggle"
            onClick={() => setShowSampling(!showSampling)}
          >
            <span>Sampling</span>
            <motion.div
              animate={{ rotate: showSampling ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <AnimatePresence>
            {showSampling && (
              <motion.div
                className="advanced-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {/* Sampler Selection */}
                <div className="control-section">
                  <label className="control-label">Sampler</label>
                  <select
                    value={params.sampler_name}
                    onChange={(e) =>
                      onParamsChange({ ...params, sampler_name: e.target.value })
                    }
                    className="sampler-select"
                    disabled={modelsLoading}
                  >
                    {samplers.map((sampler) => (
                      <option key={sampler.name} value={sampler.name}>
                        {sampler.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scheduler Selection */}
                <div className="control-section">
                  <label className="control-label">Scheduler</label>
                  <select
                    value={params.scheduler}
                    onChange={(e) =>
                      onParamsChange({ ...params, scheduler: e.target.value })
                    }
                    className="scheduler-select"
                    disabled={modelsLoading}
                  >
                    {schedulers.map((scheduler) => (
                      <option key={scheduler.name} value={scheduler.name}>
                        {scheduler.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Steps Slider */}
                <div className="control-section">
                  <label className="control-label">
                    Sampling Steps
                    <span className="control-value">{params.steps}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="150"
                    value={params.steps}
                    onChange={(e) =>
                      onParamsChange({ ...params, steps: parseInt(e.target.value) })
                    }
                    className="slider"
                  />
                  <div className="slider-hints">
                    <span>Faster</span>
                    <span>Higher Quality</span>
                  </div>
                </div>

                {/* CFG Scale */}
                <div className="control-section">
                  <label className="control-label">
                    CFG Scale
                    <span className="control-value">{params.cfg_scale.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="0.5"
                    value={params.cfg_scale}
                    onChange={(e) =>
                      onParamsChange({
                        ...params,
                        cfg_scale: parseFloat(e.target.value),
                      })
                    }
                    className="slider"
                  />
                  <div className="slider-hints">
                    <span>Creative</span>
                    <span>Strict</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* LoRA Panel (Advanced+) */}
      {showLoRAPanel && (
        <>
          <button
            className="advanced-toggle"
            onClick={() => setShowLoRA(!showLoRA)}
          >
            <span>LoRA Models</span>
            <motion.div
              animate={{ rotate: showLoRA ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <AnimatePresence>
            {showLoRA && (
              <motion.div
                className="advanced-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <LoraPanel
                  loras={loras}
                  availableModels={loraModels}
                  onChange={handleLorasChange}
                  onRefresh={refreshLoras}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Hires Fix (Advanced+) */}
      {showHiresPanel && (
        <>
          <button
            className="advanced-toggle"
            onClick={() => setShowHiresFix(!showHiresFix)}
          >
            <span>Hires Fix</span>
            <motion.div
              animate={{ rotate: showHiresFix ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <AnimatePresence>
            {showHiresFix && (
              <motion.div
                className="advanced-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <HiresFixPanel
                  enabled={params.enable_hr || false}
                  scale={params.hr_scale || 2.0}
                  upscaler={params.hr_upscaler || upscalers[0]?.name || 'Latent'}
                  denoisingStrength={params.hr_denoising_strength || 0.7}
                  secondPassSteps={params.hr_second_pass_steps || 0}
                  availableUpscalers={upscalers}
                  onEnabledChange={(enabled) =>
                    onParamsChange({ ...params, enable_hr: enabled })
                  }
                  onScaleChange={(scale) =>
                    onParamsChange({ ...params, hr_scale: scale })
                  }
                  onUpscalerChange={(upscaler) =>
                    onParamsChange({ ...params, hr_upscaler: upscaler })
                  }
                  onDenoisingStrengthChange={(strength) =>
                    onParamsChange({ ...params, hr_denoising_strength: strength })
                  }
                  onSecondPassStepsChange={(steps) =>
                    onParamsChange({ ...params, hr_second_pass_steps: steps })
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Image Settings */}
      <button
        className="advanced-toggle"
        onClick={() => setShowImageSettings(!showImageSettings)}
      >
        <span>Image Settings</span>
        <motion.div
          animate={{ rotate: showImageSettings ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence>
        {showImageSettings && (
          <motion.div
            className="advanced-options"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {/* Seed */}
            <div className="control-section">
              <label className="control-label">Seed</label>
              <div className="seed-input-group">
                <input
                  type="number"
                  value={params.seed}
                  onChange={(e) =>
                    onParamsChange({ ...params, seed: parseInt(e.target.value) })
                  }
                  className="seed-input"
                  placeholder="-1 (random)"
                />
                <button
                  className="seed-random-btn"
                  onClick={() =>
                    onParamsChange({
                      ...params,
                      seed: Math.floor(Math.random() * 2147483647),
                    })
                  }
                >
                  <Dices size={16} />
                </button>
              </div>
            </div>

            {/* img2img Denoising Strength */}
            {workflowMode === 'img2img' && (
              <div className="control-section">
                <label className="control-label">
                  Denoising Strength
                  <span className="control-value">{(params.denoising_strength || 0.75).toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={params.denoising_strength || 0.75}
                  onChange={(e) =>
                    onParamsChange({
                      ...params,
                      denoising_strength: parseFloat(e.target.value),
                    })
                  }
                  className="slider"
                />
                <div className="slider-hints">
                  <span>Keep Original</span>
                  <span>Full Rework</span>
                </div>
              </div>
            )}

            {/* VAE Selection (Expert) */}
            {isExpert && vaes.length > 0 && (
              <div className="control-section">
                <label className="control-label">VAE</label>
                <select
                  value={params.sd_vae || 'Automatic'}
                  onChange={(e) =>
                    onParamsChange({ ...params, sd_vae: e.target.value })
                  }
                  className="vae-select"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="None">None</option>
                  {vaes.map((vae) => (
                    <option key={vae.model_name} value={vae.model_name}>
                      {vae.model_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation Settings */}
      <button
        className="advanced-toggle"
        onClick={() => setShowGeneration(!showGeneration)}
      >
        <span>Generation</span>
        <motion.div
          animate={{ rotate: showGeneration ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence>
        {showGeneration && (
          <motion.div
            className="advanced-options"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="control-section">
              <label className="control-label">Batch Count</label>
              <input
                type="number"
                value={params.batch_count}
                onChange={(e) =>
                  onParamsChange({
                    ...params,
                    batch_count: parseInt(e.target.value),
                  })
                }
                className="input"
                min="1"
                max="100"
              />
            </div>

            <div className="control-section">
              <label className="control-label">Batch Size</label>
              <input
                type="number"
                value={params.batch_size}
                onChange={(e) =>
                  onParamsChange({
                    ...params,
                    batch_size: parseInt(e.target.value),
                  })
                }
                className="input"
                min="1"
                max="8"
              />
            </div>

            {/* CLIP Skip */}
            <div className="control-section">
              <label className="control-label">
                CLIP Skip
                <span className="control-value">{params.clip_skip || 1}</span>
              </label>
              <input
                type="number"
                value={params.clip_skip || 1}
                onChange={(e) =>
                  onParamsChange({
                    ...params,
                    clip_skip: parseInt(e.target.value),
                  })
                }
                className="input"
                min="1"
                max="12"
              />
            </div>

            {/* Toggles */}
            <div className="control-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={params.restore_faces || false}
                  onChange={(e) =>
                    onParamsChange({
                      ...params,
                      restore_faces: e.target.checked,
                    })
                  }
                />
                <span>Restore Faces</span>
              </label>
            </div>

            <div className="control-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={params.tiling || false}
                  onChange={(e) =>
                    onParamsChange({
                      ...params,
                      tiling: e.target.checked,
                    })
                  }
                />
                <span>Tiling</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Sampling Parameters (Expert Only) */}
      {showAdvancedParams && (
        <>
          <button
            className="advanced-toggle"
            onClick={() => setShowAdvancedSampling(!showAdvancedSampling)}
          >
            <span>Advanced Sampling</span>
            <motion.div
              animate={{ rotate: showAdvancedSampling ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <AnimatePresence>
            {showAdvancedSampling && (
              <motion.div
                className="advanced-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="sigma-warning">
                  ⚠️ Advanced sigma parameters. Only modify if you know what you're doing.
                </div>

                <div className="control-section">
                  <label className="control-label">Eta (η)</label>
                  <input
                    type="number"
                    value={params.eta || 0}
                    onChange={(e) =>
                      onParamsChange({ ...params, eta: parseFloat(e.target.value) })
                    }
                    className="input"
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>

                <div className="control-section">
                  <label className="control-label">Sigma Churn</label>
                  <input
                    type="number"
                    value={params.s_churn || 0}
                    onChange={(e) =>
                      onParamsChange({ ...params, s_churn: parseFloat(e.target.value) })
                    }
                    className="input"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                <div className="control-section">
                  <label className="control-label">Sigma Noise</label>
                  <input
                    type="number"
                    value={params.s_noise || 1}
                    onChange={(e) =>
                      onParamsChange({ ...params, s_noise: parseFloat(e.target.value) })
                    }
                    className="input"
                    min="0"
                    max="1.1"
                    step="0.001"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Settings Panel */}
      <button
        className="settings-btn"
        onClick={() => setShowSettings(!showSettings)}
      >
        <Settings size={16} />
        <span>Settings</span>
      </button>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="settings-panel"
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 500 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="settings-section">
              <h4>Application Settings</h4>
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings?.autoSaveImages ?? false}
                    onChange={(e) => onSettingsChange?.('autoSaveImages', e.target.checked)}
                  />
                  <span>Auto-save images</span>
                </label>
              </div>
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings?.showLivePreview ?? true}
                    onChange={(e) => onSettingsChange?.('showLivePreview', e.target.checked)}
                  />
                  <span>Show live preview</span>
                </label>
              </div>
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings?.confirmBeforeGenerate ?? false}
                    onChange={(e) => onSettingsChange?.('confirmBeforeGenerate', e.target.checked)}
                  />
                  <span>Confirm before generate</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Button with Progress */}
      <motion.button
        className="generate-btn"
        onClick={onGenerate}
        disabled={isGenerating || !params.prompt.trim()}
        whileHover={{ scale: isGenerating ? 1 : 1.02 }}
        whileTap={{ scale: isGenerating ? 1 : 0.98 }}
      >
        {isGenerating ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles size={20} />
            </motion.div>
            <span>
              Generating... {currentStep}/{totalSteps} ({(progress * 100).toFixed(0)}%)
            </span>
          </>
        ) : (
          <>
            <Sparkles size={20} />
            <span>Generate</span>
          </>
        )}
      </motion.button>

      {isGenerating && (
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}
