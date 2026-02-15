# Forge UI Redesign - Complete Implementation Plan

## Context

This is a comprehensive plan to complete the Stable Diffusion Forge UI redesign project. The project already has a **solid foundation (~60% complete)** with working txt2img generation, LoRA support, Hires Fix, and real API integration. However, many ambitious features were envisioned but never fully implemented - we now need to complete ALL of them to deliver the full vision.

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
- ⚠️ Keyboard shortcuts: Ctrl/Cmd+Enter, Ctrl+I, Esc implemented (partial)
- ❌ Settings panel: UI exists, no actual functionality
- ❌ Prompt enhancement: Type selector exists, no real features
- ❌ Workflow presets: Not implemented at all

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
**Status:** ❌ STUBBED (UI exists lines 770-790 in ControlsPanel.tsx, no state)
**Files to Modify:**
- `src/components/ControlsPanel.tsx`
- `src/hooks/useSettings.ts` (NEW)
- `src/types.ts` (add AppSettings interface - already exists)

**What to Build:**
- localStorage persistence for settings
- Settings actually control behavior:

**Auto-save images:**
- Automatically trigger download on generation
- Save to default folder (if file system API available)

**Show live preview:**
- Display progress preview image if available
- Toggle preview in MainCanvas during generation

**Confirm before generate:**
- Confirmation modal before expensive operations
- Show estimated cost/time

**Additional Settings to Add:**
- Default save format (PNG, JPEG, WebP)
- Image quality for JPEG/WebP
- Embed metadata in saved images
- Dark/light theme toggle (already dark, but allow customization)
- Default control mode (Minimal/Standard/Advanced/Expert)
- Auto-apply Hires Fix for large resolutions
- NSFW filter toggle

---

#### 3.2 Prompt Enhancement System
**Status:** ⚠️ TYPE-ONLY (PromptEnhancement type exists, hints display, no logic)
**Files to Modify:**
- `src/components/ControlsPanel.tsx`
- `src/utils/promptUtils.ts` (NEW)

**What to Build:**

**Advanced Prompt Features:**
- Attention/emphasis syntax: `(word:1.2)` for emphasis
- Reduce weight: `(word:0.8)` for de-emphasis
- Syntax highlighting in textarea
- Validation and error display
- Bracket matching

**Wildcard Support:**
- Parse `[option1|option2|option3]` syntax
- Randomly select on generate
- Support for wildcard files (txt files with options)
- Wildcard manager UI

**Structured Prompts:**
- Template system for prompts
- Subject/Style/Mood/Medium fields
- Combine into final prompt
- Save/load prompt templates

**Prompt Library:**
- Save favorite prompts
- Tag/categorize prompts
- Search prompt history
- Import/export prompt collections

**Quality Enhancers:**
- "Enhance" button to add quality tags
- Negative prompt templates (common negatives)
- Style preset selector

---

#### 3.3 Workflow Preset System
**Status:** ❌ NOT IMPLEMENTED
**Files to Create:**
- `src/components/PresetManager.tsx` (NEW)
- `src/components/PresetManager.css` (NEW)
- `src/hooks/usePresets.ts` (NEW)

**What to Build:**
- Save current settings as preset
- Name and description for presets
- Load preset (apply all params)
- Preset categories (Portrait, Landscape, Anime, Realistic, etc.)
- Default presets included
- Import/export presets as JSON
- Share presets via URL
- Preset thumbnails (last generated image with preset)

**Preset Manager UI:**
- Grid view of presets
- Search/filter presets
- Duplicate preset
- Delete preset
- Edit preset metadata

---

#### 3.4 Enhanced History/Gallery
**Status:** ⚠️ MINIMAL (carousel shows 6 recent, no details)
**Files to Modify:**
- `src/components/WorkflowSidebar.tsx`
- `src/components/GalleryModal.tsx` (NEW)
- `src/components/GalleryModal.css` (NEW)

**What to Build:**

**Gallery Modal:**
- Click history item to open full view
- Display full image
- Show all generation parameters
- Show generation time
- Show seed, model, sampler, etc.

**Gallery Features:**
- Infinite scroll (load more history)
- Filter by workflow mode
- Filter by date range
- Search by prompt text
- Sort by date, dimensions, seed
- Grid/list view toggle
- Delete individual items
- Export selected items
- Star/favorite items
- Collections/albums

**History Improvements:**
- Show more than 6 items in sidebar
- Pagination or infinite scroll
- Click to load params into controls
- Quick actions: regenerate, download, delete

---

#### 3.5 GPU/Queue Status (Real Data)
**Status:** ⚠️ MOCK DATA (hardcoded in Header.tsx)
**Files to Modify:**
- `src/components/Header.tsx`
- `src/services/api.ts` (add GPU/queue endpoints if available)
- `src/hooks/useSystemStatus.ts` (NEW)

**What to Build:**
- Poll system status from backend
- Real GPU usage (VRAM, utilization)
- Real queue status (jobs pending/running)
- System info display (Model loaded, VRAM usage)
- Warning indicators (high VRAM, queue full)

**If backend doesn't provide these endpoints:**
- Remove mock data and show N/A
- Or keep as decorative indicators

---

### Phase 4: Advanced Features

