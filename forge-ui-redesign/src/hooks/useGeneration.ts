import { useState, useCallback } from 'react';
import { forgeAPI } from '../services/api';
import type { GenerationParams, GenerationResponse, WorkflowMode } from '../types';

export interface UseGenerationReturn {
  generate: (params: GenerationParams, mode: WorkflowMode) => Promise<GenerationResponse | null>;
  isGenerating: boolean;
  error: string | null;
  interrupt: () => Promise<void>;
  skip: () => Promise<void>;
}

export function useGeneration(): UseGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (params: GenerationParams, mode: WorkflowMode): Promise<GenerationResponse | null> => {
      setIsGenerating(true);
      setError(null);

      try {
        let response: GenerationResponse;

        if (mode === 'txt2img') {
          response = await forgeAPI.txt2img(params);
        } else if (mode === 'img2img' || mode === 'inpaint') {
          response = await forgeAPI.img2img(params);
        } else {
          throw new Error(`Unsupported workflow mode: ${mode}`);
        }

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Generation failed';
        setError(errorMessage);
        console.error('Generation error:', err);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const interrupt = useCallback(async () => {
    try {
      await forgeAPI.interrupt();
    } catch (err) {
      console.error('Failed to interrupt generation:', err);
    }
  }, []);

  const skip = useCallback(async () => {
    try {
      await forgeAPI.skip();
    } catch (err) {
      console.error('Failed to skip generation:', err);
    }
  }, []);

  return {
    generate,
    isGenerating,
    error,
    interrupt,
    skip,
  };
}
