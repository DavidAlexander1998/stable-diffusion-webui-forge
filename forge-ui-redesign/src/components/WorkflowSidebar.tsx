import { motion } from "framer-motion";
import {
  Image,
  Layers,
  Paintbrush,
  Wand2,
  Grid3x3,
  Clock,
  Star,
} from "lucide-react";
import { WorkflowMode } from "../types";
import "./WorkflowSidebar.css";

interface WorkflowSidebarProps {
  currentMode: WorkflowMode;
  onModeChange: (mode: WorkflowMode) => void;
  history: any[];
  onOpenGallery?: () => void;
}

const WORKFLOW_MODES = [
  {
    id: "txt2img" as WorkflowMode,
    label: "Text to Image",
    icon: Wand2,
    color: "#6366f1",
  },
  {
    id: "img2img" as WorkflowMode,
    label: "Image to Image",
    icon: Image,
    color: "#8b5cf6",
  },
  {
    id: "inpaint" as WorkflowMode,
    label: "Inpaint",
    icon: Paintbrush,
    color: "#ec4899",
  },
  {
    id: "extras" as WorkflowMode,
    label: "Upscale & More",
    icon: Layers,
    color: "#10b981",
  },
  {
    id: "batch" as WorkflowMode,
    label: "Batch Process",
    icon: Grid3x3,
    color: "#f59e0b",
  },
];

export default function WorkflowSidebar({
  currentMode,
  onModeChange,
  history,
  onOpenGallery,
}: WorkflowSidebarProps) {
  return (
    <div className="workflow-sidebar card">
      {/* Workflow Modes */}
      <div className="workflow-section">
        <h3 className="section-title">Workflow</h3>
        <div className="workflow-modes">
          {WORKFLOW_MODES.map((mode, index) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;

            return (
              <motion.button
                key={mode.id}
                className={`workflow-mode ${isActive ? "active" : ""}`}
                onClick={() => onModeChange(mode.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className="mode-icon-container"
                  style={{
                    backgroundColor: isActive
                      ? `${mode.color}20`
                      : "transparent",
                  }}
                >
                  <Icon
                    size={20}
                    style={{
                      color: isActive ? mode.color : "var(--text-tertiary)",
                    }}
                  />
                </div>
                <span className="mode-label">{mode.label}</span>
                {isActive && (
                  <motion.div
                    className="mode-indicator"
                    layoutId="mode-indicator"
                    style={{ backgroundColor: mode.color }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Recent History */}
      <div className="workflow-section">
        <div className="section-header">
          <h3 className="section-title">
            <Clock size={16} />
            Recent
          </h3>
          <button
            className="section-action"
            onClick={() => onOpenGallery?.()}
            title="View All"
          >
            View All
          </button>
        </div>

        <div className="history-grid">
          {history.length === 0 ? (
            <div className="empty-state">
              <Wand2 size={32} opacity={0.3} />
              <p>No generations yet</p>
            </div>
          ) : (
            history.slice(0, 6).map((item) => (
              <motion.div
                key={item.id}
                className="history-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <img src={item.image} alt="Generated" />
                <div className="history-overlay">
                  <span className="history-time">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="workflow-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions">
          <button className="quick-action-btn">
            <Wand2 size={16} />
            <span>Random Prompt</span>
          </button>
          <button className="quick-action-btn">
            <Star size={16} />
            <span>Favorites</span>
          </button>
        </div>
      </div>
    </div>
  );
}
