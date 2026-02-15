/**
 * Image utility functions for download, share, and manipulation
 */

export interface ImageMetadata {
  prompt: string;
  negative_prompt?: string;
  seed: number;
  steps: number;
  cfg_scale: number;
  sampler_name: string;
  width: number;
  height: number;
  model?: string;
  [key: string]: any;
}

/**
 * Download an image with metadata
 */
export async function downloadImage(
  imageData: string,
  metadata?: ImageMetadata
): Promise<void> {
  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const seed = metadata?.seed ?? Math.floor(Math.random() * 1000000);
  const filename = `forge_${timestamp}_${seed}.png`;

  // Create download link
  const link = document.createElement('a');
  link.href = imageData;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy image to clipboard
 */
export async function copyImageToClipboard(imageData: string): Promise<boolean> {
  try {
    // Convert base64 to blob
    const response = await fetch(imageData);
    const blob = await response.blob();

    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);

    return true;
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
    return false;
  }
}

/**
 * Copy generation params as text
 */
export function copyParamsAsText(metadata: ImageMetadata): boolean {
  try {
    const text = Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy params to clipboard:', error);
    return false;
  }
}

/**
 * Export params as JSON
 */
export function exportParamsAsJSON(metadata: ImageMetadata): void {
  const json = JSON.stringify(metadata, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `forge_params_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Convert file to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload PNG, JPEG, or WebP.',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }

  return { valid: true };
}

/**
 * Get image dimensions from base64
 */
export function getImageDimensions(
  base64: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = base64;
  });
}

/**
 * Resize image if needed (maintain aspect ratio)
 */
export async function resizeImageIfNeeded(
  base64: string,
  maxWidth: number = 2048,
  maxHeight: number = 2048
): Promise<string> {
  const dims = await getImageDimensions(base64);

  // No resize needed
  if (dims.width <= maxWidth && dims.height <= maxHeight) {
    return base64;
  }

  // Calculate new dimensions
  const ratio = Math.min(maxWidth / dims.width, maxHeight / dims.height);
  const newWidth = Math.floor(dims.width * ratio);
  const newHeight = Math.floor(dims.height * ratio);

  // Create canvas and resize
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = base64;
  });

  ctx.drawImage(img, 0, 0, newWidth, newHeight);
  return canvas.toDataURL('image/png');
}

/**
 * Extract base64 data from data URL
 */
export function extractBase64(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  return match ? match[1] : dataUrl;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
