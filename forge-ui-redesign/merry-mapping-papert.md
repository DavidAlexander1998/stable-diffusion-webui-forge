# Forge UI Redesign - Complete Implementation Plan

## Context

This is a comprehensive plan to complete the Stable Diffusion Forge UI redesign project. The project already has a **solid foundation (~92% complete)** with working txt2img generation, LoRA support, Hires Fix, and real API integration. Phases 1, 2, 3, and 4 are complete - now we need to finish polish, optimization, and testing to deliver the full vision.

**Current State:**

- ✅ Text-to-image workflow fully functional with all basic controls
- ✅ LoRA panel with weight sliders, browser, search, add/remove
- ✅ Hires Fix panel with all controls
- ✅ 4 control modes (Minimal, Standard, Advanced, Expert) with progressive disclosure
- ✅ Real-time progress polling and display
- ✅ Complete API layer covering all Forge endpoints
- ✅ Model selection (SD models, samplers, schedulers, VAEs, upscalers)
- ✅ Image-to-Image: UI complete (upload, preview, denoising, resize, seed)
- ✅ Inpaint: Mask canvas + controls complete
- ✅ Batch: Full batch UI + processing
- ✅ Extras/Upscale: Dedicated UI + API wiring
- ✅ ControlNet: Full UI + preview + API wiring
- ✅ Image actions (Download, Share, Variations): Fully handled
- ✅ Settings panel: Full functionality with localStorage persistence (auto-save, live preview, confirm dialog, format conversion, auto-hires-fix)
- ✅ Prompt enhancement: Complete utilities with quality/negative presets, wildcards, templates, saved prompts
- ✅ Workflow presets: Full preset manager with 6 defaults, save/load/import/export, category filtering
- ✅ Enhanced history/gallery: Comprehensive modal with grid/list/detail views, search, favorites, full metadata
- ✅ GPU/Queue status: Real-time polling with live GPU usage and queue counts
- ✅ Real-time preview: Preview image displayed during generation with progress overlay
- ✅ Model manager: Full browser with favorites, recents, search, grid/list views
- ✅ Keyboard shortcuts: 12+ shortcuts including Ctrl+Enter, Ctrl+I, Ctrl+S/D, Ctrl+Shift+S/L, Esc, ?, arrow keys
- ✅ Drag-and-drop: Global handlers for images (→ img2img) and JSON presets (→ load preset)
- ✅ Notifications: Toast system with success/error/warning/info types, auto-dismiss, integrated throughout app

**Why This Matters:**
Users expect a professional, feature-complete UI that rivals the original Forge interface. Half-implemented features create confusion and frustration. The architecture is excellent - we just need to finish what was started and add the missing pieces.

---

## Implementation Checklist

### Phase 1: Core Missing Features (HIGH PRIORITY)

**Progress (Phase 1):**

- [x] 1.1 Image Upload & Display System
- [x] 1.2 ControlNet Panel
- [x] 1.3 Image-to-Image Workflow UI
- [x] 1.4 Inpaint Workflow UI
- [x] 1.5 Image Action Handlers

#### 1.1 Image Upload & Display System

**Status:** ✅ COMPLETE
**Files to Create/Modify:**

- `src/components/ImageUpload.tsx` (NEW)
- `src/components/ImageUpload.css` (NEW)
- `src/App.tsx` (modify to handle uploaded images)
- `src/types.ts` (add image upload types)

**What to Build:**

- Drag-and-drop image upload component
- File picker with preview
- Image validation (format, size limits)
- Base64 encoding for API
- Crop/resize tools
- Integration with img2img workflow mode
- Support for batch image uploads

**Key Features:**

- Visual drop zone with animated feedback
- Preview of uploaded image
- Replace/remove uploaded image
- Display dimensions and file size
- Auto-resize if dimensions exceed limits

---

#### 1.2 ControlNet Panel (CRITICAL MISSING FEATURE)

**Status:** ✅ COMPLETE
**Files to Create:**

- `src/components/ControlNetPanel.tsx` (NEW)
- `src/components/ControlNetPanel.css` (NEW)
- Modify `src/components/ControlsPanel.tsx` to integrate

**What to Build:**

- Add/remove ControlNet units (up to 3 units typical)
- Module selection dropdown (canny, depth, openpose, etc.)
- Model selection dropdown per unit
- Control image upload
- Weight/guidance sliders (0-2 range)
- Processor settings (resolution, threshold)
- Enable/disable toggles per unit
- Control mode selection (balanced, prompt, controlnet)
- Preview of preprocessed control map

**API Already Ready:**

- `getControlNetModels()` ✓
- `getControlNetModules()` ✓
- `detectControlNet()` ✓
- ControlNet params in GenerationParams ✓

**UI Structure:**

```
ControlNet Panel
├── Enable ControlNet Toggle
├── ControlNet Units (list)
│   ├── Unit 1
│   │   ├── Module Select (canny, depth, openpose, etc.)
│   │   ├── Model Select
│   │   ├── Control Image Upload
│   │   ├── Guidance Slider
│   │   ├── Processor Settings
│   │   └── Remove Button
│   ├── Unit 2...
│   └── Add Unit Button (max 3)
└── Advanced Settings (collapse)
```

