import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Keyboard } from "lucide-react";
import {
  type KeyboardShortcut,
  formatShortcut,
} from "../hooks/useKeyboardShortcuts";
import "./ShortcutsHelp.css";

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

const CATEGORY_LABELS: Record<string, string> = {
  generation: "Generation",
  navigation: "Navigation",
  presets: "Presets & Settings",
  image: "Image Actions",
  ui: "User Interface",
};

export default function ShortcutsHelp({
  isOpen,
  onClose,
  shortcuts,
}: ShortcutsHelpProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Group shortcuts by category
  const groupedShortcuts = useMemo(() => {
    const filtered = searchQuery
      ? shortcuts.filter(
          (s) =>
            s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            formatShortcut(s).toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : shortcuts;

    const grouped: Record<string, KeyboardShortcut[]> = {};

    filtered.forEach((shortcut) => {
      if (!grouped[shortcut.category]) {
        grouped[shortcut.category] = [];
      }
      grouped[shortcut.category].push(shortcut);
    });

    return grouped;
  }, [shortcuts, searchQuery]);

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
          className="shortcuts-help-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="shortcuts-header">
            <div className="shortcuts-header-content">
              <Keyboard size={24} />
              <h2>Keyboard Shortcuts</h2>
            </div>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              <X size={24} />
            </button>
          </div>

          {/* Search */}
          <div className="shortcuts-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Shortcuts List */}
          <div className="shortcuts-content">
            {Object.keys(groupedShortcuts).length === 0 ? (
              <div className="empty-state">
                <p>No shortcuts found</p>
                <button onClick={() => setSearchQuery("")}>Clear Search</button>
              </div>
            ) : (
              Object.entries(groupedShortcuts).map(
                ([category, categoryShortcuts]) => (
                  <div key={category} className="shortcuts-category">
                    <h3 className="category-title">
                      {CATEGORY_LABELS[category] || category}
                    </h3>
                    <div className="shortcuts-list">
                      {categoryShortcuts.map((shortcut, index) => (
                        <div key={index} className="shortcut-item">
                          <span className="shortcut-description">
                            {shortcut.description}
                          </span>
                          <kbd className="shortcut-keys">
                            {formatShortcut(shortcut)}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )
            )}
          </div>

          {/* Footer */}
          <div className="shortcuts-footer">
            <p>
              Press <kbd>?</kbd> or <kbd>Ctrl</kbd> + <kbd>/</kbd> to toggle
              this menu
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
