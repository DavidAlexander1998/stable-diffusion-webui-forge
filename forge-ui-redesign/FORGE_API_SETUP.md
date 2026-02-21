# Stable Diffusion Forge API Setup Guide

This guide will help you enable the REST API in Stable Diffusion Forge so the Forge UI can communicate with the backend.

## Quick Start

The Forge UI requires the Stable Diffusion Forge backend to run with the **`--api` flag** enabled. Without this flag, the REST API endpoints (`/sdapi/v1/*`) will not be available.

## Step-by-Step Setup

### Windows

1. **Locate your Forge installation folder**
   - Find where you installed Stable Diffusion Forge
   - Look for the `webui-user.bat` file

2. **Edit the launch script**
   - Right-click `webui-user.bat` → "Edit"
   - Find the line with `COMMANDLINE_ARGS`
   - Add `--api` to the arguments

   **Example:**
   ```batch
   @echo off

   set PYTHON=
   set GIT=
   set VENV_DIR=
   set COMMANDLINE_ARGS=--api --xformers

   call webui.bat
   ```

3. **Save and restart Forge**
   - Save the file
   - Close Forge if it's running
   - Double-click `webui-user.bat` to restart
   - Wait for Forge to fully start (watch the console)

### Linux / Mac

1. **Locate your Forge installation folder**
   - Find where you installed Stable Diffusion Forge
   - Look for the `webui-user.sh` file

2. **Edit the launch script**
   - Open `webui-user.sh` in a text editor
   - Find the line with `export COMMANDLINE_ARGS`
   - Add `--api` to the arguments

   **Example:**
   ```bash
   #!/bin/bash

   export COMMANDLINE_ARGS="--api --xformers"

   ./webui.sh
   ```

3. **Make the script executable (if needed)**
   ```bash
   chmod +x webui-user.sh
   ```

4. **Save and restart Forge**
   - Save the file
   - Stop Forge if it's running (Ctrl+C in terminal)
   - Run `./webui-user.sh` to restart
   - Wait for Forge to fully start

## Verify API is Working

Once Forge is running with `--api`, you can verify it's working:

### Method 1: Browser Check
1. Open your browser
2. Navigate to: `http://localhost:7860/docs`
3. You should see the Swagger API documentation
4. Look for endpoints starting with `/sdapi/v1/`

### Method 2: Direct Endpoint Check
1. Open your browser
2. Navigate to: `http://localhost:7860/sdapi/v1/samplers`
3. You should see JSON data with a list of samplers

### Method 3: Forge UI Status
1. Open the Forge UI in your browser
2. Look at the top-right corner at the **API status indicator**
3. It should show:
   - ✅ **Green "Connected"** = API is working correctly
   - ⚠️ **Yellow "No API"** = Forge is running but `--api` flag is missing
   - 🔴 **Red "Offline"** = Cannot connect to Forge at all

## Troubleshooting

### "API Not Enabled" Error

**Symptom:** API status shows yellow "No API" warning

**Solution:**
1. Make sure you added `--api` to the launch arguments
2. Restart Forge completely (close and reopen)
3. Check the console output for any errors
4. Verify the API documentation is accessible at `http://localhost:7860/docs`

### "Disconnected" / "Offline" Error

**Symptom:** API status shows red "Offline" error

**Possible causes:**

1. **Forge is not running**
   - Solution: Start Forge using `webui-user.bat` (Windows) or `webui-user.sh` (Linux/Mac)

2. **Forge is running on a different port**
   - Solution: Check the console output for the actual port
   - Update `.env` file in Forge UI with the correct port:
     ```
     VITE_API_URL=http://localhost:XXXX
     ```
   - Replace `XXXX` with the actual port number

3. **Firewall is blocking the connection**
   - Solution: Add an exception for Forge in your firewall
   - Or temporarily disable the firewall to test

4. **Forge crashed or failed to start**
   - Solution: Check the console output for error messages
   - Look for missing dependencies or model files

### Port Configuration

By default, Forge runs on `http://localhost:7860`. If you need to change this:

#### Change Forge's Port

Edit your launch script and add `--port` argument:

**Windows (`webui-user.bat`):**
```batch
set COMMANDLINE_ARGS=--api --port 7861
```

**Linux/Mac (`webui-user.sh`):**
```bash
export COMMANDLINE_ARGS="--api --port 7861"
```

#### Update Forge UI Configuration

1. Create a `.env` file in the Forge UI folder (if it doesn't exist)
2. Copy contents from `.env.example`
3. Update the `VITE_API_URL` to match your Forge port:
   ```
   VITE_API_URL=http://localhost:7861
   ```
4. Restart the Forge UI development server

## Common Launch Arguments

Here are commonly used launch arguments you might want to combine with `--api`:

```batch
# Windows example
set COMMANDLINE_ARGS=--api --xformers --medvram --autolaunch

# Linux/Mac example
export COMMANDLINE_ARGS="--api --xformers --medvram --autolaunch"
```

**Useful flags:**
- `--api` - Enable REST API (REQUIRED for Forge UI)
- `--xformers` - Use xformers for faster generation (if installed)
- `--medvram` - Optimize for 6-8GB VRAM GPUs
- `--lowvram` - Optimize for 4GB VRAM GPUs
- `--autolaunch` - Automatically open browser when Forge starts
- `--port 7860` - Specify custom port (default: 7860)
- `--listen` - Allow connections from network (not just localhost)
- `--share` - Create a gradio.live share link

**Security warning:** Only use `--listen` or `--share` if you understand the security implications!

## Advanced Configuration

### Running Forge UI on a Different Machine

If you want to access Forge from a different computer on your network:

1. **On the Forge machine:**
   - Add `--listen` to launch arguments:
     ```batch
     set COMMANDLINE_ARGS=--api --listen
     ```
   - Note the machine's IP address (run `ipconfig` on Windows or `ifconfig` on Linux/Mac)

2. **On the Forge UI machine:**
   - Create/edit `.env` file
   - Set `VITE_API_URL` to the Forge machine's IP:
     ```
     VITE_API_URL=http://192.168.1.100:7860
     ```
   - Replace `192.168.1.100` with the actual IP address

### Using HTTPS / Reverse Proxy

If you're running Forge behind a reverse proxy (nginx, Apache, etc.), update the `.env` file:

```
VITE_API_URL=https://your-domain.com/forge
```

Make sure your reverse proxy:
- Forwards `/sdapi/v1/*` endpoints to Forge
- Allows WebSocket connections (for progress updates)
- Has appropriate CORS headers set

## Still Having Issues?

1. **Check the browser console:**
   - Press F12 in your browser
   - Look for error messages in the Console tab
   - Share error messages when asking for help

2. **Check Forge console output:**
   - Look for error messages in the terminal/command prompt where Forge is running
   - API-related messages will mention `uvicorn` or `/sdapi/v1/`

3. **Verify Forge version:**
   - Make sure you're using a recent version of Stable Diffusion Forge
   - Older forks might not support the API

4. **Ask for help:**
   - Provide the error message from the Forge UI connection status
   - Provide relevant console output from Forge
   - Mention your operating system and Forge version

## Quick Reference

| Status | Meaning | Action |
|--------|---------|--------|
| ✅ Connected | API is working | None - you're good to go! |
| ⚠️ No API | Forge running but API disabled | Add `--api` flag and restart |
| 🔴 Offline | Cannot connect to Forge | Start Forge or check port/firewall |

---

**Need more help?** Check the [Stable Diffusion Forge documentation](https://github.com/lllyasviel/stable-diffusion-webui-forge) or create an issue in the Forge UI repository.
