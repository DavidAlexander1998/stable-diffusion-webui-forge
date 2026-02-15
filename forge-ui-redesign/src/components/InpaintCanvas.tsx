import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Brush, Eraser, Trash2, Upload, FlipHorizontal } from "lucide-react";
import { fileToBase64 } from "../utils/imageUtils";
import "./InpaintCanvas.css";

interface InpaintCanvasProps {
  baseImage: string;
  maskImage?: string | null;
  onMaskChange: (maskDataUrl: string | null) => void;
}

type ToolMode = "brush" | "eraser";

export default function InpaintCanvas({
  baseImage,
  maskImage,
  onMaskChange,
}: InpaintCanvasProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [tool, setTool] = useState<ToolMode>("brush");
  const [brushSize, setBrushSize] = useState(40);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasMask, setHasMask] = useState(false);

  const syncDisplayCanvas = useCallback(() => {
    const displayCanvas = displayCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const img = imgRef.current;

    if (!displayCanvas || !maskCanvas || !img) return;

    const width = img.clientWidth;
    const height = img.clientHeight;

    displayCanvas.width = Math.max(1, Math.floor(width));
    displayCanvas.height = Math.max(1, Math.floor(height));

    const ctx = displayCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    ctx.drawImage(maskCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
  }, []);

  const updateMaskData = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const hasPixels = (() => {
      const ctx = maskCanvas.getContext("2d");
      if (!ctx) return false;
      const { data } = ctx.getImageData(
        0,
        0,
        maskCanvas.width,
        maskCanvas.height,
      );
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] !== 0) return true;
      }
      return false;
    })();

    setHasMask(hasPixels);
    onMaskChange(hasPixels ? maskCanvas.toDataURL("image/png") : null);
  }, [onMaskChange]);

  const initializeMaskCanvas = useCallback(() => {
    const img = imgRef.current;
    const maskCanvas = maskCanvasRef.current;

    if (!img || !maskCanvas) return;

    maskCanvas.width = img.naturalWidth || img.width;
    maskCanvas.height = img.naturalHeight || img.height;

    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

    if (maskImage) {
      const maskImg = new Image();
      maskImg.onload = () => {
        ctx.drawImage(maskImg, 0, 0, maskCanvas.width, maskCanvas.height);
        updateMaskData();
        syncDisplayCanvas();
      };
      maskImg.src = maskImage;
    } else {
      updateMaskData();
      syncDisplayCanvas();
    }
  }, [maskImage, syncDisplayCanvas, updateMaskData]);

  useEffect(() => {
    initializeMaskCanvas();
  }, [initializeMaskCanvas]);

  useEffect(() => {
    const handleResize = () => {
      syncDisplayCanvas();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [syncDisplayCanvas]);

  const getCanvasCoords = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const displayCanvas = displayCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!displayCanvas || !maskCanvas) return null;

    const rect = displayCanvas.getBoundingClientRect();
    const scaleX = maskCanvas.width / rect.width;
    const scaleY = maskCanvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const drawStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const maskCanvas = maskCanvasRef.current;
    const point = getCanvasCoords(event);
    if (!maskCanvas || !point) return;

    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.globalCompositeOperation =
      tool === "eraser" ? "destination-out" : "source-over";

    const lastPoint = lastPointRef.current ?? point;
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;
    syncDisplayCanvas();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setIsDrawing(true);
    lastPointRef.current = null;
    drawStroke(event);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    drawStroke(event);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;
    updateMaskData();
  };

  const handleClearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    syncDisplayCanvas();
    updateMaskData();
  };

  const handleInvertMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(
      0,
      0,
      maskCanvas.width,
      maskCanvas.height,
    );
    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha === 0) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      } else {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    syncDisplayCanvas();
    updateMaskData();
  };

  const handleMaskUpload = async (file: File) => {
    const base64 = await fileToBase64(file);
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      ctx.drawImage(img, 0, 0, maskCanvas.width, maskCanvas.height);
      syncDisplayCanvas();
      updateMaskData();
    };
    img.src = base64;
  };

  return (
    <div className="inpaint-canvas">
      <div className="inpaint-toolbar">
        <div className="tool-group">
          <button
            className={`tool-btn ${tool === "brush" ? "active" : ""}`}
            onClick={() => setTool("brush")}
            title="Brush"
            type="button"
          >
            <Brush size={16} />
          </button>
          <button
            className={`tool-btn ${tool === "eraser" ? "active" : ""}`}
            onClick={() => setTool("eraser")}
            title="Eraser"
            type="button"
          >
            <Eraser size={16} />
          </button>
        </div>

        <div className="tool-group slider-group">
          <label htmlFor="brush-size">Size</label>
          <input
            id="brush-size"
            type="range"
            min={5}
            max={150}
            value={brushSize}
            onChange={(event) => setBrushSize(parseInt(event.target.value, 10))}
          />
          <span className="slider-value">{brushSize}px</span>
        </div>

        <div className="tool-group">
          <button
            className="tool-btn"
            onClick={handleClearMask}
            title="Clear mask"
            type="button"
          >
            <Trash2 size={16} />
          </button>
          <button
            className="tool-btn"
            onClick={handleInvertMask}
            title="Invert mask"
            type="button"
          >
            <FlipHorizontal size={16} />
          </button>
          <button
            className="tool-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload mask"
            type="button"
          >
            <Upload size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleMaskUpload(file);
            }}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div className="inpaint-stage">
        <img
          ref={imgRef}
          src={baseImage}
          alt="Inpaint base"
          onLoad={() => {
            initializeMaskCanvas();
            syncDisplayCanvas();
          }}
        />
        <canvas
          ref={displayCanvasRef}
          className={hasMask ? "has-mask" : ""}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        <canvas ref={maskCanvasRef} className="mask-storage" />
      </div>
    </div>
  );
}
