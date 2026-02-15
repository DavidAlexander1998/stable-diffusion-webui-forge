import { useMemo, useState } from "react";
import { Plus, Trash2, Eye } from "lucide-react";
import type { ControlNetModel, ControlNetUnit } from "../types";
import ImageUpload from "./ImageUpload";
import { extractBase64 } from "../utils/imageUtils";
import { forgeAPI } from "../services/api";
import "./ControlNetPanel.css";

interface ControlNetPanelProps {
  units: ControlNetUnit[];
  availableModels: ControlNetModel[];
  availableModules: string[];
  onUnitsChange: (units: ControlNetUnit[]) => void;
}

const CONTROL_MODES = [
  { value: 0, label: "Balanced" },
  { value: 1, label: "Prompt Focus" },
  { value: 2, label: "ControlNet Focus" },
];

const RESIZE_MODES = [
  { value: 0, label: "Just Resize" },
  { value: 1, label: "Crop and Resize" },
  { value: 2, label: "Resize and Fill" },
];

const DEFAULT_UNIT = (): ControlNetUnit => ({
  enabled: true,
  module: "none",
  model: "None",
  weight: 1,
  guidance_start: 0,
  guidance_end: 1,
  control_mode: 0,
  resize_mode: 0,
  lowvram: false,
  processor_res: 512,
  threshold_a: 64,
  threshold_b: 64,
  pixel_perfect: true,
});

