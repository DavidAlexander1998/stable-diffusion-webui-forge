import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Folder,
  Star,
  Download,
  Upload,
  Trash2,
  X,
  Search,
  Copy,
  Check,
} from "lucide-react";
import { usePresets } from "../hooks/usePresets";
import type { GenerationParams } from "../types";
import "./PresetManager.css";

interface PresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentParams: GenerationParams;
  onLoadPreset: (params: Partial<GenerationParams>) => void;
  lastGeneratedImage?: string;
}

export default function PresetManager({
  isOpen,
  onClose,
  currentParams,
  onLoadPreset,
  lastGeneratedImage,
}: PresetManagerProps) {
  const {
    presets,
    savePreset,
    deletePreset,
    toggleFavorite,
    exportPreset,
    importPreset,
    exportAllPresets,
    getCategories,
    searchPresets,
  } = usePresets();

  const [view, setView] = useState<"browse" | "save">("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [saveForm, setSaveForm] = useState({
    name: "",
    description: "",
    category: "Custom",
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ["All", ...getCategories()];
  const displayedPresets = searchQuery
    ? searchPresets(searchQuery)
    : selectedCategory === "All"
      ? presets
      : presets.filter((p) => p.category === selectedCategory);

  const handleSavePreset = () => {
    if (!saveForm.name.trim()) {
      alert("Please enter a preset name");
      return;
    }

    const presetParams: Partial<GenerationParams> = {
      prompt: currentParams.prompt,
      negative_prompt: currentParams.negative_prompt,
      width: currentParams.width,
      height: currentParams.height,
      steps: currentParams.steps,
      cfg_scale: currentParams.cfg_scale,
      sampler_name: currentParams.sampler_name,
      scheduler: currentParams.scheduler,
      seed: currentParams.seed,
      batch_size: currentParams.batch_size,
    };

    // Include Hires Fix if enabled
    if (currentParams.enable_hr) {
      presetParams.enable_hr = currentParams.enable_hr;
      presetParams.hr_scale = currentParams.hr_scale;
      presetParams.hr_upscaler = currentParams.hr_upscaler;
      presetParams.hr_second_pass_steps = currentParams.hr_second_pass_steps;
      presetParams.denoising_strength = currentParams.denoising_strength;
    }

    savePreset(
      saveForm.name,
      saveForm.description,
      saveForm.category,
      presetParams,
      lastGeneratedImage,
    );

    setSaveForm({ name: "", description: "", category: "Custom" });
    setView("browse");
  };

  const handleExportPreset = (id: string) => {
    try {
      const json = exportPreset(id);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `preset-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export preset:", error);
      alert("Failed to export preset");
    }
  };

  const handleImportPreset = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        importPreset(text);
        alert("Preset imported successfully!");
      } catch (error) {
        console.error("Failed to import preset:", error);
        alert("Failed to import preset. Please check the file format.");
      }
    };
    input.click();
  };

  const handleExportAll = () => {
    try {
      const json = exportAllPresets();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `forge-presets-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export presets:", error);
      alert("Failed to export presets");
    }
  };

  const handleCopyJSON = (id: string) => {
    try {
      const json = exportPreset(id);
      navigator.clipboard.writeText(json);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy preset:", error);
    }
  };

  return (
    <AnimatePresence>
      <div className="preset-manager-overlay" onClick={onClose}>
        <motion.div
          className="preset-manager"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="preset-header">
            <h2>
              <Folder size={24} />
              Workflow Presets
            </h2>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="preset-tabs">
            <button
              className={`preset-tab ${view === "browse" ? "active" : ""}`}
              onClick={() => setView("browse")}
            >
              Browse Presets
            </button>
            <button
              className={`preset-tab ${view === "save" ? "active" : ""}`}
              onClick={() => setView("save")}
            >
              <Save size={16} />
              Save Current
            </button>
          </div>

          {/* Browse View */}
          {view === "browse" && (
            <div className="preset-content">
              {/* Search and Filter */}
              <div className="preset-filters">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search presets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="category-pills">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`category-pill ${
                        selectedCategory === cat ? "active" : ""
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="preset-actions">
                <button className="action-btn" onClick={handleImportPreset}>
                  <Upload size={16} />
                  Import
                </button>
                <button className="action-btn" onClick={handleExportAll}>
                  <Download size={16} />
                  Export All
                </button>
              </div>

              {/* Preset Grid */}
              <div className="preset-grid">
                {displayedPresets.map((preset) => (
                  <div key={preset.id} className="preset-card">
                    {preset.thumbnail && (
                      <div className="preset-thumbnail">
                        <img src={preset.thumbnail} alt={preset.name} />
                      </div>
                    )}

                    <div className="preset-info">
                      <div className="preset-title-row">
                        <h3>{preset.name}</h3>
                        <button
                          className={`favorite-btn ${
                            preset.isFavorite ? "active" : ""
                          }`}
                          onClick={() => toggleFavorite(preset.id)}
                        >
                          <Star
                            size={14}
                            fill={preset.isFavorite ? "currentColor" : "none"}
                          />
                        </button>
                      </div>

                      <p className="preset-description">{preset.description}</p>
                      <span className="preset-category">{preset.category}</span>

                      <div className="preset-params">
                        <span>
                          {preset.params.width}×{preset.params.height}
                        </span>
                        <span>{preset.params.steps} steps</span>
                        <span>CFG {preset.params.cfg_scale}</span>
                      </div>
                    </div>

                    <div className="preset-card-actions">
                      <button
                        className="card-action-btn primary"
                        onClick={() => {
                          onLoadPreset(preset.params);
                          onClose();
                        }}
                      >
                        Load
                      </button>
                      <button
                        className="card-action-btn"
                        onClick={() => handleCopyJSON(preset.id)}
                        title="Copy as JSON"
                      >
                        {copiedId === preset.id ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      <button
                        className="card-action-btn"
                        onClick={() => handleExportPreset(preset.id)}
                        title="Export"
                      >
                        <Download size={14} />
                      </button>
                      {!preset.id.startsWith("default-") && (
                        <button
                          className="card-action-btn danger"
                          onClick={() => {
                            if (confirm("Delete this preset?")) {
                              deletePreset(preset.id);
                            }
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {displayedPresets.length === 0 && (
                <div className="empty-state">
                  <Folder size={48} />
                  <p>No presets found</p>
                </div>
              )}
            </div>
          )}

          {/* Save View */}
          {view === "save" && (
            <div className="preset-content">
              <div className="save-form">
                <div className="form-group">
                  <label>Preset Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Portrait Photography"
                    value={saveForm.name}
                    onChange={(e) =>
                      setSaveForm({ ...saveForm, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Describe this preset..."
                    value={saveForm.description}
                    onChange={(e) =>
                      setSaveForm({ ...saveForm, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={saveForm.category}
                    onChange={(e) =>
                      setSaveForm({ ...saveForm, category: e.target.value })
                    }
                  >
                    <option value="Custom">Custom</option>
                    <option value="Photography">Photography</option>
                    <option value="Anime">Anime</option>
                    <option value="Realistic">Realistic</option>
                    <option value="Art">Art</option>
                    <option value="Quick">Quick</option>
                  </select>
                </div>

                {lastGeneratedImage && (
                  <div className="form-group">
                    <label>Preview (from last generation)</label>
                    <img
                      src={lastGeneratedImage}
                      alt="Preview"
                      className="preview-thumb"
                    />
                  </div>
                )}

                <div className="form-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setView("browse")}
                  >
                    Cancel
                  </button>
                  <button className="save-btn" onClick={handleSavePreset}>
                    <Save size={16} />
                    Save Preset
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
