export type WorkflowMode = 'txt2img' | 'img2img' | 'inpaint' | 'extras' | 'batch';
export type ControlMode = 'minimal' | 'standard' | 'advanced' | 'expert';

// ===== LoRA Configuration =====
export interface LoRAConfig {
  name: string;
  model: string;
  weight: number;
  enabled: boolean;
}

// ===== ControlNet Configuration =====
export interface ControlNetUnit {
  enabled: boolean;
  module: string; // preprocessor
  model: string;
  weight: number;
  guidance_start: number;
  guidance_end: number;
  control_mode: number; // 0: Balanced, 1: My prompt is more important, 2: ControlNet is more important
  resize_mode: number; // 0: Just Resize, 1: Crop and Resize, 2: Resize and Fill
  lowvram: boolean;
  processor_res: number;
  threshold_a: number;
  threshold_b: number;
  input_image?: string; // base64
  mask?: string; // base64
  pixel_perfect: boolean;
}

// ===== Hires Fix Configuration =====
export interface HiresFixConfig {
  enable_hr: boolean;
  hr_scale: number;
  hr_upscaler: string;
  hr_second_pass_steps: number;
  hr_resize_x: number;
  hr_resize_y: number;
  denoising_strength: number;
}

// ===== Generation Parameters (Complete) =====
export interface GenerationParams {
  // Basic
  prompt: string;
  negative_prompt: string;
  width: number;
  height: number;
  steps: number;
  cfg_scale: number;
  sampler_name: string;
  scheduler: string;
  seed: number;
  batch_count: number;
  batch_size: number;

  // img2img specific
  denoising_strength?: number;
  init_images?: string[];
  resize_mode?: number;
  mask?: string;
  mask_blur?: number;
  inpainting_fill?: number;
  inpaint_full_res?: boolean;
  inpaint_full_res_padding?: number;

  // Variation settings
  subseed?: number;
  subseed_strength?: number;
  seed_resize_from_h?: number;
  seed_resize_from_w?: number;

  // Hires Fix
  enable_hr?: boolean;
  hr_scale?: number;
  hr_upscaler?: string;
  hr_second_pass_steps?: number;
  hr_resize_x?: number;
  hr_resize_y?: number;
  hr_denoising_strength?: number;

  // Advanced Sampling
  clip_skip?: number;
  restore_faces?: boolean;
  tiling?: boolean;

  // Sigma parameters
  s_min_uncond?: number;
  s_churn?: number;
  s_tmax?: number;
  s_tmin?: number;
  s_noise?: number;

  // ENSD (Eta Noise Seed Delta)
  eta?: number;

  // Scripts and extensions
  override_settings?: Record<string, any>;
  override_settings_restore_afterwards?: boolean;

  // ControlNet
  alwayson_scripts?: {
    controlnet?: {
      args: ControlNetUnit[];
    };
  };

  // LoRA (embedded in prompt but we track separately)
  _loras?: LoRAConfig[]; // Internal use only

  // VAE
  sd_vae?: string;

  // Model
  sd_model_checkpoint?: string;
}

// ===== API Response Types =====
export interface GenerationResponse {
  images: string[]; // base64 encoded
  parameters: GenerationParams;
  info: string; // JSON string with additional info
}

export interface ProgressResponse {
  progress: number; // 0.0 to 1.0
  eta_relative: number; // seconds
  state: {
    skipped: boolean;
    interrupted: boolean;
    job: string;
    job_count: number;
    job_no: number;
    sampling_step: number;
    sampling_steps: number;
  };
  current_image?: string; // base64 preview
}

export interface Sampler {
  name: string;
  aliases: string[];
  options: Record<string, string>;
}

export interface Scheduler {
  name: string;
  label: string;
  aliases: string[];
}

export interface SDModel {
  title: string;
  model_name: string;
  hash: string;
  sha256: string;
  filename: string;
  config: string;
}

export interface LoRAModel {
  name: string;
  alias: string;
  path: string;
  metadata?: Record<string, any>;
}

export interface ControlNetModel {
  model_name: string;
  default_option?: string;
  default_model?: string;
}

export interface ControlNetModule {
  module: string;
  sliders?: Array<{
    name: string;
    value: number;
    min: number;
    max: number;
    step: number;
  }>;
}

export interface Upscaler {
  name: string;
  model_name: string | null;
  model_path: string | null;
  model_url: string | null;
  scale: number;
}

export interface VAE {
  model_name: string;
  filename: string;
}

// ===== UI State Types =====
export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: number;
  totalSteps: number;
  eta: number;
  previewImage?: string;
  error?: string;
}

export interface AppSettings {
  autoSaveImages: boolean;
  saveFolder: string;
  saveFormat: 'png' | 'jpg' | 'webp';
  showPreview: boolean;
  confirmBeforeGenerate: boolean;
  defaultSampler: string;
  defaultScheduler: string;
  defaultSteps: number;
  defaultCfgScale: number;
  theme: 'dark' | 'light' | 'auto';
}

// ===== Prompt Enhancement Types =====
export type PromptType = 'simple' | 'advanced' | 'structured' | 'wildcard';

export interface PromptEnhancement {
  type: PromptType;
  wildcards?: string[];
  dynamicPrompts?: boolean;
  attention?: boolean; // (word:weight) syntax
  alternation?: boolean; // [word1|word2] syntax
  scheduling?: boolean; // [word:step] syntax
}
