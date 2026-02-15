import { useState, useEffect } from 'react';
import type { GenerationParams } from '../types';

export interface WorkflowPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  params: Partial<GenerationParams>;
  thumbnail?: string; // base64 image
  createdAt: number;
  updatedAt: number;
  isFavorite?: boolean;
}

const PRESETS_KEY = 'forge-ui-presets';

// Default presets that come with the app
const DEFAULT_PRESETS: WorkflowPreset[] = [
  {
    id: 'default-portrait',
    name: 'Portrait Photography',
    description: 'Professional portrait with studio lighting',
    category: 'Photography',
    params: {
      width: 512,
      height: 768,
      steps: 30,
      cfg_scale: 7,
      sampler_name: 'DPM++ 2M',
      prompt: 'professional portrait photo, studio lighting, bokeh background',
      negative_prompt: 'low quality, blurry, bad anatomy, amateur',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-landscape',
    name: 'Landscape Vista',
    description: 'Wide landscape photography',
    category: 'Photography',
    params: {
      width: 768,
      height: 512,
      steps: 25,
      cfg_scale: 6,
      sampler_name: 'Euler a',
      prompt: 'beautiful landscape, golden hour, wide angle, nature photography',
      negative_prompt: 'people, buildings, low quality, blurry',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-anime',
    name: 'Anime Character',
    description: 'High quality anime/manga style',
    category: 'Anime',
    params: {
      width: 512,
      height: 768,
      steps: 28,
      cfg_scale: 7,
      sampler_name: 'DPM++ 2M Karras',
      prompt: 'anime character, masterpiece, best quality, detailed anime style',
      negative_prompt: 'realistic, photo, 3d, low quality, worst quality, bad anatomy',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-photorealistic',
    name: 'Photorealistic',
    description: 'Ultra realistic photo-quality images',
    category: 'Realistic',
    params: {
      width: 768,
      height: 768,
      steps: 35,
      cfg_scale: 8,
      sampler_name: 'DPM++ SDE Karras',
      prompt: 'photorealistic, highly detailed, professional photography, 8k, dslr',
      negative_prompt: 'illustration, painting, drawing, art, low quality',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-artistic',
    name: 'Artistic Illustration',
    description: 'Digital art with painterly style',
    category: 'Art',
    params: {
      width: 768,
      height: 768,
      steps: 30,
      cfg_scale: 7.5,
      sampler_name: 'Euler a',
      prompt: 'digital art, illustration, artistic, painterly style, trending on artstation',
      negative_prompt: 'photo, photorealistic, low quality, bad anatomy',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-quick',
    name: 'Quick Generation',
    description: 'Fast generation with fewer steps',
    category: 'Quick',
    params: {
      width: 512,
      height: 512,
      steps: 15,
      cfg_scale: 6,
      sampler_name: 'Euler a',
      prompt: 'high quality, detailed',
      negative_prompt: 'low quality, blurry',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export function usePresets() {
  const [presets, setPresets] = useState<WorkflowPreset[]>(() => {
    try {
      const stored = localStorage.getItem(PRESETS_KEY);
      const userPresets = stored ? JSON.parse(stored) : [];
      // Combine default presets with user presets
      return [...DEFAULT_PRESETS, ...userPresets];
    } catch (error) {
      console.error('Failed to load presets:', error);
      return DEFAULT_PRESETS;
    }
  });

  // Save user presets (excluding defaults) to localStorage
  useEffect(() => {
    try {
      const userPresets = presets.filter((p) => !p.id.startsWith('default-'));
      localStorage.setItem(PRESETS_KEY, JSON.stringify(userPresets));
    } catch (error) {
      console.error('Failed to save presets:', error);
    }
  }, [presets]);

  const savePreset = (
    name: string,
    description: string,
    category: string,
    params: Partial<GenerationParams>,
    thumbnail?: string
  ) => {
    const newPreset: WorkflowPreset = {
      id: `preset-${Date.now()}`,
      name,
      description,
      category,
      params,
      thumbnail,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isFavorite: false,
    };

    setPresets((prev) => [...prev, newPreset]);
    return newPreset;
  };

  const updatePreset = (id: string, updates: Partial<WorkflowPreset>) => {
    setPresets((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: Date.now() }
          : p
      )
    );
  };

  const deletePreset = (id: string) => {
    // Don't allow deleting default presets
    if (id.startsWith('default-')) return;
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setPresets((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
  };

  const exportPreset = (id: string): string => {
    const preset = presets.find((p) => p.id === id);
    if (!preset) throw new Error('Preset not found');

    return JSON.stringify(preset, null, 2);
  };

  const importPreset = (json: string): WorkflowPreset => {
    const preset = JSON.parse(json) as WorkflowPreset;
    
    // Generate new ID to avoid conflicts
    const imported: WorkflowPreset = {
      ...preset,
      id: `preset-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setPresets((prev) => [...prev, imported]);
    return imported;
  };

  const exportAllPresets = (): string => {
    const userPresets = presets.filter((p) => !p.id.startsWith('default-'));
    return JSON.stringify(userPresets, null, 2);
  };

  const importAllPresets = (json: string): number => {
    const imported = JSON.parse(json) as WorkflowPreset[];
    
    const withNewIds = imported.map((preset) => ({
      ...preset,
      id: `preset-${Date.now()}-${Math.random()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    setPresets((prev) => [...prev, ...withNewIds]);
    return withNewIds.length;
  };

  const getPresetsByCategory = (category: string): WorkflowPreset[] => {
    return presets.filter((p) => p.category === category);
  };

  const getCategories = (): string[] => {
    const categories = new Set(presets.map((p) => p.category));
    return Array.from(categories).sort();
  };

  const searchPresets = (query: string): WorkflowPreset[] => {
    const lowerQuery = query.toLowerCase();
    return presets.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    presets,
    savePreset,
    updatePreset,
    deletePreset,
    toggleFavorite,
    exportPreset,
    importPreset,
    exportAllPresets,
    importAllPresets,
    getPresetsByCategory,
    getCategories,
    searchPresets,
  };
}
