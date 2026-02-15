import { useState, useEffect } from 'react';

export interface AppSettings {
  autoSaveImages: boolean;
  showLivePreview: boolean;
  confirmBeforeGenerate: boolean;
}

const SETTINGS_KEY = 'forge-ui-settings';

const DEFAULT_SETTINGS: AppSettings = {
  autoSaveImages: false,
  showLivePreview: true,
  confirmBeforeGenerate: false
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateSetting,
    resetSettings
  };
}