export default function ControlNetPanel({
  units,
  availableModels,
  availableModules,
  onUnitsChange,
}: ControlNetPanelProps) {
  const [previewImages, setPreviewImages] = useState<Record<number, string>>(
    {},
  );
  const [previewLoading, setPreviewLoading] = useState<Record<number, boolean>>(
    {},
  );

  const modelOptions = useMemo(
    () => ["None", ...availableModels.map((model) => model.model_name)],
    [availableModels],
  );

  const moduleOptions = useMemo(
    () => ["none", ...availableModules],
    [availableModules],
  );

  const handleUnitChange = (
    index: number,
    updated: Partial<ControlNetUnit>,
  ) => {
    const next = units.map((unit, i) =>
      i === index ? { ...unit, ...updated } : unit,
    );
    onUnitsChange(next);
  };

  const handleAddUnit = () => {
    if (units.length >= 3) return;
    onUnitsChange([...units, DEFAULT_UNIT()]);
  };

  const handleRemoveUnit = (index: number) => {
    const next = units.filter((_, i) => i !== index);
    onUnitsChange(next);
  };

  const handlePreview = async (index: number) => {
    const unit = units[index];
    if (!unit?.input_image || !unit.module || unit.module === "none") return;

    try {
      setPreviewLoading((prev) => ({ ...prev, [index]: true }));
      const response = await forgeAPI.detectControlNet(
        unit.module,
        [extractBase64(unit.input_image)],
        unit.processor_res,
        unit.threshold_a,
        unit.threshold_b,
      );

      if (response.images?.[0]) {
        setPreviewImages((prev) => ({
          ...prev,
          [index]: `data:image/png;base64,${response.images[0]}`,
        }));
      }
    } catch (error) {
      console.error("Failed to preview ControlNet:", error);
    } finally {
      setPreviewLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div className="controlnet-panel">
      <div className="controlnet-header">
        <div>
          <h4>ControlNet</h4>
          <p>Guide generation with control maps.</p>
        </div>
        <button
          className="controlnet-add"
          onClick={handleAddUnit}
          type="button"
          disabled={units.length >= 3}
        >
          <Plus size={16} />
          Add Unit
        </button>
      </div>

      {units.length === 0 && (
        <div className="controlnet-empty">No ControlNet units enabled.</div>
      )}

      {units.map((unit, index) => (
        <div className="controlnet-unit" key={`controlnet-${index}`}>
          <div className="controlnet-unit-header">
            <div className="unit-title">
              <span>Unit {index + 1}</span>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={unit.enabled}
                  onChange={(event) =>
                    handleUnitChange(index, { enabled: event.target.checked })
                  }
                />
                <span className="toggle-track" />
              </label>
            </div>
            <button
              className="controlnet-remove"
              onClick={() => handleRemoveUnit(index)}
              type="button"
              title="Remove unit"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="controlnet-grid">
            <label>
              Module
              <select
                value={unit.module}
                onChange={(event) =>
                  handleUnitChange(index, { module: event.target.value })
                }
              >
                {moduleOptions.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Model
              <select
                value={unit.model}
                onChange={(event) =>
                  handleUnitChange(index, { model: event.target.value })
                }
              >
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="controlnet-upload">
            <ImageUpload
              currentImage={unit.input_image}
              onImageSelect={(base64) =>
                handleUnitChange(index, { input_image: base64 })
              }
              onRemove={() =>
                handleUnitChange(index, { input_image: undefined })
              }
              label="Upload control image"
            />
            <div className="controlnet-preview-actions">
              <button
                className="controlnet-preview-btn"
                onClick={() => handlePreview(index)}
                type="button"
                disabled={
                  !unit.input_image ||
                  unit.module === "none" ||
                  previewLoading[index]
                }
              >
                <Eye size={14} />
                {previewLoading[index] ? "Processing..." : "Preview"}
              </button>
              {previewImages[index] && (
                <img src={previewImages[index]} alt="ControlNet preview" />
              )}
            </div>
          </div>

          <div className="controlnet-sliders">
            <label>
              Weight
              <input
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={unit.weight}
                onChange={(event) =>
                  handleUnitChange(index, {
                    weight: parseFloat(event.target.value),
                  })
                }
              />
              <span>{unit.weight.toFixed(2)}</span>
            </label>

            <label>
              Guidance Start
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={unit.guidance_start}
                onChange={(event) =>
                  handleUnitChange(index, {
                    guidance_start: parseFloat(event.target.value),
                  })
                }
              />
              <span>{unit.guidance_start.toFixed(2)}</span>
            </label>

            <label>
              Guidance End
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={unit.guidance_end}
                onChange={(event) =>
                  handleUnitChange(index, {
                    guidance_end: parseFloat(event.target.value),
                  })
                }
              />
              <span>{unit.guidance_end.toFixed(2)}</span>
            </label>
          </div>

          <div className="controlnet-grid">
            <label>
              Control Mode
              <select
                value={unit.control_mode}
                onChange={(event) =>
                  handleUnitChange(index, {
                    control_mode: parseInt(event.target.value, 10),
                  })
                }
              >
                {CONTROL_MODES.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Resize Mode
              <select
                value={unit.resize_mode}
                onChange={(event) =>
                  handleUnitChange(index, {
                    resize_mode: parseInt(event.target.value, 10),
                  })
                }
              >
                {RESIZE_MODES.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="controlnet-grid">
            <label>
              Processor Res
              <input
                type="number"
                min={64}
                max={2048}
                step={8}
                value={unit.processor_res}
                onChange={(event) =>
                  handleUnitChange(index, {
                    processor_res: parseInt(event.target.value, 10),
                  })
                }
              />
            </label>

            <label>
              Threshold A
              <input
                type="number"
                min={0}
                max={255}
                value={unit.threshold_a}
                onChange={(event) =>
                  handleUnitChange(index, {
                    threshold_a: parseFloat(event.target.value),
                  })
                }
              />
            </label>

            <label>
              Threshold B
              <input
                type="number"
                min={0}
                max={255}
                value={unit.threshold_b}
                onChange={(event) =>
                  handleUnitChange(index, {
                    threshold_b: parseFloat(event.target.value),
                  })
                }
              />
            </label>
          </div>

          <div className="controlnet-toggles">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={unit.pixel_perfect}
                onChange={(event) =>
                  handleUnitChange(index, {
                    pixel_perfect: event.target.checked,
                  })
                }
              />
              <span>Pixel Perfect</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={unit.lowvram}
                onChange={(event) =>
                  handleUnitChange(index, { lowvram: event.target.checked })
                }
              />
              <span>Low VRAM</span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