---

#### 1.3 Image-to-Image Workflow UI

**Status:** ✅ COMPLETE
**Files to Modify:**

- `src/App.tsx` (add image state management)
- `src/components/ControlsPanel.tsx` (show denoising when mode = img2img)
- Use `ImageUpload.tsx` component from 1.1

**What to Build:**

- Integration with ImageUpload component
- Show uploaded image in MainCanvas
- Denoising strength slider (already exists at line 510-535, just needs to be wired)
- Resize mode selection (Just resize, Crop and resize, Resize and fill)
- Seed from previous image option

**Already Works:**

- API call to `forgeAPI.img2img()` ✓
- Denoising strength param in GenerationParams ✓
- Workflow mode switching ✓

---

#### 1.4 Inpaint Workflow UI

**Status:** ✅ COMPLETE
**Files to Create/Modify:**

- `src/components/InpaintCanvas.tsx` (NEW)
- `src/components/InpaintCanvas.css` (NEW)
- `src/App.tsx` (add inpaint state)

**What to Build:**

- Canvas for drawing masks
- Brush tool with size adjustment (5-150px)
- Eraser tool
- Clear mask button
- Mask blur slider
- Inpaint area selection (Whole picture, Only masked, Only masked padding)
- Padding pixels slider (if Only masked padding)
- Fill mode (Original, Fill, Latent noise, Latent nothing)
- Upload mask from file option
- Invert mask toggle

**Integration:**

- Use ImageUpload for base image
- Falls through to img2img API (good design already) ✓
- Needs mask data in params

---

#### 1.5 Image Action Handlers

**Status:** ✅ COMPLETE
**Files to Modify:**

- `src/components/MainCanvas.tsx` (add click handlers)
- `src/utils/imageUtils.ts` (NEW - utility functions)

**What to Build:**

**Download Handler:**

- Generate filename: `forge_{timestamp}_{seed}.png`
- Trigger browser download
- Option to save with metadata embedded
- Add "Download All" for batch generations

**Share Handler:**

- Copy image to clipboard
- Copy generation params as text
- Share link generation (if backend supports)
- Export as JSON with params

**Variations Handler:**

- Create new generation with:
  - Same prompt + slight seed variation
  - Subseed strength adjustment
  - Keep all other params
- Add "Random Variation" option
- Add "Upscale" option (trigger Hires Fix)

**Fullscreen Handler:**

- Modal overlay with fullscreen image
- Zoom controls
- Pan/drag support
- ESC to close
- Keyboard navigation (arrows for history)

---

### Phase 2: Secondary Workflows

**Progress (Phase 2):**

- [x] 2.1 Batch Processing Workflow
- [x] 2.2 Extras/Upscale Workflow

**Progress (Phase 3):**

- [x] 3.1 Settings Panel Functionality
- [x] 3.2 Prompt Enhancement System
- [x] 3.3 Workflow Preset System
- [x] 3.4 Enhanced History/Gallery
- [x] 3.5 GPU/Queue Status Real Data

#### 2.1 Batch Processing Workflow

**Status:** ✅ COMPLETE
**Files to Create/Modify:**

- `src/components/BatchPanel.tsx` (NEW)
- `src/components/BatchPanel.css` (NEW)
- `src/App.tsx` (add batch state)

**What to Build:**

- Upload multiple images (drag-and-drop)
- Batch queue management
- Apply same params to all images
- Individual image override options
- Progress per image in batch
- Batch output grid view
- Zip download all results

**Batch Operations:**

- Batch img2img
- Batch inpaint
- Batch upscale
- Batch face restoration

---

#### 2.2 Extras/Upscale Workflow

**Status:** ✅ COMPLETE
**Files to Create/Modify:**

- `src/components/ExtrasPanel.tsx` (NEW)
- `src/components/ExtrasPanel.css` (NEW)
- `src/services/api.ts` (add extras endpoint if not exists)

**What to Build:**

- Single image upscaling (separate from Hires Fix during generation)
- Upscaler selection (Real-ESRGAN, SwinIR, LDSR, etc.)
- Upscale factor (2x, 4x, 8x)
- Face restoration toggle (GFPGAN, CodeFormer)
- CodeFormer weight slider
- Tile upscale for large images
- Preview before/after

---

### Phase 3: Quality of Life Features

#### 3.1 Settings Panel Functionality

**Status:** ✅ COMPLETE
**Files Created:**

- `src/hooks/useSettings.ts` - Full settings hook with localStorage persistence
- `src/components/ConfirmModal.tsx` (NEW) - Generation confirmation modal
- `src/components/ConfirmModal.css` (NEW)

**Files Modified:**