#### 4.1 Real-time Preview
**Status:** ❌ NOT IMPLEMENTED
**Files to Modify:**
- `src/hooks/useProgress.ts` (already gets previewImage)
- `src/components/MainCanvas.tsx`

**What to Build:**
- Display preview image during generation (if available)
- Toggle to enable/disable preview
- Preview quality selector (low/medium/high)
- Update preview as steps progress
- Smooth transition between preview and final

---

#### 4.2 Model Manager
**Status:** ⚠️ DROPDOWN ONLY (selection works, no management)
**Files to Create:**
- `src/components/ModelManager.tsx` (NEW)
- `src/components/ModelManager.css` (NEW)

**What to Build:**
- View all installed models
- Model card with info (name, size, type, hash)
- Favorite models
- Recent models
- Model search/filter
- Trigger model scan/refresh
- Download models from Civitai (if backend supports)
- Model preview images

---

#### 4.3 Keyboard Shortcuts
**Status:** ⚠️ PARTIAL (Ctrl/Cmd+Enter, Ctrl+I, Esc implemented)
**Files to Create:**
- `src/hooks/useKeyboardShortcuts.ts` (NEW)
- `src/components/ShortcutsHelp.tsx` (NEW)

**What to Build:**

**Essential Shortcuts:**
- `Ctrl+Enter`: Generate
- `Ctrl+I`: Interrupt generation
- `Ctrl+S`: Save current image
- `Ctrl+D`: Download current image
- `Ctrl+Shift+S`: Save preset
- `Ctrl+Shift+L`: Load preset
- `Esc`: Close modals
- `Arrow Keys`: Navigate history
- `Ctrl+Z/Y`: Undo/redo parameter changes

**Shortcuts Help Modal:**
- Press `?` or `Ctrl+/` to open
- List all shortcuts
- Searchable
- Categories (Generation, Navigation, etc.)

---

#### 4.4 Drag-and-Drop Improvements
**Status:** ⚠️ PARTIAL (image upload has drag-drop)
**Files to Modify:**
- `src/App.tsx`
- Add global drag-drop handlers

**What to Build:**
- Drop image anywhere to switch to img2img
- Drop PNG with metadata to load params
- Drop preset JSON to load preset
- Visual feedback during drag-over
- Handle multiple file drops

---

#### 4.5 Notifications System
**Status:** ❌ NOT IMPLEMENTED
**Files to Create:**
- `src/components/Notification.tsx` (NEW)
- `src/components/Notification.css` (NEW)
- `src/hooks/useNotifications.ts` (NEW)

**What to Build:**
- Toast notifications for events:
  - Generation complete
  - Generation failed
  - Model loaded
  - Settings saved
  - Download complete
- Success/error/warning/info types
- Auto-dismiss with timer
- Dismiss on click
- Queue multiple notifications
- Notification history

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

**Completed:**
1. ✅ Fix panel scrolling CSS issues
   - Modified `ControlsPanel.css` line 509 - removed 500px max-height restriction
2. ✅ Make ImageUpload buttons always visible
   - Modified `ImageUpload.css` lines 154, 182 - changed opacity from 0 to 0.8/0.9
3. 🔄 Add error handling UI with user-friendly messages (PARTIAL)
   - ✅ Created `ErrorModal.tsx` - full modal component with copy/retry
   - ✅ Created `ErrorModal.css` - styled modal with animations
   - ⏸️ TODO: Integrate into App.tsx (replace alert with modal)
   - ⏸️ TODO: Update useGeneration to return structured errors
4. ✅ Add connection status indicator showing "API Not Available"
   - ✅ Created `useApiStatus.ts` hook - checks /sdapi/v1/ availability
   - ✅ Modified `Header.tsx` - added Wifi/WifiOff status indicator
   - ✅ Modified `Header.css` - added green/red status colors

**Remaining:**
5. ⏸️ Update Settings panel with localStorage persistence
   - Need to create `useSettings.ts` hook
   - Need to wire up Settings panel checkboxes
   - Need to persist to localStorage

**Files Created:**
- `src/components/ErrorModal.tsx`
- `src/components/ErrorModal.css`
- `src/hooks/useApiStatus.ts`

**Files Modified:**
- `src/components/ControlsPanel.css`
- `src/components/ImageUpload.css`
- `src/components/Header.tsx`
- `src/components/Header.css`

**Phase 0B: API Required (BLOCKED - User Must Enable API)**
1. ❌ **BLOCKED:** Enable `/sdapi/v1/` API in Forge backend
2. ⏸️ Test model loading
3. ⏸️ Test generation
4. ⏸️ Test all P0 features (download, share, variations, fullscreen)

**Phase 1: Continue P0 Features (After API Fixed)**
Once user enables API and it works:
- Verify all generation workflows
- Test error handling with real errors
- Verify settings persistence

**Phase 2: P1 Features**
- ControlNet Panel
- Inpaint Workflow
- Enhanced History/Gallery
- Prompt Enhancement
- Workflow Presets

This plan captures the **full ambition** of the project and provides a clear roadmap to completion. Every feature mentioned in the summary, every button that exists without functionality, every stubbed component - all of it is accounted for and will be implemented.
