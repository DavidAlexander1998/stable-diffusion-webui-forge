# 🎨 Forge UI Redesign - Cinematic Studio

A modern, sophisticated redesign of the Stable Diffusion Forge WebUI with a professional "cinematic studio" aesthetic.

## 🚀 Quick Start

### Prerequisites

**IMPORTANT:** This UI requires Stable Diffusion Forge to be running with the `--api` flag enabled.

📖 **[Read the full setup guide](./FORGE_API_SETUP.md)** for detailed instructions on enabling the Forge API.

**Quick setup:**
1. Edit `webui-user.bat` (Windows) or `webui-user.sh` (Linux/Mac)
2. Add `--api` to `COMMANDLINE_ARGS`
3. Restart Forge
4. The API status indicator in the UI will turn green when connected

### Installation
```bash
cd webui/forge-ui-redesign
npm install
```

### Configuration (Optional)
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env to customize API URL, timeout, etc.
# Default: VITE_API_URL=http://localhost:7860
```

### Development
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Troubleshooting

If you see connection errors:
- ✅ **Green "Connected"** = Everything working!
- ⚠️ **Yellow "No API"** = Add `--api` flag to Forge launch args
- 🔴 **Red "Offline"** = Forge is not running or wrong port

See [FORGE_API_SETUP.md](./FORGE_API_SETUP.md) for complete troubleshooting.

## 🌟 Key Features

- ✨ Smart Prompt Editor with character counting
- 📐 Visual Aspect Ratio Grid
- 🎛️ Sampler Cards with quality badges  
- 🎬 Real-time Generation Queue
- 📸 Interactive History Carousel
- 📱 Fully Responsive Design
- 🎭 Progressive Disclosure (Minimal → Advanced)
- ⚡ Smooth Framer Motion Animations

## 🎨 Design System

**Cinematic Studio Aesthetic:**
- Theatrical depth with layered shadows
- Animated film grain texture
- Gradient mesh backgrounds
- Refined typography (Staatliches + IBM Plex Sans)

**Built with React + TypeScript + Vite + Framer Motion**
