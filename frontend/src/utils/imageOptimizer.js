/**
 * Universal Image Optimizer & Auto-Converter
 * 
 * - Mengubah APAPUN jenis format foto (HEIC, HEIF, PNG, WEBP, BMP, GIF, JPG kamera HP resolusi 4K/8K)
 * - Otomatis me-resize secara proporsional ke resolusi optimal (max 1280px)
 * - Mengompresi ke format standar JPEG (quality 0.82) sehingga ukuran berkas menyusut ~90-95%
 * - Menghasilkan berkas .jpg universal yang ringan untuk database & server serta 100% tampil di semua browser
 * - Menyediakan SVG fallback aman agar tidak pernah muncul ikon gambar rusak (broken image)
 */

export const IMAGE_FALLBACK_SVG = 
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%23f8fafc"><rect width="400" height="300" fill="%23f1f5f9"/><circle cx="200" cy="125" r="32" fill="%23e2e8f0"/><path d="M190 135c0-12 10-20 20-20s20 8 20 20" stroke="%23059669" stroke-width="3" fill="none"/><path d="M200 115v20M192 123l8-8 8 8" stroke="%2310b981" stroke-width="2.5" stroke-linecap="round"/><text x="50%" y="185" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23475569">Foto Dokumentasi Lapangan</text><text x="50%" y="208" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%2394a3b8">Festival Tanam Hulu 2026</text></svg>';

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Dynamically load heic2any if an Apple HEIC/HEIF file is uploaded on a browser that lacks native HEIC decoding
 */
async function convertHeicIfNeeded(file) {
  const isHeic = 
    file.name?.toLowerCase().endsWith('.heic') || 
    file.name?.toLowerCase().endsWith('.heif') ||
    file.type === 'image/heic' || 
    file.type === 'image/heif';

  if (!isHeic) return file;

  // If already loaded in window
  if (window.heic2any) {
    try {
      const convertedBlob = await window.heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.85,
      });
      const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      return new File([singleBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' });
    } catch (err) {
      console.warn('heic2any conversion error:', err);
    }
  }

  // Attempt dynamic script load
  try {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/heic2any@0.0.4/dist/heic2any.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    if (window.heic2any) {
      const convertedBlob = await window.heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.85,
      });
      const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      return new File([singleBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' });
    }
  } catch (err) {
    console.warn('Dynamic heic2any script load skipped or offline:', err);
  }

  return file;
}

/**
 * Universal Image Processor & Compressor
 * Converts any image to standardized JPEG with max dimension 1280px and quality 0.82
 */
export async function processAndCompressImage(rawFile, maxDimension = 1280, quality = 0.82) {
  if (!rawFile) return null;

  // Step 1: Pre-process HEIC if needed
  const file = await convertHeicIfNeeded(rawFile);
  const originalSizeFormatted = formatBytes(file.size);

  return new Promise((resolve) => {
    // Strategy 1: Try modern createImageBitmap (fastest, memory efficient)
    if (typeof window.createImageBitmap === 'function') {
      createImageBitmap(file)
        .then((bitmap) => {
          const result = renderBitmapToJpeg(bitmap, file, maxDimension, quality, originalSizeFormatted);
          bitmap.close();
          resolve(result);
        })
        .catch(() => {
          // If createImageBitmap fails, fallback to HTMLImageElement
          fallbackWithHtmlImage(file, maxDimension, quality, originalSizeFormatted, resolve);
        });
    } else {
      fallbackWithHtmlImage(file, maxDimension, quality, originalSizeFormatted, resolve);
    }
  });
}

/**
 * Render ImageBitmap to Canvas & export standardized JPEG
 */
function renderBitmapToJpeg(source, file, maxDimension, quality, originalSizeFormatted) {
  let width = source.width;
  let height = source.height;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return makeFallbackResult(file, originalSizeFormatted);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill pure white background for transparent PNG/WEBP
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.drawImage(source, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(makeFallbackResult(file, originalSizeFormatted));
          return;
        }

        const baseName = (file.name || 'foto')
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_');

        const compressedFile = new File([blob], `${baseName}_opt.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        const compressedSizeFormatted = formatBytes(compressedFile.size);
        const savedPercentage = Math.max(
          0,
          Math.round(((file.size - compressedFile.size) / file.size) * 100)
        );

        const previewUrl = URL.createObjectURL(blob);

        resolve({
          file: compressedFile,
          previewUrl,
          originalSize: originalSizeFormatted,
          compressedSize: compressedSizeFormatted,
          savedPercentage: `${savedPercentage}%`,
          width,
          height,
        });
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Fallback loader using standard HTMLImageElement + FileReader
 */
function fallbackWithHtmlImage(file, maxDimension, quality, originalSizeFormatted, resolve) {
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    let width = img.width;
    let height = img.height;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(objectUrl);
      resolve(makeFallbackResult(file, originalSizeFormatted));
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(objectUrl);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(makeFallbackResult(file, originalSizeFormatted));
          return;
        }

        const baseName = (file.name || 'foto')
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_');

        const compressedFile = new File([blob], `${baseName}_opt.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        const compressedSizeFormatted = formatBytes(compressedFile.size);
        const savedPercentage = Math.max(
          0,
          Math.round(((file.size - compressedFile.size) / file.size) * 100)
        );

        const previewUrl = URL.createObjectURL(blob);

        resolve({
          file: compressedFile,
          previewUrl,
          originalSize: originalSizeFormatted,
          compressedSize: compressedSizeFormatted,
          savedPercentage: `${savedPercentage}%`,
          width,
          height,
        });
      },
      'image/jpeg',
      quality
    );
  };

  img.onerror = () => {
    console.warn('Fallback HTMLImageElement failed to decode file, passing original.');
    resolve(makeFallbackResult(file, originalSizeFormatted));
  };

  img.src = objectUrl;
}

function makeFallbackResult(file, originalSizeFormatted) {
  const fallbackUrl = URL.createObjectURL(file);
  return {
    file,
    previewUrl: fallbackUrl,
    originalSize: originalSizeFormatted,
    compressedSize: originalSizeFormatted,
    savedPercentage: '0%',
    width: null,
    height: null,
  };
}

/**
 * High-level wrapper for web image optimization
 */
export async function optimizeImageForWeb(file, options = {}) {
  const maxDim = options.maxDimension || 1280;
  const qual = options.quality || 0.82;
  const res = await processAndCompressImage(file, maxDim, qual);
  return {
    file: res.file,
    previewUrl: res.previewUrl,
    stats: {
      originalSize: file.size,
      compressedSize: res.file.size,
      compressionRatio: parseInt(res.savedPercentage, 10) || 0,
    },
  };
}
