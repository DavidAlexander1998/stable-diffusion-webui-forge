import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Star,
  RefreshCw,
  Clock,
  Filter,
  Grid3x3,
  List,
} from "lucide-react";
import { useModelManager } from "../hooks/useModelManager";
import "./ModelManager.css";

interface ModelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

type ViewMode = "grid" | "list";
type FilterMode = "all" | "favorites" | "recent";

export default function ModelManager({
  isOpen,
  onClose,
  selectedModel,
  onModelSelect,
}: ModelManagerProps) {
  const {
    models,
    isLoading,
    error,
    favorites,
    recentModels,
    refreshModels,
    toggleFavorite,
    searchModels,
  } = useModelManager();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  // Filter and search models
  const filteredModels = useMemo(() => {
    let result = searchQuery ? searchModels(searchQuery) : models;

    if (filterMode === "favorites") {
      result = result.filter((m) => favorites.includes(m.name));
    } else if (filterMode === "recent") {
      result = result.filter((m) => recentModels.includes(m.name));
    }

    return result;
  }, [models, searchQuery, filterMode, favorites, recentModels, searchModels]);

  const handleModelSelect = (modelName: string) => {
    onModelSelect(modelName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="model-manager-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="model-manager-header">
            <h2>Model Manager</h2>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              <X size={24} />
            </button>
          </div>

          {/* Toolbar */}
          <div className="model-manager-toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="toolbar-actions">
              <button
                className={`filter-btn ${filterMode === "all" ? "active" : ""}`}
                onClick={() => setFilterMode("all")}
                title="All Models"
              >
                All
              </button>
              <button
                className={`filter-btn ${filterMode === "favorites" ? "active" : ""}`}
                onClick={() => setFilterMode("favorites")}
                title="Favorites"
              >
                <Star size={16} />
                Favorites
              </button>
              <button
                className={`filter-btn ${filterMode === "recent" ? "active" : ""}`}
                onClick={() => setFilterMode("recent")}
                title="Recently Used"
              >
                <Clock size={16} />
                Recent
              </button>

              <div className="toolbar-divider" />

              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <Grid3x3 size={18} />
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <List size={18} />
              </button>

              <button
                className="refresh-btn"
                onClick={refreshModels}
                disabled={isLoading}
                title="Refresh Models"
              >
                <RefreshCw size={18} className={isLoading ? "spinning" : ""} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="model-manager-content">
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={refreshModels}>Retry</button>
              </div>
            )}

            {isLoading ? (
              <div className="loading-state">
                <RefreshCw size={32} className="spinning" />
                <p>Loading models...</p>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="empty-state">
                <Filter size={48} />
                <p>No models found</p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}>
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className={`models-${viewMode}`}>
                {filteredModels.map((model) => (
                  <motion.div
                    key={model.name}
                    className={`model-card ${selectedModel === model.name ? "selected" : ""}`}
                    onClick={() => handleModelSelect(model.name)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="model-card-content">
                      {/* Model Icon/Thumbnail */}
                      <div className="model-icon">
                        {model.name.toLowerCase().includes("xl") ? "🎨" : "🖼️"}
                      </div>

                      {/* Model Info */}
                      <div className="model-info">
                        <h3 className="model-title">{model.title}</h3>
                        <p className="model-filename">{model.filename}</p>

                        <div className="model-badges">
                          {model.name.toLowerCase().includes("xl") && (
                            <span className="badge badge-xl">SDXL</span>
                          )}
                          {model.name.toLowerCase().includes("inpaint") && (
                            <span className="badge badge-inpaint">Inpaint</span>
                          )}
                          {favorites.includes(model.name) && (
                            <span className="badge badge-favorite">
                              <Star size={12} fill="currentColor" />
                            </span>
                          )}
                          {recentModels.includes(model.name) && (
                            <span className="badge badge-recent">
                              <Clock size={12} />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="model-actions">
                        <button
                          className={`favorite-btn ${favorites.includes(model.name) ? "active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(model.name);
                          }}
                          title={
                            favorites.includes(model.name)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <Star
                            size={20}
                            fill={
                              favorites.includes(model.name)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                      </div>
                    </div>

                    {selectedModel === model.name && (
                      <div className="selected-indicator">
                        <span>Selected</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="model-manager-footer">
            <p className="model-count">
              {filteredModels.length} model
              {filteredModels.length !== 1 ? "s" : ""}
            </p>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
