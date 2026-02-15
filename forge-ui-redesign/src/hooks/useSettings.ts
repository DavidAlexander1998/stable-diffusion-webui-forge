import { useState, useEffect } from 'react';
import { ControlMode } from '../types';

export interface AppSettings {
  // Core Settings
  autoSaveImages: boolean;
  showLivePreview: boolean;
  confirmBeforeGenerate: boolean;
  
  // Image Settings
  saveFormat: 'png' | 'jpg' | 'webp';
  imageQuality: number; // 1-100 for jpg/webp
  embedMetadata: boolean;
  
  // UI Settings
  theme: 'dark' | 'light' | 'auto';
  defaultControlMode: ControlMode;
  
  // Generation Settings
  autoHiresFix: boolean; // Auto-enable Hires Fix for resolutions > 1024
  nsfwFilter: boolean;
}

const SETTINGS_KEY = 'forge-ui-settings';

const DEFAULT_SETTINGS: AppSettings = {
  // Core Settings
  autoSaveImages: false,
  showLivePreview: true,
  confirmBeforeGenerate: false,
  
  // Image Settings
  saveFormat: 'png',
  imageQuality: 95,
  embedMetadata: true,
  
  // UI Settings
  theme: 'dark',
  defaultControlMode: 'standard',
  
  // Generation Settings
  autoHiresFix: false,
  nsfwFilter: false
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
