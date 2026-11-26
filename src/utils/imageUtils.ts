import { UploadedRoomImage } from '../types';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export async function processRoomImageFile(
  file: File,
  isPanoramic: boolean
): Promise<UploadedRoomImage> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Unsupported image format (${file.type || 'unknown'}). Please upload JPG, PNG, or WebP.`);
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image exceeds the 20 MB limit. Please choose a smaller photograph.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadHtmlImage(objectUrl);
    const maxDimension = isPanoramic ? 1920 : 1280;
    const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
    const targetWidth = Math.max(1, Math.round(img.naturalWidth * scale));
    const targetHeight = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Browser canvas is unavailable for image processing.');
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    return {
      id: `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: file.name || 'room-photo.jpg',
      dataUrl,
      width: targetWidth,
      height: targetHeight,
      isPanoramic: isPanoramic || targetWidth / targetHeight >= 2.0,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function captureVideoFrameToRoomImage(
  video: HTMLVideoElement,
  isPanoramic: boolean
): UploadedRoomImage {
  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 720;
  const maxDimension = 1280;
  const scale = Math.min(1, maxDimension / Math.max(vw, vh));
  const targetWidth = Math.max(1, Math.round(vw * scale));
  const targetHeight = Math.max(1, Math.round(vh * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to capture frame from camera.');
  }

  ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.86);

  return {
    id: `cam_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: `camera-capture-${new Date().toLocaleTimeString().replace(/[:\s]/g, '-')}.jpg`,
    dataUrl,
    width: targetWidth,
    height: targetHeight,
    isPanoramic,
  };
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode the selected image file.'));
    img.src = src;
  });
}
