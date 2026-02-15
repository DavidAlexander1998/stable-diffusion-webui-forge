import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Settings,
  Cpu,
  Clock,
  Wifi,
  WifiOff,
  Folder,
  Package,
} from "lucide-react";
import { useApiStatus } from "../hooks/useApiStatus";
import { useSystemStatus } from "../hooks/useSystemStatus";
import SettingsModal from "./SettingsModal";
import ModelManager from "./ModelManager";
import "./Header.css";

interface HeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onOpenPresets?: () => void;
}

const MODELS = [
  "prefectPonyXL_v6.safetensors",
  "sd_xl_base_1.0.safetensors",
  "animagineXLV3_v30.safetensors",
  "juggernautXL_v9.safetensors",
];

export default function Header({
  selectedModel,
  onModelChange,
  onOpenPresets,
}: HeaderProps) {
  const [showModelManager, setShowModelManager] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const apiStatus = useApiStatus();
  const systemStatus = useSystemStatus();

  return (
    <motion.header
      className="header card"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-content">
        {/* Logo & Brand */}
        <div className="header-brand">
          <div className="logo-container">
            <Sparkles className="logo-icon" />
          </div>
          <div>
            <h1 className="brand-title">FORGE</h1>
            <p className="brand-subtitle">Cinematic Studio</p>
          </div>
        </div>

        {/* Model Selector */}
        <div className="model-selector-container">
          <button
            className="model-selector"
            onClick={() => setShowModelSelector(!showModelSelector)}
          >
            <div className="model-info">
              <span className="model-label">Active Model</span>
              <span className="model-name">{selectedModel}</span>
            </div>
            <motion.div
              animate={{ rotate: showModelSelector ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.div>
          </button>

          {showModelSelector && (
            <motion.div
              className="model-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {MODELS.map((model) => (
                <button
                  key={model}
                  className={`model-option ${model === selectedModel ? "active" : ""}`}
                  onClick={() => {
                    onModelChange(model);
                    setShowModelSelector(false);
                  }}
                >
                  {model}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="header-status">
          {/* API Connection Status */}
          <div
            className={`status-item ${apiStatus.isConnected ? "status-connected" : "status-disconnected"}`}
            title={apiStatus.error || "API Connected"}
          >
            {apiStatus.isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <div className="status-details">
              <span className="status-label">API</span>
              <span className="status-value">
                {apiStatus.isConnected ? "Connected" : "Offline"}
              </span>
            </div>
          </div>

          <div className="status-item">
            <Cpu size={16} />
            <div className="status-details">
              <span className="status-label">GPU</span>
              <div className="gpu-bar">
                <motion.div
                  className="gpu-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${systemStatus.gpuUsage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <span
                className="status-value"
                title={`${systemStatus.gpuMemoryUsed.toFixed(1)}GB / ${systemStatus.gpuMemoryTotal.toFixed(1)}GB`}
              >
                {systemStatus.gpuUsage}%
              </span>
            </div>
          </div>

          <div className="status-item">
            <Clock size={16} />
            <div className="status-details">
              <span className="status-label">Queue</span>
              <span className="status-value">
                {systemStatus.queueRunning} / {systemStatus.queuePending}
              </span>
            </div>
          </div>
        </div>

        {/* Presets Button */}
        <button
          className="header-settings"
          onClick={() => onOpenPresets?.()}
          title="Workflow Presets"
        >
          <Folder size={20} />
        </button>
Model Manager Button */}
        <button
          className="header-settings"
          onClick={() => setShowModelManager(true)}
          title="Model Manager"
        >
          <Package size={20} />
        </button>

        {/* Settings Button */}
        <button
          className="header-settings"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Model Manager Modal */}
      <ModelManager
        isOpen={showModelManager}
        onClose={() => setShowModelManager(false)}
        selectedModel={selectedModel}
        onModelSelect={onModelChange}
      /utton>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </motion.header>
  );
}