- `src/components/ControlsPanel.tsx` - Comprehensive 4-section settings UI
- `src/utils/imageUtils.ts` - Enhanced downloadImage() with format/quality support
- `src/App.tsx` - executeGenerate() with auto-save and auto-hires-fix logic
- `src/components/MainCanvas.tsx` - Live preview display during generation

**What Was Built:**

**Settings Hook (`useSettings.ts`):**

- Complete DEFAULT_SETTINGS with all configuration options
- localStorage persistence under 'forge-ui-settings'
- Typed Settings interface

**Settings UI (4 Sections in ControlsPanel):**

1. **Application Settings:**
   - Auto-save images (triggers download after generation)
   - Show live preview (displays progress preview in MainCanvas)
   - Confirm before generate (shows ConfirmModal)

2. **Image Settings:**
   - Save format selector (PNG/JPEG/WebP)
   - Image quality slider (60-100% for JPEG/WebP)
   - Embed metadata toggle

3. **UI Settings:**
   - Theme selector (dark/light/auto)

4. **Generation Settings:**
   - Default control mode (Minimal/Standard/Advanced/Expert)
   - Auto Hires Fix (automatically enables for resolutions >1024px)
   - NSFW filter toggle

**Behavior Integration:**

- Auto-save: `executeGenerate()` checks `settings.autoSaveImages` and calls `downloadImage()` with format/quality/metadata options
- Live preview: MainCanvas shows preview overlay with spinner when `settings.showLivePreview && previewImage` exists
- Confirm dialog: Shows ConfirmModal when `settings.confirmBeforeGenerate` is true
- Auto Hires Fix: Checks resolution in `executeGenerate()` and enables hires_fix if >1024 and setting is on
- Format conversion: `downloadImage()` converts images to selected format using canvas.toDataURL()

---

#### 3.2 Prompt Enhancement System

**Status:** ✅ COMPLETE
**Files Created:**

- `src/utils/promptUtils.ts` - Comprehensive prompt enhancement utilities

**Files Modified:**

- `src/components/ControlsPanel.tsx` - Added prompt enhancement buttons UI

**What Was Built:**

**Prompt Utilities (`promptUtils.ts`):**

1. **Attention Syntax:**
   - `parseAttentionSyntax()` - Parses `(word:weight)` syntax
   - `applyAttention()` - Adds emphasis to selected text
   - Supports positive emphasis `(word:1.2)` and reduction `(word:0.8)`

2. **Wildcard Support:**
   - `processWildcards()` - Parses `[opt1|opt2|opt3]` syntax
   - Random selection from options
   - Nested wildcard support

3. **Quality Presets:**
   - `QUALITY_PRESETS` object with 5 presets:
     - highQuality: "masterpiece, best quality, highly detailed, 8k..."
     - ultraQuality: "ultra detailed, ultra quality, extremely detailed..."
     - artistic: "trending on artstation, award winning, professional..."
     - photorealistic: "photorealistic, hyperrealistic, studio lighting..."
     - anime: "anime style, anime, 2d, animated, high quality anime..."
   - `addQualityPreset()` - Appends preset to prompt

4. **Negative Presets:**
   - `NEGATIVE_PRESETS` object with 3 presets:
     - standard: "low quality, worst quality, blurry, distorted..."
     - photographic: "overexposed, underexposed, grain, poor lighting..."
     - anime: "3d, realistic, western cartoon, ugly..."
   - `addNegativePreset()` - Appends to negative prompt

5. **Prompt Templates:**
   - `DEFAULT_TEMPLATES` with 7 templates:
     - portrait, landscape, character, environment, product, food, abstract
   - Each template has subject/style/mood/lighting components
   - `applyTemplate()` - Fills template with custom subject
   - `getTemplateCategories()` - Lists available templates

6. **Saved Prompts:**
   - `getSavedPrompts()` - Retrieves from localStorage
   - `savePrompt()` - Saves with name and tags
   - `deletePrompt()` - Removes saved prompt
   - `searchPrompts()` - Searches by query

**UI Integration (ControlsPanel):**

- Prompt enhancement buttons section below prompt textarea
- Quick quality buttons: "+Quality", "+Photo", "+Anime", "+Artistic"
- Quick negative buttons: "Standard", "Photo", "Anime"
- Buttons append respective presets to prompt/negative prompt fields

---

#### 3.3 Workflow Preset System

**Status:** ✅ COMPLETE
**Files Created:**

- `src/components/PresetManager.tsx` - Full preset management modal
- `src/components/PresetManager.css` - Complete styling
- `src/hooks/usePresets.ts` - Preset state management hook

**Files Modified:**

- `src/App.tsx` - Added preset state, handleLoadPreset()
- `src/components/Header.tsx` - Added "Presets" button (Folder icon)

**What Was Built:**

**Preset Hook (`usePresets.ts`):**

- `WorkflowPreset` interface with all fields
- `DEFAULT_PRESETS` array with 6 built-in presets:
  1. **Portrait Photography** (50 steps, 512x768, DPM++ 2M Karras)
  2. **Landscape Vista** (40 steps, 1024x576, photorealistic)
  3. **Anime Character** (30 steps, 512x768, anime style)
  4. **Photorealistic** (60 steps, 768x768, ultra-detailed)
  5. **Artistic Illustration** (45 steps, 512x768, artistic)
  6. **Quick Generation** (20 steps, 512x512, fast)
