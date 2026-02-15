import { useState, useEffect } from "react";
import { forgeAPI } from "../services/api";

export interface ModelInfo {
  name: string;
  title: string;
  hash?: string;
  filename: string;
  isFavorite?: boolean;
  lastUsed?: number;
}

export interface UseModelManagerReturn {
  models: ModelInfo[];
  isLoading: boolean;
  error: string | null;
  favorites: string[];
  recentModels: string[];
  refreshModels: () => Promise<void>;
  toggleFavorite: (modelName: string) => void;
  searchModels: (query: string) => ModelInfo[];
}

const FAVORITES_KEY = "forge-favorite-models";
const RECENT_MODELS_KEY = "forge-recent-models";

export function useModelManager(): UseModelManagerReturn {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentModels, setRecentModels] = useState<string[]>([]);

  // Load favorites and recent from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    const storedRecent = localStorage.getItem(RECENT_MODELS_KEY);

    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        console.error("Failed to parse favorites:", e);
      }
    }

    if (storedRecent) {
      try {
        setRecentModels(JSON.parse(storedRecent));
      } catch (e) {
        console.error("Failed to parse recent models:", e);
      }
    }
  }, []);

  // Fetch models from API
  const refreshModels = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const modelData = await forgeAPI.getSDModels();

      // Transform to ModelInfo objects
      const modelInfos: ModelInfo[] = modelData.map(
        (model: {
          title: string;
          model_name: string;
          hash: string;
          filename: string;
        }) => ({
          name: model.model_name,
          title:
            model.title ||
            model.model_name.replace(/\.safetensors$|\.ckpt$/, ""),
          hash: model.hash,
          filename: model.filename,
          isFavorite: favorites.includes(model.model_name),
          lastUsed:
            recentModels.indexOf(model.model_name) !== -1
              ? Date.now() - recentModels.indexOf(model.model_name) * 100000
              : undefined,
        }),
      );

      setModels(modelInfos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch models");
      console.error("Failed to fetch models:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update models when favorites change
  useEffect(() => {
    setModels((prevModels) =>
      prevModels.map((model) => ({
        ...model,
        isFavorite: favorites.includes(model.name),
      })),
    );
  }, [favorites]);

  const toggleFavorite = (modelName: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(modelName)
        ? prev.filter((name) => name !== modelName)
        : [...prev, modelName];

      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const searchModels = (query: string): ModelInfo[] => {
    if (!query.trim()) return models;

    const lowerQuery = query.toLowerCase();
    return models.filter(
      (model) =>
        model.title.toLowerCase().includes(lowerQuery) ||
        model.name.toLowerCase().includes(lowerQuery),
    );
  };

  // Track model usage
  useEffect(() => {
    // This would be called when a model is selected for generation
    // For now, just load from storage
  }, []);

  return {
    models,
    isLoading,
    error,
    favorites,
    recentModels,
    refreshModels,
    toggleFavorite,
    searchModels,
  };
}
