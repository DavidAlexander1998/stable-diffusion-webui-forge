# Forge UI - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Enable Forge API (REQUIRED)

Edit your Forge launch script:

**Windows** - Edit `webui-user.bat`:
```batch
set COMMANDLINE_ARGS=--api --xformers
```

**Linux/Mac** - Edit `webui-user.sh`:
```bash
export COMMANDLINE_ARGS="--api --xformers"
```

Save and **restart Forge**.

---

### Step 2: Install Forge UI

```bash
cd webui/forge-ui-redesign
npm install
```

---

### Step 3: Configure (Optional)

If Forge is NOT on `http://localhost:7860`:

```bash
cp .env.example .env
# Edit .env and change VITE_API_URL to your Forge URL
```

---

### Step 4: Start Forge UI

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## ✅ Connection Status

Look at the **top-right corner** of the UI:

| Icon | Status | Meaning | Fix |
|------|--------|---------|-----|
| ✅ Green | **Connected** | Everything working! | None needed 🎉 |
| ⚠️ Yellow | **No API** | Forge is running but API disabled | Add `--api` flag and restart |
| 🔴 Red | **Offline** | Cannot connect to Forge | Start Forge or check port |

---

## 📖 Need More Help?

- **Full Setup Guide:** [FORGE_API_SETUP.md](./FORGE_API_SETUP.md)
- **Phase 4 Changes:** [PHASE_4_CLEANUP_SUMMARY.md](./PHASE_4_CLEANUP_SUMMARY.md)
- **Project Plan:** [merry-mapping-papert.md](./merry-mapping-papert.md)

---

## 🛠️ Common Issues

### "No API" Warning

**Problem:** Yellow warning in top-right

**Solution:**
1. Add `--api` to Forge launch args
2. Restart Forge
3. Refresh browser

### "Offline" Error

**Problem:** Red error in top-right

**Solution:**
1. Make sure Forge is running
2. Check Forge is on port 7860 (or update `.env`)
3. Check firewall isn't blocking

### Models Not Loading

**Problem:** Dropdown is empty

**Solution:**
1. Fix API connection first (see above)
2. Wait for models to load (check console)
3. Refresh the page

---

## 🎨 Features Ready to Use

✅ **Text-to-Image** - Full workflow with all controls
✅ **Image-to-Image** - Upload and transform images
✅ **Inpaint** - Mask and regenerate areas
✅ **LoRA Support** - Browse, search, add multiple LoRAs
✅ **Hires Fix** - Upscale during generation
✅ **ControlNet** - Full multi-unit support
✅ **Batch Processing** - Process multiple images
✅ **Upscaling** - Standalone upscale workflow
✅ **Presets** - Save/load workflow presets
✅ **History** - Full gallery with search/favorites
✅ **Keyboard Shortcuts** - Press `?` for help

---

**Ready to create? Start with the text-to-image workflow and explore from there!** 🎨
