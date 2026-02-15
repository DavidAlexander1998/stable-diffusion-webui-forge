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
  metadata?: ImageMetadata,
  options?: {
    format?: 'png' | 'jpg' | 'webp';
    quality?: number; // 0-1 for jpg/webp
    embedMetadata?: boolean;
  }
): Promise<void> {
  const format = options?.format ?? 'png';
  const quality = options?.quality ?? 0.95;
  const embedMetadata = options?.embedMetadata ?? true;
  
  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const seed = metadata?.seed ?? Math.floor(Math.random() * 1000000);
  const extension = format === 'jpg' ? 'jpg' : format;
  const filename = `forge_${timestamp}_${seed}.${extension}`;

  let finalData = imageData;

  // Convert format if needed
  if (format !== 'png') {
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageData;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(img, 0, 0);
      
      const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
      finalData = canvas.toDataURL(mimeType, quality);
    } catch (error) {
      console.error('Failed to convert image format, using original:', error);
    }
  }

  // Embed metadata for PNG only
  if (metadata && embedMetadata && format === 'png') {
    try {
      const metadataText = JSON.stringify(metadata);
      finalData = embedPngTextChunk(finalData, 'parameters', metadataText);
    } catch (error) {
      console.error('Failed to embed metadata, using original image:', error);
    }
  }

  // Create download link
  const link = document.createElement('a');
  link.href = finalData;
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
 * Resize and crop an image to fully cover target bounds
 */
export async function resizeImageToCover(
  base64: string,
  targetWidth: number,
  targetHeight: number
): Promise<string> {
  const dims = await getImageDimensions(base64);

  const scale = Math.max(targetWidth / dims.width, targetHeight / dims.height);
  const scaledWidth = Math.ceil(dims.width * scale);
  const scaledHeight = Math.ceil(dims.height * scale);
  const offsetX = Math.floor((targetWidth - scaledWidth) / 2);
  const offsetY = Math.floor((targetHeight - scaledHeight) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

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

  ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
  return canvas.toDataURL('image/png');
}

/**
 * Download all images in a history list
 */
export async function downloadAllImages(images: Array<{ image: string; params?: ImageMetadata }>) {
  for (const item of images) {
    await downloadImage(item.image, item.params);
  }
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

function embedPngTextChunk(dataUrl: string, keyword: string, text: string): string {
  const base64 = dataUrl.split(',')[1];
  if (!base64) {
    throw new Error('Invalid data URL');
  }

  const bytes = base64ToUint8(base64);
  const signature = bytes.slice(0, 8);
  const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!arraysEqual(signature, pngSignature)) {
    throw new Error('Not a PNG image');
  }

  const textData = new TextEncoder().encode(`${keyword}\u0000${text}`);
  const chunkType = new TextEncoder().encode('tEXt');
  const chunkLength = uint32ToBytes(textData.length);
  const crc = uint32ToBytes(crc32(concatUint8(chunkType, textData)));
  const textChunk = concatUint8(chunkLength, chunkType, textData, crc);

  const iendIndex = findChunkIndex(bytes, 'IEND');
  if (iendIndex === -1) {
    throw new Error('PNG missing IEND');
  }

  const output = concatUint8(bytes.slice(0, iendIndex), textChunk, bytes.slice(iendIndex));
  return `data:image/png;base64,${uint8ToBase64(output)}`;
}

function findChunkIndex(bytes: Uint8Array, type: string): number {
  let offset = 8;
  while (offset < bytes.length) {
    const length = bytesToUint32(bytes.slice(offset, offset + 4));
    const chunkType = new TextDecoder().decode(bytes.slice(offset + 4, offset + 8));
    if (chunkType === type) {
      return offset;
    }
    offset += 12 + length;
  }
  return -1;
}

function bytesToUint32(bytes: Uint8Array): number {
  return (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
}

function uint32ToBytes(value: number): Uint8Array {
  return new Uint8Array([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ]);
}

function concatUint8(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
