import { savePhoto, PhotoData } from '@/storage/db';

/**
 * Resize and normalize photo orientation before saving
 */
export const processAndSavePhoto = async (
  file: File | Blob,
  photoId: string,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = async () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw the image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            const filename = file instanceof File ? file.name : `photo_${photoId}.jpg`;
            await savePhoto(photoId, blob, filename);
            resolve();
          } else {
            reject(new Error('Failed to process image'));
          }
        }, 'image/jpeg', quality);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Create object URL from file/blob
    const url = URL.createObjectURL(file);
    img.src = url;
  });
};

/**
 * Convert photo data to data URL for use in exports
 */
export const photoToDataUrl = (photo: PhotoData): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(photo.blob);
  });
};

/**
 * Generate a unique photo ID
 */
export const generatePhotoId = (): string => {
  return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Compress image blob for storage efficiency
 */
export const compressImage = (
  blob: Blob,
  maxSizeKB: number = 500,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (blob.size <= maxSizeKB * 1024) {
      resolve(blob);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const compress = (q: number) => {
        canvas.toBlob((compressedBlob) => {
          if (compressedBlob) {
            if (compressedBlob.size <= maxSizeKB * 1024 || q <= 0.1) {
              resolve(compressedBlob);
            } else {
              compress(q - 0.1);
            }
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, 'image/jpeg', q);
      };

      compress(quality);
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(blob);
  });
};