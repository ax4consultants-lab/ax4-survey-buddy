// src/utils/camera.ts
export type CaptureOptions = {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
  mimeType?: 'image/jpeg' | 'image/png';
  quality?: number; // 0..1 (jpeg only)
};

export function isMediaCaptureAvailable(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

export async function capturePhoto(opts: CaptureOptions = {}): Promise<Blob> {
  if (!isMediaCaptureAvailable()) {
    throw new Error('Media capture not supported on this device/browser.');
  }
  const {
    facingMode = 'environment',
    width,
    height,
    mimeType = 'image/jpeg',
    quality = 0.92,
  } = opts;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode },
    audio: false,
  });

  try {
    const video = document.createElement('video');
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();

    const w = width ?? (video.videoWidth || 1280);
    const h = height ?? (video.videoHeight || 720);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable.');
    ctx.drawImage(video, 0, 0, w, h);

    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to create image blob.'))),
        mimeType,
        mimeType === 'image/jpeg' ? quality : undefined
      )
    );
    return blob;
  } finally {
    stream.getTracks().forEach((t) => t.stop());
  }
}

// Fallback for devices without camera or when user denies permission
export function openFilePicker(accept = 'image/*'): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      file ? resolve(file) : reject(new Error('No file selected.'));
    };
    input.click();
  });
}

// Handy helper for storing in local/offline state
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
