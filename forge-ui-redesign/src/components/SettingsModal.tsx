import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  RotateCcw,
  Download,
  Upload,
  Eye,
  Palette,
  Sliders,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Zap,
  Bell,
  Keyboard,
  Database,
  Shield,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AppSettings {
  // Generation Settings
  autoSaveImages: boolean;
  saveFormat: 'png' | 'jpeg' | 'webp';
  imageQuality: number;
  embedMetadata: boolean;
  defaultSeed: number;
  seedIncrement: boolean;

  // UI Settings
  theme: 'dark' | 'light' | 'auto';
  showLivePreview: boolean;
  confirmBeforeGenerate: boolean;
  defaultControlMode: 'minimal' | 'standard' | 'advanced' | 'expert';
  showTooltips: boolean;
  compactMode: boolean;

  // Advanced Settings
  autoApplyHiresFix: boolean;
  hiresFixThreshold: number;
  maxHistoryItems: number;
  enableKeyboardShortcuts: boolean;

  // Notifications
  notifyOnComplete: boolean;
  notifyOnError: boolean;
  soundEffects: boolean;

  // Performance
  previewQuality: 'low' | 'medium' | 'high';
  lazyLoadHistory: boolean;
  imageCache: boolean;

  // Privacy & Security
  nsfwFilter: boolean;
  analyticsEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoSaveImages: false,
  saveFormat: 'png',
  imageQuality: 95,
  embedMetadata: true,
  defaultSeed: -1,
  seedIncrement: true,

  theme: 'dark',
  showLivePreview: true,
  confirmBeforeGenerate: false,
  defaultControlMode: 'standard',
  showTooltips: true,
  compactMode: false,

  autoApplyHiresFix: false,
  hiresFixThreshold: 1024,
  maxHistoryItems: 100,
  enableKeyboardShortcuts: true,

  notifyOnComplete: true,
  notifyOnError: true,
  soundEffects: false,

  previewQuality: 'medium',
  lazyLoadHistory: true,
  imageCache: true,

  nsfwFilter: false,
  analyticsEnabled: false,
};