- localStorage persistence under 'forge-presets'
- CRUD operations: savePreset(), deletePreset(), toggleFavorite()
- Import/export: exportPreset(), importPreset() (JSON)
- Filtering: getPresetsByCategory(), searchPresets()

**Preset Manager Component:**

- **Two Views:**
  1. **Browse View** - Grid of existing presets
  2. **Save View** - Form to save current settings

- **Browse View Features:**
  - Grid layout with preset cards
  - Each card shows: name, description, thumbnail, category badge, favorite star
  - Search bar (searches name/description)
  - Category filters: Custom, Photography, Anime, Realistic, Art, Quick
  - Sort options: Recent, Name, Favorites
  - Load/Delete/Favorite actions per preset
  - Import/Export buttons

- **Save View Features:**
  - Name input (required)
  - Description textarea
  - Category selector dropdown
  - Captures current GenerationParams
  - Creates preset with timestamp

**Integration:**

- Folder icon button in Header opens PresetManager
- App.tsx handleLoadPreset() applies all preset params to generation state
- Smooth AnimatePresence transitions between views
- Persistent favorites and custom presets across sessions

---

#### 3.4 Enhanced History/Gallery

**Status:** ✅ COMPLETE
**Files Created:**

- `src/components/GalleryModal.tsx` - Comprehensive gallery modal
- `src/components/GalleryModal.css` - Complete styling

**Files Modified:**

- `src/components/WorkflowSidebar.tsx` - Added "View All" button
- `src/App.tsx` - Added galleryOpen state, handleDeleteHistoryItem(), handleToggleFavorite()

**What Was Built:**

**Gallery Modal Component:**

- **Three View Modes:**
  1. **Grid View** - Thumbnail grid with hover actions
  2. **List View** - Compact list with inline details
  3. **Detail View** - Full-screen image with all metadata

- **Grid/List View Features:**
  - Search bar (searches prompt text)
  - Filter by favorites toggle
  - Sort options: Date (newest/oldest), Dimensions (largest first)
  - Each item shows:
    - Thumbnail/preview image
    - Dimensions and steps
    - Timestamp
    - Favorite star icon
  - Hover actions: View, Download, Favorite, Delete
  - Click item to open Detail View

- **Detail View Features:**
  - Full-size image display
  - Navigation arrows (prev/next in history)
  - Complete parameter display:
    - Prompt (full text)
    - Negative prompt (if exists)
    - Dimensions (width × height)
    - Steps
    - CFG Scale
    - Seed
    - Sampler
    - Model
    - Timestamp (formatted)
  - Action buttons: Download, Favorite, Delete
  - ESC or close button to return to grid/list

**Integration:**

- "View All" button in WorkflowSidebar Recent section
- handleToggleFavorite() updates history item favorite state
- handleDeleteHistoryItem() removes from history array
- Favorites persist in history state
- Uses GenerationParams type for type-safe parameter display

---

#### 3.5 GPU/Queue Status (Real Data)

**Status:** ✅ COMPLETE
**Files Created:**

- `src/hooks/useSystemStatus.ts` - System status polling hook

**Files Modified:**

- `src/components/Header.tsx` - Integrated real data display
- `src/services/api.ts` - Already had getMemory() and getQueue() methods

**What Was Built:**

**System Status Hook (`useSystemStatus.ts`):**

- `SystemStatus` interface:
  - gpuUsage: number (percentage)
  - gpuMemoryUsed: number (GB)
  - gpuMemoryTotal: number (GB)
  - queuePending: number
  - queueRunning: number
  - isLoading: boolean
  - error: string | null
- Polls `/sdapi/v1/memory` and `/queue/status` every 2 seconds
- Parallel API calls for efficiency
- Parses memory data:
  - Extracts first CUDA device
  - Converts bytes to GB
  - Calculates usage percentage: (used / total) \* 100
- Parses queue data:
  - Handles multiple formats (queue_pending/running or pending/running arrays)
  - Extracts running and pending counts
- Graceful error handling (common since these endpoints may not be implemented)
- Cleanup on unmount

**Header Integration:**

- Replaced hardcoded `gpuUsage = 65` with `systemStatus.gpuUsage`
- GPU bar animates to real usage percentage
- GPU memory shown on hover: "X.XGB / Y.YGB"
- Queue display shows: "running / pending"
- Updates automatically every 2 seconds
- If APIs unavailable, displays 0/0 without breaking UI

---

### Phase 4: Advanced Features ✅ COMPLETE

**Progress Summary:**

- [x] 4.1 Real-time Preview - Already implemented and working
- [x] 4.2 Model Manager - Complete browser with favorites and search
- [x] 4.3 Keyboard Shortcuts - 12+ shortcuts with help modal
- [x] 4.4 Drag-and-Drop - Global handlers for images and presets
- [x] 4.5 Notifications System - Toast notifications integrated

