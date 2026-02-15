import type {
  GenerationParams,
  GenerationResponse,
  ProgressResponse,
  Sampler,
  Scheduler,
  SDModel,
  LoRAModel,
  ControlNetModel,
  ControlNetModule,
  Upscaler,
  VAE,
} from '../types';

// API Configuration
const API_BASE = 'http://localhost:7860';

class ForgeAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error (${response.status}): ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ===== Generation Endpoints =====

  async txt2img(params: GenerationParams): Promise<GenerationResponse> {
    return this.request<GenerationResponse>('/sdapi/v1/txt2img', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async img2img(params: GenerationParams): Promise<GenerationResponse> {
    return this.request<GenerationResponse>('/sdapi/v1/img2img', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getProgress(): Promise<ProgressResponse> {
    return this.request<ProgressResponse>('/sdapi/v1/progress');
  }

  async interrupt(): Promise<void> {
    await this.request<void>('/sdapi/v1/interrupt', {
      method: 'POST',
    });
  }

  async skip(): Promise<void> {
    await this.request<void>('/sdapi/v1/skip', {
      method: 'POST',
    });
  }

  // ===== Samplers & Schedulers =====

  async getSamplers(): Promise<Sampler[]> {
    return this.request<Sampler[]>('/sdapi/v1/samplers');
  }

  async getSchedulers(): Promise<Scheduler[]> {
    return this.request<Scheduler[]>('/sdapi/v1/schedulers');
  }

  // ===== Models =====

  async getSDModels(): Promise<SDModel[]> {
    return this.request<SDModel[]>('/sdapi/v1/sd-models');
  }

  async getLoRAModels(): Promise<LoRAModel[]> {
    return this.request<LoRAModel[]>('/sdapi/v1/loras');
  }

  async refreshCheckpoints(): Promise<void> {
    await this.request<void>('/sdapi/v1/refresh-checkpoints', {
      method: 'POST',
    });
  }

  async refreshLoras(): Promise<void> {
    await this.request<void>('/sdapi/v1/refresh-loras', {
      method: 'POST',
    });
  }

  // ===== ControlNet =====

  async getControlNetModels(): Promise<ControlNetModel[]> {
    return this.request<ControlNetModel[]>('/controlnet/model_list');
  }

  async getControlNetModules(): Promise<string[]> {
    const response = await this.request<{ module_list: string[] }>('/controlnet/module_list');
    return response.module_list;
  }

  async detectControlNet(
    controlnetModule: string,
    controlnetInputImages: string[],
    controlnetProcessorRes?: number,
    controlnetThresholdA?: number,
    controlnetThresholdB?: number
  ): Promise<{ images: string[] }> {
    return this.request<{ images: string[] }>('/controlnet/detect', {
      method: 'POST',
      body: JSON.stringify({
        controlnet_module: controlnetModule,
        controlnet_input_images: controlnetInputImages,
        controlnet_processor_res: controlnetProcessorRes,
        controlnet_threshold_a: controlnetThresholdA,
        controlnet_threshold_b: controlnetThresholdB,
      }),
    });
  }

  // ===== Upscalers =====

  async getUpscalers(): Promise<Upscaler[]> {
    return this.request<Upscaler[]>('/sdapi/v1/upscalers');
  }

  async getLatentUpscalers(): Promise<Upscaler[]> {
    return this.request<Upscaler[]>('/sdapi/v1/latent-upscale-modes');
  }

  // ===== VAE =====

  async getVAEs(): Promise<VAE[]> {
    return this.request<VAE[]>('/sdapi/v1/sd-vae');
  }

  // ===== Options & Settings =====

  async getOptions(): Promise<Record<string, any>> {
    return this.request<Record<string, any>>('/sdapi/v1/options');
  }

  async setOptions(options: Record<string, any>): Promise<void> {
    await this.request<void>('/sdapi/v1/options', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  // ===== Utilities =====

  async interrogate(
    image: string,
    model: 'clip' | 'deepdanbooru' = 'clip'
  ): Promise<{ caption: string }> {
    return this.request<{ caption: string }>('/sdapi/v1/interrogate', {
      method: 'POST',
      body: JSON.stringify({ image, model }),
    });
  }

  async pngInfo(image: string): Promise<{ info: string; items: Record<string, any> }> {
    return this.request<{ info: string; items: Record<string, any> }>('/sdapi/v1/png-info', {
      method: 'POST',
      body: JSON.stringify({ image }),
    });
  }

  // ===== Extras =====

  async extraSingleImage(params: {
    image: string;
    upscaler_1: string;
    upscaling_resize: number;
    use_codeformer: boolean;
    codeformer_weight: number;
    gfpgan_visibility: number;
    tiling?: boolean;
  }): Promise<{ image: string }> {
    return this.request<{ image: string }>('/sdapi/v1/extra-single-image', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ===== Health Check =====

  async ping(): Promise<boolean> {
    try {
      await this.request<any>('/sdapi/v1/samplers');
      return true;
    } catch {
      return false;
    }
  }

  async getAppId(): Promise<{ app_id: string }> {
    return this.request<{ app_id: string }>('/app_id');
  }

  // ===== Queue & Memory =====

  async getQueue(): Promise<any> {
    return this.request<any>('/queue/status');
  }

  async getMemory(): Promise<{
    ram: { free: number; used: number; total: number };
    cuda: Record<string, { free: number; used: number; total: number }>;
  }> {
    return this.request<any>('/sdapi/v1/memory');
  }
}

// Export singleton instance
export const forgeAPI = new ForgeAPI();

// Export class for custom instances
export default ForgeAPI;
