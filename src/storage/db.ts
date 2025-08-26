import { get, set, del, keys, clear } from 'idb-keyval';

export interface PhotoData {
  id: string;
  blob: Blob;
  filename: string;
  timestamp: number;
}

const PHOTO_PREFIX = 'photo_';
const SETTINGS_KEY = 'app_settings';

// Photo storage functions
export const savePhoto = async (photoId: string, blob: Blob, filename: string): Promise<void> => {
  const photoData: PhotoData = {
    id: photoId,
    blob,
    filename,
    timestamp: Date.now(),
  };
  await set(`${PHOTO_PREFIX}${photoId}`, photoData);
};

export const getPhoto = async (photoId: string): Promise<PhotoData | null> => {
  try {
    const photoData = await get(`${PHOTO_PREFIX}${photoId}`);
    return photoData || null;
  } catch (error) {
    console.error('Error retrieving photo:', error);
    return null;
  }
};

export const deletePhoto = async (photoId: string): Promise<void> => {
  await del(`${PHOTO_PREFIX}${photoId}`);
};

export const getAllPhotos = async (): Promise<PhotoData[]> => {
  const allKeys = await keys();
  const photoKeys = allKeys.filter(key => typeof key === 'string' && key.startsWith(PHOTO_PREFIX));
  
  const photos: PhotoData[] = [];
  for (const key of photoKeys) {
    const photoData = await get(key);
    if (photoData) {
      photos.push(photoData);
    }
  }
  
  return photos;
};

export const getPhotosForItem = async (photoIds: string[]): Promise<PhotoData[]> => {
  const photos: PhotoData[] = [];
  for (const photoId of photoIds) {
    const photo = await getPhoto(photoId);
    if (photo) {
      photos.push(photo);
    }
  }
  return photos;
};

// Settings storage functions
export const saveSettings = async (settings: any): Promise<void> => {
  await set(SETTINGS_KEY, settings);
};

export const getSettings = async (): Promise<any | null> => {
  try {
    return await get(SETTINGS_KEY);
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return null;
  }
};

// Utility functions
export const clearAllPhotos = async (): Promise<void> => {
  const allKeys = await keys();
  const photoKeys = allKeys.filter(key => typeof key === 'string' && key.startsWith(PHOTO_PREFIX));
  
  for (const key of photoKeys) {
    await del(key);
  }
};

export const getStorageUsage = async (): Promise<{ photoCount: number; totalSize: number }> => {
  const photos = await getAllPhotos();
  const totalSize = photos.reduce((sum, photo) => sum + photo.blob.size, 0);
  
  return {
    photoCount: photos.length,
    totalSize,
  };
};