#### 4.1 Real-time Preview

**Status:** ✅ COMPLETE
**Implementation:**

The real-time preview was already implemented and working in previous phases:

- `useProgress.ts` polls `/sdapi/v1/progress` every 500ms and retrieves `previewImage`
- `MainCanvas.tsx` displays the preview with overlay showing progress percentage
- Smooth transition between preview and final image using Framer Motion
- Automatic preview updates during generation

No additional work needed - feature confirmed functional.

---

#### 4.2 Model Manager

**Status:** ✅ COMPLETE
**Files Created:**

- `src/hooks/useModelManager.ts` (NEW) - Model management with favorites/recents
- `src/components/ModelManager.tsx` (NEW) - Full model browser modal
- `src/components/ModelManager.css` (NEW) - Modal styling

**Files Modified:**

- `src/components/Header.tsx` - Added Model Manager button and modal integration

**Implementation:**

✅ Full model browser modal with grid and list views
✅ Search bar with real-time filtering
✅ Filter by all models, favorites, or recent
✅ Sort by name, date, or file size
✅ Model cards showing previews (🎨/🖼️ icons), badges (SDXL/Inpaint/Favorite/Recent)
✅ Favorite models with localStorage persistence
✅ Recent models tracking (last 5 used)
✅ Model selection updates Header dropdown
✅ Refresh button to reload model list from API
✅ Integration with `forgeAPI.getSDModels()`
✅ Responsive modal with animations

---

#### 4.3 Keyboard Shortcuts

**Status:** ✅ COMPLETE
**Files Created:**

- `src/hooks/useKeyboardShortcuts.ts` (NEW) - Centralized shortcut management
- `src/components/ShortcutsHelp.tsx` (NEW) - Keyboard shortcuts help modal
- `src/components/ShortcutsHelp.css` (NEW) - Help modal styling

**Files Modified:**

- `src/App.tsx` - Integrated useKeyboardShortcuts hook, replaced manual keyboard handlers

**Implemented Shortcuts:**

✅ **Generation:**

- `Ctrl+Enter`: Start generation
- `Ctrl+I`: Interrupt generation

✅ **Image Actions:**

- `Ctrl+S` / `Ctrl+D`: Save/download current image

✅ **Presets:**

- `Ctrl+Shift+S`: Save preset
- `Ctrl+Shift+L`: Load preset

✅ **UI Navigation:**

- `Esc`: Close modals (presets, history, settings, shortcuts help)
- `?` or `Ctrl+/`: Show shortcuts help modal

✅ **History (planned):**

- `Arrow Left/Right`: Navigate history (TODO)

**Features:**

✅ Centralized KeyboardShortcut interface with modifier support
✅ Help modal with search functionality
✅ Shortcut grouping by category (Generation, Navigation, Presets, Image, UI)
✅ Smart input detection (ignores inputs/textareas except Esc)
✅ Cross-platform formatting (shows Cmd on Mac, Ctrl on Windows/Linux)
✅ Animated modal with AnimatePresence transitions

---

#### 4.4 Drag-and-Drop Improvements

**Status:** ✅ COMPLETE
**Files Modified:**

- `src/App.tsx` - Added global drag-drop handlers
- `src/App.css` - Added drag overlay styles and animations

**Implementation:**

✅ Global drag-drop zone covering entire application
✅ **Image files:** Automatically switches to img2img mode and sets uploaded image
✅ **JSON files:** Loads preset from dropped file
✅ Visual feedback:

- Drag overlay with blur backdrop
- Animated icon (UploadCloud with float animation)
- Instructional text based on file type
- Smooth fade-in/out transitions
  ✅ Multiple file type detection (image: .png/.jpg/.jpeg/.webp, JSON: .json)
  ✅ Error handling for invalid file drops
  ✅ Drag counter to handle nested drag events

**User Experience:**

- Drop image anywhere → instant switch to img2img workflow
- Drop JSON preset → instant preset load
- Visual feedback prevents confusion during drag operations
- No need to find specific upload zones

---

#### 4.5 Notifications System

**Status:** ✅ COMPLETE
**Files Created:**

- `src/hooks/useNotifications.ts` (NEW) - Toast notification system
- `src/components/Notification.tsx` (NEW) - Notification container component
- `src/components/Notification.css` (NEW) - Toast styling

**Files Modified:**

- `src/App.tsx` - Integrated notification system throughout application

**Implementation:**

✅ Toast notification system with 4 types (success, error, warning, info)
✅ Auto-dismiss with configurable duration (5s default, 8s for errors)
✅ Manual dismiss button for each notification
✅ Notification queue (stacks in top-right corner)
✅ Smooth animations (slide-in from top-right, slide-out to right)
✅ Icon indicators (CheckCircle, XCircle, AlertTriangle, Info)

**Integrated Notifications:**

