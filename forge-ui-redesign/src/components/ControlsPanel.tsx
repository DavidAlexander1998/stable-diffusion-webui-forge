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
import {
  ControlMode,
  GenerationParams,
  WorkflowMode,
  PromptType,
  LoRAConfig,
  ControlNetUnit,
} from '../types';
import { AppSettings } from '../hooks/useSettings';
import { LoraPanel } from './LoraPanel';
import { HiresFixPanel } from './HiresFixPanel';
import ControlNetPanel from './ControlNetPanel';
import BatchPanel, { BatchItem, BatchOptions } from './BatchPanel';
import ExtrasPanel, { ExtrasOptions } from './ExtrasPanel';
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
  usePreviousSeed?: boolean;
  onUsePreviousSeedChange?: (value: boolean) => void;
  batchItems?: BatchItem[];
  batchOptions?: BatchOptions;
  onBatchOptionsChange?: (options: BatchOptions) => void;
  onBatchAddImages?: (images: string[]) => void;
  onBatchUpdateItem?: (id: number, updates: Partial<BatchItem>) => void;
  onBatchRemoveItem?: (id: number) => void;
  onBatchClear?: () => void;
  onBatchRun?: () => void;
  batchRunning?: boolean;
  extrasImage?: string | null;
  extrasOptions?: ExtrasOptions;
  onExtrasOptionsChange?: (options: ExtrasOptions) => void;
  onExtrasImageSelect?: (image: string) => void;
  onExtrasImageRemove?: () => void;
  onExtrasRun?: () => void;
  extrasRunning?: boolean;
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
  usePreviousSeed = false,
  onUsePreviousSeedChange,
  batchItems = [],
  batchOptions,
  onBatchOptionsChange,
  onBatchAddImages,
  onBatchUpdateItem,
  onBatchRemoveItem,
  onBatchClear,
  onBatchRun,
  batchRunning = false,
  extrasImage,
  extrasOptions,
  onExtrasOptionsChange,
  onExtrasImageSelect,
  onExtrasImageRemove,
  onExtrasRun,
  extrasRunning = false,
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
  const [showControlNet, setShowControlNet] = useState(false);

  // Get models from API
  const {
    samplers,
    schedulers,
    upscalers,
    loraModels,
    sdModels,
    vaes,
    controlNetModels,
    controlNetModules,
    isLoading: modelsLoading,
    refreshLoras,
  } = useModels();

  // Initialize loras if not present
  const [loras, setLoras] = useState<LoRAConfig[]>([]);
  const [controlNetUnits, setControlNetUnits] = useState<ControlNetUnit[]>([]);

  useEffect(() => {
    if (params._loras) {
      setLoras(params._loras);
    }
  }, [params._loras]);

  useEffect(() => {
    if (params.alwayson_scripts?.controlnet?.args) {
      setControlNetUnits(params.alwayson_scripts.controlnet.args);
    }
  }, [params.alwayson_scripts]);

  const handleLorasChange = (newLoras: LoRAConfig[]) => {
    setLoras(newLoras);
    onParamsChange({ ...params, _loras: newLoras });
  };

  const handleControlNetChange = (units: ControlNetUnit[]) => {
    setControlNetUnits(units);
    const nextAlwaysOn = units.length
      ? { ...(params.alwayson_scripts ?? {}), controlnet: { args: units } }
      : undefined;
    onParamsChange({ ...params, alwayson_scripts: nextAlwaysOn });
  };

  const isMinimal = mode === 'minimal';
  const isStandard = mode === 'standard';
  const isAdvanced = mode === 'advanced';
  const isExpert = mode === 'expert';

  // Show different sections based on control mode
  const showLoRAPanel = isAdvanced || isExpert;
  const showHiresPanel = isAdvanced || isExpert;
  const showAdvancedParams = isExpert;
  const showControlNetPanel = isAdvanced || isExpert;

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

        {/* Prompt Enhancement Buttons (Standard+) */}
        {!isMinimal && (
          <div className="prompt-enhancements">
            <div className="enhancement-row">
              <span className="enhancement-label">Quick Enhance:</span>
              <button
                type="button"
                className="enhance-btn"
                onClick={() => {
                  const enhanced = params.prompt
                    ? `${params.prompt}, masterpiece, best quality, highly detailed`
                    : 'masterpiece, best quality, highly detailed';
                  onParamsChange({ ...params, prompt: enhanced });
                }}
                title="Add quality tags"
              >
                +Quality
              </button>
              <button
                type="button"
                className="enhance-btn"
                onClick={() => {
                  const enhanced = params.prompt
                    ? `${params.prompt}, photorealistic, realistic, professional photography`
                    : 'photorealistic, realistic, professional photography';
                  onParamsChange({ ...params, prompt: enhanced });
                }}
                title="Add photorealistic tags"
              >
                +Photo
              </button>
              <button
                type="button"
                className="enhance-btn"
                onClick={() => {
                  const enhanced = params.prompt
                    ? `${params.prompt}, anime, manga, high quality anime style`
                    : 'anime, manga, high quality anime style';
                  onParamsChange({ ...params, prompt: enhanced });
                }}
                title="Add anime style tags"
              >
                +Anime
              </button>
              <button
                type="button"
                className="enhance-btn"
                onClick={() => {
                  const enhanced = params.prompt
                    ? `${params.prompt}, artistic, beautiful, aesthetic, trending on artstation`
                    : 'artistic, beautiful, aesthetic, trending on artstation';
                  onParamsChange({ ...params, prompt: enhanced });
                }}
                title="Add artistic tags"
              >
                +Artistic
              </button>
            </div>
          </div>
        )}
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

        {/* Negative Prompt Presets (Standard+) */}
        {!isMinimal && (
          <div className="prompt-enhancements">
            <div className="enhancement-row">
              <span className="enhancement-label">Negatives:</span>
              <button
                type="button"
                className="enhance-btn"
                onClick={() => {
                  const neg = 'low quality, worst quality, blurry, bad anatomy, bad proportions';
                  onParamsChange({
                    ...params,
                    negative_prompt: params.negative_prompt
                      ? `${params.negative_prompt}, ${neg}`
                      : neg,
                  });
                }}
                title="Add standard negative tags"
              >
                Standard
              </button>
              <button
                type="button"
                className="enhance-btn"
                onClick={() => {
                  const neg =
                    'illustration, painting, drawing, art, sketch, low quality, blurry, grainy';
                  onParamsChange({
                    ...params,
                    negative_prompt: params.negative_prompt
                      ? `${params.negative_prompt}, ${neg}`
                      : neg,
                  });
                }}
                title="Add photo negative tags"
              >
                Photo
              </button>
              <button
                type="button"
                className="enhance-btn"
                onClick={() => {
                  const neg = 'realistic, photo, photorealistic, 3d, low quality, worst quality';
                  onParamsChange({
                    ...params,
                    negative_prompt: params.negative_prompt
                      ? `${params.negative_prompt}, ${neg}`
                      : neg,
                  });
                }}
                title="Add anime negative tags"
              >
                Anime
              </button>
            </div>
          </div>
        )}
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

      {workflowMode === 'batch' && batchOptions && onBatchOptionsChange && (
        <BatchPanel
          items={batchItems}
          options={batchOptions}
          onOptionsChange={onBatchOptionsChange}
          onAddImages={onBatchAddImages ?? (() => undefined)}
          onUpdateItem={onBatchUpdateItem ?? (() => undefined)}
          onRemoveItem={onBatchRemoveItem ?? (() => undefined)}
          onClear={onBatchClear ?? (() => undefined)}
          onRun={onBatchRun ?? (() => undefined)}
          isRunning={batchRunning}
          availableUpscalers={upscalers.map((upscaler) => upscaler.name)}
        />
      )}

      {workflowMode === 'extras' && extrasOptions && onExtrasOptionsChange && (
        <ExtrasPanel
          image={extrasImage ?? null}
          onImageSelect={onExtrasImageSelect ?? (() => undefined)}
          onImageRemove={onExtrasImageRemove ?? (() => undefined)}
          options={extrasOptions}
          onOptionsChange={onExtrasOptionsChange}
          onRun={onExtrasRun ?? (() => undefined)}
          isRunning={extrasRunning}
          availableUpscalers={upscalers.map((upscaler) => upscaler.name)}
        />
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

      {/* ControlNet (Advanced+) */}
      {showControlNetPanel && (
        <>
          <button
            className="advanced-toggle"
            onClick={() => setShowControlNet(!showControlNet)}
          >
            <span>ControlNet</span>
            <motion.div
              animate={{ rotate: showControlNet ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <AnimatePresence>
            {showControlNet && (
              <motion.div
                className="advanced-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ControlNetPanel
                  units={controlNetUnits}
                  availableModels={controlNetModels}
                  availableModules={controlNetModules}
                  onUnitsChange={handleControlNetChange}
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

            {/* img2img/inpaint Denoising Strength */}
            {(workflowMode === 'img2img' || workflowMode === 'inpaint') && (
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

            {(workflowMode === 'img2img' || workflowMode === 'inpaint') && (
              <div className="control-section">
                <label className="control-label">Resize Mode</label>
                <select
                  value={params.resize_mode ?? 0}
                  onChange={(e) =>
                    onParamsChange({
                      ...params,
                      resize_mode: parseInt(e.target.value, 10),
                    })
                  }
                  className="model-select"
                >
                  <option value={0}>Just Resize</option>
                  <option value={1}>Crop and Resize</option>
                  <option value={2}>Resize and Fill</option>
                </select>
              </div>
            )}

            {workflowMode === 'inpaint' && (
              <>
                <div className="control-section">
                  <label className="control-label">
                    Mask Blur
                    <span className="control-value">{params.mask_blur ?? 4}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="64"
                    value={params.mask_blur ?? 4}
                    onChange={(e) =>
                      onParamsChange({
                        ...params,
                        mask_blur: parseInt(e.target.value, 10),
                      })
                    }
                    className="slider"
                  />
                </div>

                <div className="control-section">
                  <label className="control-label">Inpaint Area</label>
                  <select
                    value={
                      params.inpaint_full_res
                        ? (params.inpaint_full_res_padding ?? 0) > 0
                          ? 'padding'
                          : 'masked'
                        : 'full'
                    }
                    onChange={(e) =>
                      onParamsChange({
                        ...params,
                        inpaint_full_res: e.target.value !== 'full',
                        inpaint_full_res_padding:
                          e.target.value === 'padding'
                            ? params.inpaint_full_res_padding || 32
                            : 0,
                      })
                    }
                    className="model-select"
                  >
                    <option value="full">Whole Picture</option>
                    <option value="masked">Only Masked</option>
                    <option value="padding">Only Masked Padding</option>
                  </select>
                </div>

                {params.inpaint_full_res && (params.inpaint_full_res_padding ?? 0) > 0 && (
                  <div className="control-section">
                    <label className="control-label">
                      Mask Padding
                      <span className="control-value">
                        {params.inpaint_full_res_padding ?? 32}px
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="128"
                      value={params.inpaint_full_res_padding ?? 32}
                      onChange={(e) =>
                        onParamsChange({
                          ...params,
                          inpaint_full_res_padding: parseInt(e.target.value, 10),
                        })
                      }
                      className="slider"
                    />
                  </div>
                )}

                <div className="control-section">
                  <label className="control-label">Inpaint Fill</label>
                  <select
                    value={params.inpainting_fill ?? 1}
                    onChange={(e) =>
                      onParamsChange({
                        ...params,
                        inpainting_fill: parseInt(e.target.value, 10),
                      })
                    }
                    className="model-select"
                  >
                    <option value={0}>Fill</option>
                    <option value={1}>Original</option>
                    <option value={2}>Latent Noise</option>
                    <option value={3}>Latent Nothing</option>
                  </select>
                </div>
              </>
            )}

            {(workflowMode === 'img2img' || workflowMode === 'inpaint') && (
              <div className="control-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={usePreviousSeed}
                    onChange={(e) => onUsePreviousSeedChange?.(e.target.checked)}
                  />
                  <span>Use seed from previous image</span>
                </label>
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
            animate={{ opacity: 1, maxHeight: 800 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Application Settings */}
            <div className="settings-section">
              <h4>Application Settings</h4>
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings?.autoSaveImages ?? false}
                    onChange={(e) => onSettingsChange?.('autoSaveImages', e.target.checked)}
                  />
                  <span>Auto-save images after generation</span>
                </label>
              </div>
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings?.showLivePreview ?? true}
                    onChange={(e) => onSettingsChange?.('showLivePreview', e.target.checked)}
                  />
                  <span>Show live preview during generation</span>
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

            {/* Image Settings */}
            <div className="settings-section">
              <h4>Image Settings</h4>
              <div className="control-section">
                <label className="control-label">Save Format</label>
                <select
                  value={settings?.saveFormat ?? 'png'}
                  onChange={(e) => onSettingsChange?.('saveFormat', e.target.value as 'png' | 'jpg' | 'webp')}
                  className="model-select"
                >
                  <option value="png">PNG (Lossless)</option>
                  <option value="jpg">JPEG (Smaller file size)</option>
                  <option value="webp">WebP (Best compression)</option>
                </select>
              </div>

              {(settings?.saveFormat === 'jpg' || settings?.saveFormat === 'webp') && (
                <div className="control-group">
                  <label className="control-label">
                    Image Quality: {settings?.imageQuality ?? 95}%
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={settings?.imageQuality ?? 95}
                    onChange={(e) => onSettingsChange?.('imageQuality', parseInt(e.target.value, 10))}
                    className="slider"
                  />
                </div>
              )}

              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings?.embedMetadata ?? true}
                    onChange={(e) => onSettingsChange?.('embedMetadata', e.target.checked)}
                  />
                  <span>Embed generation metadata in images</span>
                </label>
              </div>
            </div>

            {/* UI Settings */}
            <div className="settings-section">
              <h4>UI Settings</h4>
              <div className="control-section">
                <label className="control-label">Theme</label>
                <select
                  value={settings?.theme ?? 'dark'}
                  onChange={(e) => onSettingsChange?.('theme', e.target.value as 'dark' | 'light' | 'auto')}
                  className="model-select"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <div className="control-section">
                <label className="control-label">Default Control Mode</label>
                <select
                  value={settings?.defaultControlMode ?? 'standard'}
                  onChange={(e) => onSettingsChange?.('defaultControlMode', e.target.value as ControlMode)}
                  className="model-select"
                >
                  <option value="minimal">Minimal</option>
                  <option value="standard">Standard</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            {/* Generation Settings */}
            <div className="settings-section">
              <h4>Generation Settings</h4>
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings?.autoHiresFix ?? false}
                    onChange={(e) => onSettingsChange?.('autoHiresFix', e.target.checked)}
                  />
                  <span>Auto-enable Hires Fix for large resolutions (&gt;1024px)</span>
                </label>
              </div>
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings?.nsfwFilter ?? false}
                    onChange={(e) => onSettingsChange?.('nsfwFilter', e.target.checked)}
                  />
                  <span>Enable NSFW content filter</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {workflowMode === 'batch' && (
        <div className="batch-footer-controls">
          <button
            className="batch-clear"
            onClick={() => onBatchClear?.()}
            type="button"
            disabled={batchRunning}
          >
            Clear
          </button>
          <button
            className="batch-run"
            onClick={() => onBatchRun?.()}
            type="button"
            disabled={batchItems.length === 0 || batchRunning}
          >
            {batchRunning ? 'Running...' : 'Run Batch'}
          </button>
        </div>
      )}

      {/* Generate Button with Progress */}
      {workflowMode !== 'batch' && workflowMode !== 'extras' && (
        <>
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
        </>
      )}
    </div>
  );
}
