import { Trash2, Play, Upload } from 'lucide-react';
import ImageUpload from './ImageUpload';
import './BatchPanel.css';

export type BatchOperation = 'img2img' | 'inpaint' | 'upscale' | 'face_restore';

export interface BatchItem {
  id: number;
  image: string;
  mask?: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  result?: string;
  overridePrompt?: string;
  overrideDenoising?: number;
}

export interface BatchOptions {
  operation: BatchOperation;
  upscaler: string;
  scale: number;
  useCodeformer: boolean;
  codeformerWeight: number;
  tileUpscale: boolean;
}

interface BatchPanelProps {
  items: BatchItem[];
  options: BatchOptions;
  onOptionsChange: (options: BatchOptions) => void;
  onAddImages: (base64List: string[]) => void;
  onUpdateItem: (id: number, updates: Partial<BatchItem>) => void;
  onRemoveItem: (id: number) => void;
  onClear: () => void;
  onRun: () => void;
  isRunning: boolean;
  availableUpscalers: string[];
}

export default function BatchPanel({
  items,
  options,
  onOptionsChange,
  onAddImages,
  onUpdateItem,
  onRemoveItem,
  onClear,
  onRun,
  isRunning,
  availableUpscalers,
}: BatchPanelProps) {
  return (
    <div className="batch-panel">
      <div className="batch-header">
        <div>
          <h4>Batch Processing</h4>
          <p>Run the same settings across multiple images.</p>
        </div>
        <div className="batch-actions">
          <button className="batch-clear" onClick={onClear} type="button" disabled={isRunning}>
            <Trash2 size={14} />
            Clear
          </button>
          <button
            className="batch-run"
            onClick={onRun}
            type="button"
            disabled={items.length === 0 || isRunning}
          >
            <Play size={14} />
            {isRunning ? 'Running...' : 'Run Batch'}
          </button>
        </div>
      </div>

      <div className="batch-options">
        <label>
          Operation
          <select
            value={options.operation}
            onChange={(event) =>
              onOptionsChange({
                ...options,
                operation: event.target.value as BatchOperation,
              })
            }
          >
            <option value="img2img">Image to Image</option>
            <option value="inpaint">Inpaint</option>
            <option value="upscale">Upscale</option>
            <option value="face_restore">Face Restore</option>
          </select>
        </label>

        {(options.operation === 'upscale' || options.operation === 'face_restore') && (
          <>
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
          </>
        )}
      </div>

      <div className="batch-upload">
        <ImageUpload
          onImageSelect={() => undefined}
          onImagesSelect={onAddImages}
          onRemove={() => undefined}
          allowMultiple
          label="Upload Batch Images"
        />
        <div className="batch-upload-hint">
          <Upload size={14} />
          Add up to 10 images at once.
        </div>
      </div>

      {items.length === 0 ? (
        <div className="batch-empty">No images queued yet.</div>
      ) : (
        <div className="batch-grid">
          {items.map((item) => (
            <div key={item.id} className={`batch-card status-${item.status}`}>
              <div className="batch-card-top">
                <img src={item.image} alt="Batch source" />
                <button
                  className="batch-remove"
                  onClick={() => onRemoveItem(item.id)}
                  type="button"
                  disabled={isRunning}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {options.operation === 'inpaint' && (
                <div className="batch-mask">
                  <ImageUpload
                    onImageSelect={(base64) => onUpdateItem(item.id, { mask: base64 })}
                    onRemove={() => onUpdateItem(item.id, { mask: undefined })}
                    currentImage={item.mask}
                    label="Mask"
                  />
                </div>
              )}

              <div className="batch-overrides">
                <label>
                  Prompt Override
                  <input
                    type="text"
                    value={item.overridePrompt ?? ''}
                    onChange={(event) =>
                      onUpdateItem(item.id, { overridePrompt: event.target.value })
                    }
                    placeholder="Leave blank to use main prompt"
                  />
                </label>
                {(options.operation === 'img2img' || options.operation === 'inpaint') && (
                  <label>
                    Denoising
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={item.overrideDenoising ?? 0.75}
                      onChange={(event) =>
                        onUpdateItem(item.id, {
                          overrideDenoising: parseFloat(event.target.value),
                        })
                      }
                    />
                    <span>{(item.overrideDenoising ?? 0.75).toFixed(2)}</span>
                  </label>
                )}
              </div>

              <div className="batch-status">
                <span>{item.status}</span>
              </div>

              {item.result && (
                <div className="batch-result">
                  <img src={item.result} alt="Batch result" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="batch-footer">
        <button className="batch-clear" onClick={onClear} type="button" disabled={isRunning}>
          <Trash2 size={14} />
          Clear
        </button>
        <button
          className="batch-run"
          onClick={onRun}
          type="button"
          disabled={items.length === 0 || isRunning}
        >
          <Play size={14} />
          {isRunning ? 'Running...' : 'Run Batch'}
        </button>
      </div>
    </div>
  );
}
