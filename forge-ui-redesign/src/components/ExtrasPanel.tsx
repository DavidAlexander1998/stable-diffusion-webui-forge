import ImageUpload from './ImageUpload';
import './ExtrasPanel.css';

export interface ExtrasOptions {
  upscaler: string;
  scale: number;
  useCodeformer: boolean;
  codeformerWeight: number;
  tileUpscale: boolean;
}

interface ExtrasPanelProps {
  image: string | null;
  onImageSelect: (base64: string) => void;
  onImageRemove: () => void;
  options: ExtrasOptions;
  onOptionsChange: (options: ExtrasOptions) => void;
  onRun: () => void;
  isRunning: boolean;
  availableUpscalers: string[];
}

export default function ExtrasPanel({
  image,
  onImageSelect,
  onImageRemove,
  options,
  onOptionsChange,
  onRun,
  isRunning,
  availableUpscalers,
}: ExtrasPanelProps) {
  return (
    <div className="extras-panel">
      <div className="extras-header">
        <div>
          <h4>Upscale & Extras</h4>
          <p>Upscale a single image with optional face restoration.</p>
        </div>
        <button
          className="extras-run"
          type="button"
          onClick={onRun}
          disabled={!image || isRunning}
        >
          {isRunning ? 'Processing...' : 'Run Extras'}
        </button>
      </div>

      <ImageUpload
        onImageSelect={onImageSelect}
        onRemove={onImageRemove}
        currentImage={image || undefined}
        label="Upload image for extras"
      />

      <div className="extras-options">
        <label>
          Upscaler
          <select
            value={options.upscaler}
            onChange={(event) =>
              onOptionsChange({
                ...options,
                upscaler: event.target.value,
              })
            }
          >
            {availableUpscalers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Scale
          <input
            type="range"
            min={1}
            max={4}
            step={0.1}
            value={options.scale}
            onChange={(event) =>
              onOptionsChange({
                ...options,
                scale: parseFloat(event.target.value),
              })
            }
          />
          <span>{options.scale.toFixed(1)}x</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={options.useCodeformer}
            onChange={(event) =>
              onOptionsChange({
                ...options,
                useCodeformer: event.target.checked,
              })
            }
          />
          <span>Use CodeFormer</span>
        </label>

        {options.useCodeformer && (
          <label>
            CodeFormer Weight
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={options.codeformerWeight}
              onChange={(event) =>
                onOptionsChange({
                  ...options,
                  codeformerWeight: parseFloat(event.target.value),
                })
              }
            />
            <span>{options.codeformerWeight.toFixed(2)}</span>
          </label>
        )}

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={options.tileUpscale}
            onChange={(event) =>
              onOptionsChange({
                ...options,
                tileUpscale: event.target.checked,
              })
            }
          />
          <span>Tile upscale</span>
        </label>
      </div>
    </div>
  );
}