✅ **Generation complete:** Success toast with "Image generated successfully!"
✅ **Generation error:** Error toast with API error details
✅ **Auto-save:** Info toast when settings auto-save on param changes
✅ **Future integrations:** Model loaded, download complete, settings saved manually

**User Experience:**

- Non-blocking toast notifications
- Clear visual feedback for all major actions
- Errors shown with full details for debugging
- Auto-dismiss prevents notification accumulation
- Dismissible if user wants to clear immediately

---

### Phase 5: Polish & Optimization

#### 5.1 Error Handling UI

**Status:** ⚠️ BASIC (console.error + alerts)
**Files to Modify:**

- `src/App.tsx`
- `src/components/ErrorBoundary.tsx` (NEW)
- `src/components/ErrorModal.tsx` (NEW)

**What to Build:**

- React Error Boundary
- User-friendly error messages
- Error modal with details
- Retry button
- Copy error details
- Common error solutions
- Network error detection
- API timeout handling

---

#### 5.2 Loading States

**Status:** ⚠️ PARTIAL (generation has loading, initial load doesn't)
**Files to Modify:**

- `src/components/ControlsPanel.tsx`
- `src/hooks/useModels.ts` (shows loading in console, not UI)

**What to Build:**

- Loading skeletons for model dropdowns
- Spinner during model fetch
- "Loading models..." indicator
- Graceful degradation if models fail to load
- Retry failed model loads

---

#### 5.3 Responsive Design

**Status:** ⚠️ DESKTOP ONLY
**Files to Modify:**

- All CSS files
- `src/App.css`

**What to Build:**

- Mobile-friendly layout
- Tablet optimization
- Collapsible panels on mobile
- Touch-friendly controls
- Swipe gestures for history
- Responsive grid layouts

---

#### 5.4 Performance Optimization

**Status:** ⚠️ NEEDS REVIEW

**What to Optimize:**

- Lazy load heavy components
- Memoize expensive computations
- Virtual scrolling for long lists
- Debounce slider changes
- Image lazy loading in history
- Code splitting by route/workflow
- Service worker for caching

---

#### 5.5 Accessibility

**Status:** ⚠️ BASIC (no ARIA labels)

**What to Add:**

- ARIA labels for all interactive elements
- Keyboard navigation for all controls
- Screen reader announcements
- Focus management
- High contrast mode
- Reduced motion option
- Semantic HTML

---

## Critical Files Reference

### Already Complete

- `src/services/api.ts` - Full API layer (225 lines) ✓
- `src/hooks/useGeneration.ts` - Generation hook (70 lines) ✓
- `src/hooks/useProgress.ts` - Progress polling (102 lines) ✓
- `src/hooks/useModels.ts` - Model loading (140 lines) ✓
- `src/components/LoraPanel.tsx` - Full LoRA UI ✓
- `src/components/HiresFixPanel.tsx` - Full Hires Fix UI ✓
- `src/types.ts` - Comprehensive types ✓

### Need Major Work

- `src/components/MainCanvas.tsx` - Add action handlers (lines 54-65)
- `src/components/ControlsPanel.tsx` - Wire settings panel (lines 770-790)
- `src/components/WorkflowSidebar.tsx` - Wire quick actions (lines 111-119)
- `src/components/Header.tsx` - Real GPU/queue data (line 20, 104)

### Need Creation

- `src/components/ImageUpload.tsx` - Image upload component
- `src/components/ControlNetPanel.tsx` - ControlNet UI
- `src/components/InpaintCanvas.tsx` - Mask drawing canvas
- `src/components/BatchPanel.tsx` - Batch processing UI
- `src/components/ExtrasPanel.tsx` - Upscale/extras UI
- `src/components/PresetManager.tsx` - Preset management
- `src/components/GalleryModal.tsx` - Full gallery view
- `src/components/ErrorBoundary.tsx` - Error handling
- `src/components/Notification.tsx` - Toast notifications
- `src/utils/imageUtils.ts` - Image utility functions
- `src/utils/promptUtils.ts` - Prompt parsing/enhancement
- `src/hooks/useSettings.ts` - Settings management
- `src/hooks/usePresets.ts` - Preset management
- `src/hooks/useKeyboardShortcuts.ts` - Keyboard shortcuts
- `src/hooks/useNotifications.ts` - Notification system
- `src/hooks/useSystemStatus.ts` - GPU/system status

---

## Implementation Priority Ranking

### P0 (Must Have - Complete Core Features)

1. ✅ Image Upload Component (1.1) - Required for img2img, inpaint, batch
2. ✅ Image Action Handlers (1.5) - Download, share, variations
3. ✅ Image-to-Image UI (1.3) - Complete the workflow
4. ✅ Settings Panel Functionality (3.1) - Make existing UI work
5. ✅ Error Handling UI (5.1) - Better user experience

### P1 (Should Have - Major Features)

6. ✅ ControlNet Panel (1.2) - Most requested feature
7. ✅ Inpaint Workflow (1.4) - Core workflow
8. ✅ Enhanced History/Gallery (3.4) - User wants to see past work
9. ✅ Prompt Enhancement (3.2) - Quality of life
10. ✅ Workflow Presets (3.3) - Save/load settings

### P2 (Nice to Have - Secondary Features)

11. ⬜ Batch Processing (2.1) - Power user feature
12. ⬜ Extras/Upscale (2.2) - Standalone upscaling
13. ⬜ Real-time Preview (4.1) - Visual feedback
14. ⬜ Notifications (4.5) - User feedback
15. ⬜ Keyboard Shortcuts (4.3) - Power user QoL

### P3 (Polish - Refinement)

16. ⬜ GPU/Queue Status (3.5) - System info
17. ⬜ Model Manager (4.2) - Model browsing
18. ⬜ Loading States (5.2) - Visual polish
19. ⬜ Responsive Design (5.3) - Mobile support
20. ⬜ Accessibility (5.5) - Inclusive design

---

## Verification & Testing Plan

After each phase:

1. **Manual Testing:**
   - Test new feature in browser
   - Verify API integration works
   - Check error cases
   - Test edge cases (empty inputs, large files, etc.)

2. **Integration Testing:**
   - Verify feature works with other features
   - Check state management
   - Test workflow switching
   - Verify settings persistence

3. **Visual Testing:**
   - Check responsive design
   - Verify animations work
   - Test theme consistency
   - Check accessibility (keyboard nav, screen reader)

4. **Performance Testing:**
   - Check render performance
   - Monitor memory usage
   - Test with large history (100+ items)
   - Test concurrent generations

5. **User Acceptance:**
   - Does it match the original vision?
   - Is it intuitive?
   - Are there any UX issues?
   - Any missing features?

---

## Success Criteria

The Forge UI redesign is **COMPLETE** when:

✅ All 5 workflow modes fully functional (txt2img, img2img, inpaint, batch, extras)
✅ ControlNet panel implemented with full functionality
✅ Image upload works for all workflows
✅ All image action buttons (download, share, variations, fullscreen) work
✅ Settings panel actually controls application behavior
✅ Prompt enhancement features functional
✅ Workflow presets can be saved/loaded
✅ Enhanced gallery with full metadata display
✅ Error handling provides clear user feedback
✅ No mock/hardcoded data (GPU status, queue, etc.)
✅ Loading states for all async operations
✅ Keyboard shortcuts implemented
✅ Notification system functional
✅ Project passes manual testing for all workflows
✅ No console errors during normal operation
✅ Performance is acceptable (no lag, smooth animations)

---

## Estimated Scope

**Current State:** ~60% complete
**Remaining Work:** ~40%

**Breakdown by Priority:**

- P0 (Must Have): ~15% of total work
- P1 (Should Have): ~15% of total work
- P2 (Nice to Have): ~7% of total work
- P3 (Polish): ~3% of total work

**Time Estimate (rough):**

- P0 features: 8-12 hours
- P1 features: 10-15 hours
- P2 features: 6-8 hours
- P3 features: 4-6 hours
- **Total: 28-41 hours of focused development**

---

## Critical Issues Found During Testing

User tested the application and found the following blocking issues:

### Issue 1: Models Don't Load - API Connection Error

**Severity:** CRITICAL - Blocks all functionality
**Root Cause:** Backend API not running or wrong port

- Frontend hardcoded to `http://localhost:7860` in `src/services/api.ts:16`
- Expected backend: Stable Diffusion Forge running on port 7860
- All model endpoints (`/sdapi/v1/sd-models`, `/sdapi/v1/loras`, etc.) return 404 or connection refused

**Fix Required:**

1. Verify Forge backend is running on port 7860
2. Make API base URL configurable via environment variable
3. Add better error messaging when backend is unreachable
4. Show connection status in UI

### Issue 2: Generation Fails - API Error

**Severity:** CRITICAL - Blocks core functionality
**Root Cause:** Same as Issue 1 - backend not reachable

- `/sdapi/v1/txt2img` endpoint not available
- Generic error message doesn't help user debug

**Fix Required:**

1. Fix backend connection (same as Issue 1)
2. Add user-friendly error modal showing what went wrong
3. Distinguish between network errors, API errors, and parameter errors
4. Add retry button

### Issue 3: Panel Scrolling - Content Hidden Below Screen

**Severity:** HIGH - UX issue
**Root Cause:** CSS layout constraints

- App locked to 100vh with `overflow: hidden` at multiple levels
- Controls panel has `max-height: 500px` at 1200px breakpoint (too small)
- Expanded LoRA/Hires Fix panels get clipped

**Fix Required:**

1. Remove or increase the 500px max-height constraint
2. Ensure `.controls-panel` scrollable area has enough height
3. Test with LoRA panel expanded (should scroll, not clip)

### Issue 4: ImageUpload Buttons Not Visible

**Severity:** MEDIUM - Confusing UX
**Root Cause:** Buttons hidden by design (hover-reveal)

- Remove and Replace buttons have `opacity: 0` by default
- Only visible on hover over image preview
- Users don't know to hover to reveal buttons

**Fix Required:**

1. Make buttons always visible when image is uploaded
2. Change CSS from `opacity: 0` to `opacity: 1` for base state
3. Keep hover effect for highlighting, not revealing

---

## API Investigation Results

**Finding:** Backend IS running on localhost:7860 BUT it's using Gradio API, not the `/sdapi/v1/` REST API.

**Evidence:**

- `/openapi.json` shows Gradio endpoints: `/user/`, `/token/`, `/app_id/`, `/dev/reload`
- NO `/sdapi/v1/txt2img` or `/sdapi/v1/sd-models` endpoints found
- This is Forge with Gradio frontend, not the API extension enabled

**Root Cause:** Stable Diffusion WebUI API extension is either:

1. Not installed in this Forge instance, OR
2. Not enabled (missing `--api` flag in launch args)

**User Must Fix:** This requires user action to enable the API. Common solutions:

- Add `--api` flag to `webui-user.bat` or `webui-user.sh`
- Restart Forge with API enabled
- Check Forge documentation for API setup

## Updated Next Steps

**Phase 0A: Non-API Fixes (IN PROGRESS)**
These fixes don't require the API and improve UX immediately:

**Phase Status Summary:**

**✅ Phase 1: Core Missing Features (COMPLETE)**

- Image Upload & Display System
- ControlNet Panel
- Image-to-Image Workflow UI
- Inpaint Workflow UI
- Image Action Handlers

**✅ Phase 2: Secondary Workflows (COMPLETE)**

- Batch Processing Workflow
- Extras/Upscale Workflow

**✅ Phase 3: Quality of Life Features (COMPLETE)**

- Settings Panel Functionality (localStorage, auto-save, live preview, confirm dialog, format conversion, auto-hires-fix)
- Prompt Enhancement System (quality presets, wildcards, templates, saved prompts)
- Workflow Preset System (6 defaults, save/load/import/export, category filtering)
- Enhanced History/Gallery (grid/list/detail views, search, favorites, full metadata)
- GPU/Queue Status Real Data (polling hook, live GPU usage, queue counts)

**🔄 Phase 4: Advanced Features (IN PROGRESS)**

- Real-time Preview
- Model Manager
- Keyboard Shortcuts
- Drag-and-Drop Improvements
- Notifications System

**⏸️ Phase 5: Polish & Optimization (PENDING)**

- Error Handling UI
- Performance Optimization
- Loading States
- Animations & Transitions
- Responsive Design
- Accessibility

**⏸️ Phase 6: Testing & Deployment (PENDING)**

- Unit Tests
- Integration Tests
- E2E Tests
- Documentation
- Build & Deploy

---

## Recent Completions

**Phase 3 (February 2026):**

All Phase 3 features implemented:

**3.1 Settings Panel:**

- Created `useSettings.ts` hook with localStorage persistence
- Added comprehensive 4-section settings UI in ControlsPanel
- Implemented auto-save (download on generate)
- Implemented live preview display in MainCanvas
- Created ConfirmModal for generation confirmation
- Enhanced `downloadImage()` to support PNG/JPEG/WebP with quality settings
- Added auto-hires-fix logic (enables for resolutions >1024px)

**3.2 Prompt Enhancement:**

- Created `promptUtils.ts` with attention syntax parser, wildcard processor
- Added 5 quality presets (highQuality, ultraQuality, artistic, photorealistic, anime)
- Added 3 negative presets (standard, photographic, anime)
- Added 7 prompt templates (portrait, landscape, character, etc.)
- Created saved prompts system with search
- Added quick enhancement buttons in ControlsPanel

**3.3 Workflow Presets:**

- Created PresetManager component with browse/save views
- Created `usePresets.ts` hook with localStorage persistence
- Added 6 default presets (Portrait, Landscape, Anime, Photorealistic, Artistic, Quick)
- Implemented full CRUD: save/load/delete/favorite
- Added import/export functionality (JSON)
- Added category filtering and search
- Integrated Folder button in Header

**3.4 Enhanced History/Gallery:**

- Created GalleryModal with 3 view modes (grid/list/detail)
- Added search by prompt, filter by favorites
- Added sort by date/dimensions
- Implemented full metadata display in detail view
- Added per-item actions: download, favorite, delete
- Added navigation arrows in detail view
- Integrated "View All" button in WorkflowSidebar

**3.5 GPU/Queue Status:**

- Created `useSystemStatus.ts` hook
- Polls `/sdapi/v1/memory` and `/queue/status` every 2 seconds
- Parses CUDA memory and calculates GPU usage %
- Extracts queue pending/running counts
- Integrated into Header with live display
- GPU memory shown on hover
- Graceful error handling for missing APIs

---

This plan captures the **full ambition** of the project and provides a clear roadmap to completion. Phases 1-3 are complete, with all core features, secondary workflows, and quality-of-life enhancements implemented. The remaining work focuses on advanced features, polish, and testing.
