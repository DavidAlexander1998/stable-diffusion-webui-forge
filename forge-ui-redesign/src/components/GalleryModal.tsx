import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Trash2,
  Star,
  Search,
  Grid,
  List,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { downloadImage } from '../utils/imageUtils';
import { GenerationParams } from '../types';
import './GalleryModal.css';

interface HistoryItem {
  id: number;
  image: string;
  params: Partial<GenerationParams>;
  timestamp: Date;
  info?: Record<string, unknown>;
  isFavorite?: boolean;
}

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onDelete?: (id: number) => void;
  onToggleFavorite?: (id: number) => void;
  selectedIndex?: number;
}

export default function GalleryModal({
  isOpen,
  onClose,
  history,
  onDelete,
  onToggleFavorite,
  selectedIndex = 0,
}: GalleryModalProps) {
  const [view, setView] = useState<'grid' | 'detail'>('grid');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'dimensions'>('date');
  const [currentDetailIndex, setCurrentDetailIndex] = useState(selectedIndex);

  if (!isOpen) return null;

  // Filter and sort history
  let filteredHistory = [...history];

  // Filter by search query
  if (searchQuery) {
    filteredHistory = filteredHistory.filter((item) =>
      item.params?.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filter by favorites
  if (filterMode === 'favorites') {
    filteredHistory = filteredHistory.filter((item) => item.isFavorite);
  }

  // Sort
  if (sortBy === 'date') {
    filteredHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } else if (sortBy === 'dimensions') {
    filteredHistory.sort(
      (a, b) => (b.params?.width || 0) * (b.params?.height || 0) - (a.params?.width || 0) * (a.params?.height || 0)
    );
  }

  const currentItem = view === 'detail' ? filteredHistory[currentDetailIndex] : null;

  const handlePrevious = () => {
    setCurrentDetailIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentDetailIndex((prev) => Math.min(filteredHistory.length - 1, prev + 1));
  };

  const handleDownload = (item: HistoryItem) => {
    const metadata = {
      prompt: item.params?.prompt || '',
      negative_prompt: item.params?.negative_prompt || '',
      seed: item.params?.seed || 0,
      steps: item.params?.steps || 0,
      cfg_scale: item.params?.cfg_scale || 0,
      sampler_name: item.params?.sampler_name || '',
      width: item.params?.width || 0,
      height: item.params?.height || 0,
    };
    downloadImage(item.image, metadata);
  };

  return (
    <AnimatePresence>
      <div className="gallery-modal-overlay" onClick={onClose}>
        <motion.div
          className="gallery-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="gallery-header">
            <h2>
              <ImageIcon size={24} />
              Gallery ({filteredHistory.length} {filteredHistory.length === 1 ? 'image' : 'images'})
            </h2>

            <div className="gallery-header-actions">
              {/* View Toggle */}
              {view === 'grid' && (
                <>
                  <button
                    className={`view-toggle ${layoutMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setLayoutMode('grid')}
                    title="Grid View"
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    className={`view-toggle ${layoutMode === 'list' ? 'active' : ''}`}
                    onClick={() => setLayoutMode('list')}
                    title="List View"
                  >
                    <List size={18} />
                  </button>
                </>
              )}

              <button className="close-btn" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Controls */}
          {view === 'grid' && (
            <div className="gallery-controls">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by prompt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="gallery-filters">
                <button
                  className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterMode('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${filterMode === 'favorites' ? 'active' : ''}`}
                  onClick={() => setFilterMode('favorites')}
                >
                  <Star size={14} />
                  Favorites
                </button>
              </div>

              <select
                className="gallery-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'dimensions')}
              >
                <option value="date">Sort by Date</option>
                <option value="dimensions">Sort by Size</option>
              </select>
            </div>
          )}

          {/* Content */}
          <div className="gallery-content">
            {view === 'grid' && (
              <div className={`gallery-${layoutMode}`}>
                {filteredHistory.map((item, index) => (
                  <div
                    key={item.id}
                    className="gallery-item"
                    onClick={() => {
                      setCurrentDetailIndex(index);
                      setView('detail');
                    }}
                  >
                    <img src={item.image} alt="Generated" />
                    <div className="gallery-item-overlay">
                      <div className="gallery-item-info">
                        <span>{item.params?.width}×{item.params?.height}</span>
                        <span>{item.params?.steps} steps</span>
                      </div>
                      <div className="gallery-item-actions">
                        <button
                          className="gallery-item-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite?.(item.id);
                          }}
                        >
                          <Star size={16} fill={item.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          className="gallery-item-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item);
                          }}
                        >
                          <Download size={16} />
                        </button>
                        {onDelete && (
                          <button
                            className="gallery-item-action danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this image?')) {
                                onDelete(item.id);
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {view === 'detail' && currentItem && (
              <div className="gallery-detail">
                <button className="nav-btn prev" onClick={handlePrevious} disabled={currentDetailIndex === 0}>
                  <ChevronLeft size={24} />
                </button>

                <div className="detail-content">
                  <div className="detail-image-container">
                    <img src={currentItem.image} alt="Generated" />
                  </div>

                  <div className="detail-info">
                    <div className="detail-header">
                      <h3>Generation Details</h3>
                      <div className="detail-actions">
                        <button
                          className="detail-action-btn"
                          onClick={() => onToggleFavorite?.(currentItem.id)}
                        >
                          <Star size={18} fill={currentItem.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        <button className="detail-action-btn" onClick={() => handleDownload(currentItem)}>
                          <Download size={18} />
                        </button>
                        {onDelete && (
                          <button
                            className="detail-action-btn danger"
                            onClick={() => {
                              if (confirm('Delete this image?')) {
                                onDelete(currentItem.id);
                                setView('grid');
                              }
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        <button className="detail-action-btn" onClick={() => setView('grid')}>
                          <Grid size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="detail-params">
                      <div className="param-group">
                        <label>Prompt</label>
                        <p className="prompt-text">{currentItem.params?.prompt || 'N/A'}</p>
                      </div>

                      {currentItem.params?.negative_prompt && (
                        <div className="param-group">
                          <label>Negative Prompt</label>
                          <p className="prompt-text">{currentItem.params.negative_prompt}</p>
                        </div>
                      )}

                      <div className="param-grid">
                        <div className="param-item">
                          <label>Dimensions</label>
                          <span>{currentItem.params?.width}×{currentItem.params?.height}</span>
                        </div>
                        <div className="param-item">
                          <label>Steps</label>
                          <span>{currentItem.params?.steps}</span>
                        </div>
                        <div className="param-item">
                          <label>CFG Scale</label>
                          <span>{currentItem.params?.cfg_scale}</span>
                        </div>
                        <div className="param-item">
                          <label>Seed</label>
                          <span>{currentItem.params?.seed}</span>
                        </div>
                        <div className="param-item">
                          <label>Sampler</label>
                          <span>{currentItem.params?.sampler_name}</span>
                        </div>
                        <div className="param-item">
                          <label>Model</label>
                          <span>{currentItem.params?.sd_model_checkpoint || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="param-group">
                        <label>Generated</label>
                        <span>
                          {new Date(currentItem.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="nav-btn next"
                  onClick={handleNext}
                  disabled={currentDetailIndex === filteredHistory.length - 1}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}

            {filteredHistory.length === 0 && (
              <div className="empty-gallery">
                <ImageIcon size={48} />
                <p>No images found</p>
                {searchQuery && <button onClick={() => setSearchQuery('')}>Clear Search</button>}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
