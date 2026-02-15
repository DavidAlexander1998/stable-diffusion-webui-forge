import React from 'react';
import type { Upscaler } from '../types';
import './HiresFixPanel.css';

interface HiresFixPanelProps {
  enabled: boolean;
  scale: number;
  upscaler: string;
  denoisingStrength: number;
  secondPassSteps: number;
  availableUpscalers: Upscaler[];
  onEnabledChange: (enabled: boolean) => void;
  onScaleChange: (scale: number) => void;
  onUpscalerChange: (upscaler: string) => void;
  onDenoisingStrengthChange: (strength: number) => void;
  onSecondPassStepsChange: (steps: number) => void;
}

export const HiresFixPanel: React.FC<HiresFixPanelProps> = ({
  enabled,
  scale,
  upscaler,
  denoisingStrength,
  secondPassSteps,
  availableUpscalers,
  onEnabledChange,
  onScaleChange,
  onUpscalerChange,
  onDenoisingStrengthChange,
  onSecondPassStepsChange,
}) => {
  return (
    <div className="hires-fix-panel">
      <div className="hires-fix-header">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="toggle-input"
          />
          <span className="toggle-slider"></span>
          <span className="toggle-text">Enable Hires Fix</span>
        </label>
      </div>

      {enabled && (
        <div className="hires-fix-content">
          <div className="control-group">
            <label>
              <span className="control-label">Upscaler</span>
              <select
                value={upscaler}
                onChange={(e) => onUpscalerChange(e.target.value)}
                className="control-select"
              >
                {availableUpscalers.map((up) => (
                  <option key={up.name} value={up.name}>
                    {up.name} {up.scale && `(${up.scale}x)`}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="control-group">
            <label>
              <div className="control-label-row">
                <span className="control-label">Upscale Scale</span>
                <span className="control-value">{scale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="0.1"
                value={scale}
                onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                className="control-slider"
              />
            </label>
          </div>

          <div className="control-group">
            <label>
              <div className="control-label-row">
                <span className="control-label">Denoising Strength</span>
                <span className="control-value">{denoisingStrength.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={denoisingStrength}
                onChange={(e) => onDenoisingStrengthChange(parseFloat(e.target.value))}
                className="control-slider"
              />
            </label>
          </div>

          <div className="control-group">
            <label>
              <div className="control-label-row">
                <span className="control-label">Hires Steps</span>
                <span className="control-value">{secondPassSteps}</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                step="1"
                value={secondPassSteps}
                onChange={(e) => onSecondPassStepsChange(parseInt(e.target.value))}
                className="control-slider"
              />
              <div className="control-hint">0 = use same as sampling steps</div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