type SettingsCategory = 'generation' | 'interface' | 'advanced' | 'notifications' | 'performance' | 'privacy';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('generation');
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('forge-ui-settings-full');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('forge-ui-settings-full', JSON.stringify(settings));
    setHasChanges(false);
    // Dispatch event for other components to react to settings changes
    window.dispatchEvent(new CustomEvent('settings-updated', { detail: settings }));
  };

  const resetToDefaults = () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      setSettings(DEFAULT_SETTINGS);
      setHasChanges(true);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forge-settings-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string);
            setSettings({ ...DEFAULT_SETTINGS, ...imported });
            setHasChanges(true);
          } catch (err) {
            alert('Invalid settings file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const categories = [
    { id: 'generation' as const, label: 'Generation', icon: ImageIcon },
    { id: 'interface' as const, label: 'Interface', icon: Palette },
    { id: 'advanced' as const, label: 'Advanced', icon: Sliders },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'performance' as const, label: 'Performance', icon: Zap },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
  ];

  if (!isOpen) return null;

  // Ensure document.body exists for portal
  if (typeof document === 'undefined' || !document.body) return null;

  return createPortal(
    <AnimatePresence>
      <div className="settings-modal-overlay" onClick={onClose}>
        <motion.div
          className="settings-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="settings-header">
            <div className="settings-title-group">
              <SettingsIcon size={24} />
              <div>
                <h2 className="settings-title">Settings</h2>
                <p className="settings-subtitle">Configure your Forge experience</p>
              </div>
            </div>
            <button className="settings-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="settings-content">
            {/* Sidebar */}
            <div className="settings-sidebar">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`settings-category ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <cat.icon size={18} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Settings Panel */}
            <div className="settings-panel">
              {activeCategory === 'generation' && (
                <div className="settings-section">
                  <h3 className="section-title">Image Generation</h3>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.autoSaveImages}
                        onChange={(e) => updateSetting('autoSaveImages', e.target.checked)}
                      />
                      <span>Auto-save generated images</span>
                    </label>
                    <p className="setting-hint">Automatically download images to your default folder</p>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label-text">Save Format</label>
                    <div className="setting-radio-group">
                      {(['png', 'jpeg', 'webp'] as const).map(format => (
                        <label key={format} className="radio-label">
                          <input
                            type="radio"
                            name="saveFormat"
                            checked={settings.saveFormat === format}
                            onChange={() => updateSetting('saveFormat', format)}
                          />
                          <span>{format.toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {(settings.saveFormat === 'jpeg' || settings.saveFormat === 'webp') && (
                    <div className="setting-group">
                      <label className="setting-label-text">
                        Image Quality: {settings.imageQuality}%
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={settings.imageQuality}
                        onChange={(e) => updateSetting('imageQuality', parseInt(e.target.value))}
                        className="setting-slider"
                      />
                    </div>
                  )}

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.embedMetadata}
                        onChange={(e) => updateSetting('embedMetadata', e.target.checked)}
                      />
                      <span>Embed generation metadata in images</span>
                    </label>
                    <p className="setting-hint">Include prompt, seed, and parameters in saved files</p>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.seedIncrement}
                        onChange={(e) => updateSetting('seedIncrement', e.target.checked)}
                      />
                      <span>Auto-increment seed after generation</span>
                    </label>
                    <p className="setting-hint">Automatically use new seed for next generation</p>
                  </div>
                </div>
              )}

              {activeCategory === 'interface' && (
                <div className="settings-section">
                  <h3 className="section-title">User Interface</h3>

                  <div className="setting-group">
                    <label className="setting-label-text">Theme</label>
                    <div className="setting-radio-group">
                      {[
                        { value: 'dark' as const, icon: Moon, label: 'Dark' },
                        { value: 'light' as const, icon: Sun, label: 'Light' },
                        { value: 'auto' as const, icon: Monitor, label: 'Auto' }
                      ].map(({ value, icon: Icon, label }) => (
                        <label key={value} className="radio-label">
                          <input
                            type="radio"
                            name="theme"
                            checked={settings.theme === value}
                            onChange={() => updateSetting('theme', value)}
                          />
                          <Icon size={16} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.showLivePreview}
                        onChange={(e) => updateSetting('showLivePreview', e.target.checked)}
                      />
                      <span>Show live preview during generation</span>
                    </label>
                    <p className="setting-hint">Display progressive preview as image generates</p>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.confirmBeforeGenerate}
                        onChange={(e) => updateSetting('confirmBeforeGenerate', e.target.checked)}
                      />
                      <span>Confirm before generating</span>
                    </label>
                    <p className="setting-hint">Show confirmation dialog before expensive operations</p>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label-text">Default Control Mode</label>
                    <div className="setting-radio-group vertical">
                      {(['minimal', 'standard', 'advanced', 'expert'] as const).map(mode => (
                        <label key={mode} className="radio-label">
                          <input
                            type="radio"
                            name="controlMode"
                            checked={settings.defaultControlMode === mode}
                            onChange={() => updateSetting('defaultControlMode', mode)}
                          />
                          <span className="capitalize">{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.showTooltips}
                        onChange={(e) => updateSetting('showTooltips', e.target.checked)}
                      />
                      <span>Show tooltips on hover</span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.compactMode}
                        onChange={(e) => updateSetting('compactMode', e.target.checked)}
                      />
                      <span>Compact mode (reduce spacing)</span>
                    </label>
                  </div>
                </div>
              )}

              {activeCategory === 'advanced' && (
                <div className="settings-section">
                  <h3 className="section-title">Advanced Options</h3>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.autoApplyHiresFix}
                        onChange={(e) => updateSetting('autoApplyHiresFix', e.target.checked)}
                      />
                      <span>Auto-apply Hires Fix for large resolutions</span>
                    </label>
                    <p className="setting-hint">Automatically enable Hires Fix when dimensions exceed threshold</p>
                  </div>

                  {settings.autoApplyHiresFix && (
                    <div className="setting-group">
                      <label className="setting-label-text">
                        Hires Fix Threshold: {settings.hiresFixThreshold}px
                      </label>
                      <input
                        type="range"
                        min="512"
                        max="2048"
                        step="64"
                        value={settings.hiresFixThreshold}
                        onChange={(e) => updateSetting('hiresFixThreshold', parseInt(e.target.value))}
                        className="setting-slider"
                      />
                      <p className="setting-hint">Apply Hires Fix when width or height exceeds this value</p>
                    </div>
                  )}

                  <div className="setting-group">
                    <label className="setting-label-text">
                      Max History Items: {settings.maxHistoryItems}
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="500"
                      step="10"
                      value={settings.maxHistoryItems}
                      onChange={(e) => updateSetting('maxHistoryItems', parseInt(e.target.value))}
                      className="setting-slider"
                    />
                    <p className="setting-hint">Maximum number of images to keep in history</p>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.enableKeyboardShortcuts}
                        onChange={(e) => updateSetting('enableKeyboardShortcuts', e.target.checked)}
                      />
                      <span>Enable keyboard shortcuts</span>
                    </label>
                    <div className="keyboard-shortcuts-hint">
                      <Keyboard size={14} />
                      <span>Ctrl+Enter: Generate | Ctrl+I: Interrupt | Ctrl+S: Save</span>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'notifications' && (
                <div className="settings-section">
                  <h3 className="section-title">Notifications</h3>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.notifyOnComplete}
                        onChange={(e) => updateSetting('notifyOnComplete', e.target.checked)}
                      />
                      <span>Notify when generation completes</span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.notifyOnError}
                        onChange={(e) => updateSetting('notifyOnError', e.target.checked)}
                      />
                      <span>Notify on errors</span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.soundEffects}
                        onChange={(e) => updateSetting('soundEffects', e.target.checked)}
                      />
                      <span>Enable sound effects</span>
                    </label>
                    <p className="setting-hint">Play sound on generation complete or error</p>
                  </div>
                </div>
              )}

              {activeCategory === 'performance' && (
                <div className="settings-section">
                  <h3 className="section-title">Performance</h3>

                  <div className="setting-group">
                    <label className="setting-label-text">Preview Quality</label>
                    <div className="setting-radio-group">
                      {(['low', 'medium', 'high'] as const).map(quality => (
                        <label key={quality} className="radio-label">
                          <input
                            type="radio"
                            name="previewQuality"
                            checked={settings.previewQuality === quality}
                            onChange={() => updateSetting('previewQuality', quality)}
                          />
                          <span className="capitalize">{quality}</span>
                        </label>
                      ))}
                    </div>
                    <p className="setting-hint">Higher quality uses more bandwidth during generation</p>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.lazyLoadHistory}
                        onChange={(e) => updateSetting('lazyLoadHistory', e.target.checked)}
                      />
                      <span>Lazy load history images</span>
                    </label>
                    <p className="setting-hint">Load images as you scroll (improves performance)</p>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.imageCache}
                        onChange={(e) => updateSetting('imageCache', e.target.checked)}
                      />
                      <span>Enable image caching</span>
                    </label>
                    <p className="setting-hint">Cache generated images for faster loading</p>
                  </div>
                </div>
              )}

              {activeCategory === 'privacy' && (
                <div className="settings-section">
                  <h3 className="section-title">Privacy & Security</h3>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.nsfwFilter}
                        onChange={(e) => updateSetting('nsfwFilter', e.target.checked)}
                      />
                      <span>Enable NSFW filter</span>
                    </label>
                    <p className="setting-hint">Filter potentially sensitive content</p>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.analyticsEnabled}
                        onChange={(e) => updateSetting('analyticsEnabled', e.target.checked)}
                      />
                      <span>Enable anonymous analytics</span>
                    </label>
                    <p className="setting-hint">Help improve Forge by sharing anonymous usage data</p>
                  </div>

                  <div className="setting-group">
                    <div className="data-management">
                      <Database size={18} />
                      <div>
                        <h4>Local Data</h4>
                        <p>Settings and history are stored locally in your browser</p>
                        <button className="danger-button" onClick={() => {
                          if (confirm('Clear all local data? This will reset settings and delete history.')) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}>
                          Clear All Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="settings-footer">
            <div className="settings-actions-left">
              <button className="settings-button secondary" onClick={importSettings}>
                <Upload size={16} />
                Import
              </button>
              <button className="settings-button secondary" onClick={exportSettings}>
                <Download size={16} />
                Export
              </button>
              <button className="settings-button danger" onClick={resetToDefaults}>
                <RotateCcw size={16} />
                Reset to Defaults
              </button>
            </div>
            <div className="settings-actions-right">
              <button className="settings-button secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className={`settings-button primary ${hasChanges ? '' : 'disabled'}`}
                onClick={saveSettings}
                disabled={!hasChanges}
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
