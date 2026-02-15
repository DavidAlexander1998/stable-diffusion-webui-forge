import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LoRAConfig, LoRAModel } from '../types';
import './LoraPanel.css';

interface LoraPanelProps {
  loras: LoRAConfig[];
  availableModels: LoRAModel[];
  onChange: (loras: LoRAConfig[]) => void;
  onRefresh: () => void;
}

export const LoraPanel: React.FC<LoraPanelProps> = ({
  loras,
  availableModels,
  onChange,
  onRefresh,
}) => {
  const [showBrowser, setShowBrowser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const addLora = (model: LoRAModel) => {
    const newLora: LoRAConfig = {
      name: model.name,
      model: model.name,
      weight: 1.0,
      enabled: true,
    };
    onChange([...loras, newLora]);
    setShowBrowser(false);
    setSearchQuery('');
  };

  const removeLora = (index: number) => {
    onChange(loras.filter((_, i) => i !== index));
  };

  const updateLora = (index: number, updates: Partial<LoRAConfig>) => {
    onChange(
      loras.map((lora, i) => (i === index ? { ...lora, ...updates } : lora))
    );
  };

  const filteredModels = availableModels.filter((model) =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="lora-panel">
      <div className="lora-header">
        <h3>LoRA Models</h3>
        <div className="lora-header-actions">
          <button className="btn-icon" onClick={onRefresh} title="Refresh LoRAs">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M13.65 2.35C12.2 0.9 10.21 0 8 0C3.58 0 0.01 3.58 0.01 8C0.01 12.42 3.58 16 8 16C11.73 16 14.84 13.45 15.73 10H13.65C12.83 12.33 10.61 14 8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C9.66 2 11.14 2.69 12.22 3.78L9 7H16V0L13.65 2.35Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button className="btn-icon" onClick={() => setShowBrowser(true)} title="Add LoRA">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M14 7H9V2C9 1.45 8.55 1 8 1C7.45 1 7 1.45 7 2V7H2C1.45 7 1 7.45 1 8C1 8.55 1.45 9 2 9H7V14C7 14.55 7.45 15 8 15C8.55 15 9 14.55 9 14V9H14C14.55 9 15 8.55 15 8C15 7.45 14.55 7 14 7Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="lora-list">
        <AnimatePresence>
          {loras.map((lora, index) => (
            <motion.div
              key={`${lora.model}-${index}`}
              className="lora-item"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="lora-item-header">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={lora.enabled}
                    onChange={(e) => updateLora(index, { enabled: e.target.checked })}
                  />
                  <span className="lora-name">{lora.name}</span>
                </label>
                <button
                  className="btn-remove"
                  onClick={() => removeLora(index)}
                  title="Remove LoRA"
                >
                  ×
                </button>
              </div>

              <div className="lora-weight-control">
                <label>
                  <span>Weight</span>
                  <div className="weight-input-group">
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.05"
                      value={lora.weight}
                      onChange={(e) => updateLora(index, { weight: parseFloat(e.target.value) })}
                      className="weight-slider"
                    />
                    <input
                      type="number"
                      min="-2"
                      max="2"
                      step="0.05"
                      value={lora.weight}
                      onChange={(e) => updateLora(index, { weight: parseFloat(e.target.value) })}
                      className="weight-number"
                    />
                  </div>
                </label>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loras.length === 0 && (
          <div className="lora-empty">
            <p>No LoRA models added</p>
            <button className="btn-secondary" onClick={() => setShowBrowser(true)}>
              Add LoRA
            </button>
          </div>
        )}
      </div>

      {/* LoRA Browser Modal */}
      <AnimatePresence>
        {showBrowser && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBrowser(false)}
          >
            <motion.div
              className="lora-browser"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="browser-header">
                <h3>LoRA Browser</h3>
                <button className="btn-close" onClick={() => setShowBrowser(false)}>
                  ×
                </button>
              </div>

              <div className="browser-search">
                <input
                  type="text"
                  placeholder="Search LoRA models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  autoFocus
                />
              </div>

              <div className="browser-list">
                {filteredModels.length === 0 ? (
                  <div className="browser-empty">
                    <p>No LoRA models found</p>
                    <button className="btn-secondary" onClick={onRefresh}>
                      Refresh Models
                    </button>
                  </div>
                ) : (
                  filteredModels.map((model) => (
                    <div key={model.name} className="browser-item">
                      <div className="browser-item-info">
                        <span className="browser-item-name">{model.name}</span>
                        <span className="browser-item-path">{model.path}</span>
                      </div>
                      <button
                        className="btn-add"
                        onClick={() => addLora(model)}
                        disabled={loras.some((l) => l.model === model.name)}
                      >
                        {loras.some((l) => l.model === model.name) ? 'Added' : 'Add'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
