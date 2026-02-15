import { useState, useEffect, useCallback } from 'react';
import { forgeAPI } from '../services/api';
import type {
  SDModel,
  LoRAModel,
  Sampler,
  Scheduler,
  Upscaler,
  VAE,
  ControlNetModel,
} from '../types';

export interface UseModelsReturn {
  // Models
  sdModels: SDModel[];
  loraModels: LoRAModel[];
  samplers: Sampler[];
  schedulers: Scheduler[];
  upscalers: Upscaler[];
  vaes: VAE[];
  controlNetModels: ControlNetModel[];
  controlNetModules: string[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  refreshModels: () => Promise<void>;
  refreshLoras: () => Promise<void>;
}

export function useModels(): UseModelsReturn {
  const [sdModels, setSdModels] = useState<SDModel[]>([]);
  const [loraModels, setLoraModels] = useState<LoRAModel[]>([]);
  const [samplers, setSamplers] = useState<Sampler[]>([]);
  const [schedulers, setSchedulers] = useState<Scheduler[]>([]);
  const [upscalers, setUpscalers] = useState<Upscaler[]>([]);
  const [vaes, setVaes] = useState<VAE[]>([]);
  const [controlNetModels, setControlNetModels] = useState<ControlNetModel[]>([]);
  const [controlNetModules, setControlNetModules] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        sdModelsData,
        loraModelsData,
        samplersData,
        schedulersData,
        upscalersData,
        vaesData,
        controlNetModelsData,
        controlNetModulesData,
      ] = await Promise.allSettled([
        forgeAPI.getSDModels(),
        forgeAPI.getLoRAModels(),
        forgeAPI.getSamplers(),
        forgeAPI.getSchedulers(),
        forgeAPI.getUpscalers(),
        forgeAPI.getVAEs(),
        forgeAPI.getControlNetModels(),
        forgeAPI.getControlNetModules(),
      ]);

      if (sdModelsData.status === 'fulfilled') setSdModels(sdModelsData.value);
      if (loraModelsData.status === 'fulfilled') setLoraModels(loraModelsData.value);
      if (samplersData.status === 'fulfilled') setSamplers(samplersData.value);
      if (schedulersData.status === 'fulfilled') setSchedulers(schedulersData.value);
      if (upscalersData.status === 'fulfilled') setUpscalers(upscalersData.value);
      if (vaesData.status === 'fulfilled') setVaes(vaesData.value);
      if (controlNetModelsData.status === 'fulfilled')
        setControlNetModels(controlNetModelsData.value);
      if (controlNetModulesData.status === 'fulfilled')
        setControlNetModules(controlNetModulesData.value);

      // Check if any critical data failed to load
      const failures = [
        sdModelsData,
        samplersData,
        schedulersData,
      ].filter((result) => result.status === 'rejected');

      if (failures.length > 0) {
        console.warn('Some model data failed to load:', failures);
        setError('Some model data could not be loaded. Check console for details.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load models';
      setError(errorMessage);
      console.error('Model loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshModels = useCallback(async () => {
    try {
      await forgeAPI.refreshCheckpoints();
      await loadAllModels();
    } catch (err) {
      console.error('Failed to refresh models:', err);
    }
  }, [loadAllModels]);

  const refreshLoras = useCallback(async () => {
    try {
      await forgeAPI.refreshLoras();
      const loraModelsData = await forgeAPI.getLoRAModels();
      setLoraModels(loraModelsData);
    } catch (err) {
      console.error('Failed to refresh LoRAs:', err);
    }
  }, []);

  // Load models on mount
  useEffect(() => {
    loadAllModels();
  }, [loadAllModels]);

  return {
    sdModels,
    loraModels,
    samplers,
    schedulers,
    upscalers,
    vaes,
    controlNetModels,
    controlNetModules,
    isLoading,
    error,
    refreshModels,
    refreshLoras,
  };
}
