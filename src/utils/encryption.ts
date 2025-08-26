import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { SurveyData } from '@/schemas';
import { getPhotosForItem, PhotoData } from '@/storage/db';

export interface EncryptedArchive {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  salt: Uint8Array;
}

/**
 * Generate a key from a passphrase using PBKDF2
 */
const deriveKey = async (passphrase: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Create an encrypted archive of survey data
 */
export const createEncryptedArchive = async (
  surveyData: SurveyData,
  passphrase: string,
  filename?: string
): Promise<void> => {
  try {
    // Create ZIP file with survey data and photos
    const zip = new JSZip();
    
    // Add survey JSON data
    zip.file('survey.json', JSON.stringify(surveyData, null, 2));
    
    // Add photos
    const photosFolder = zip.folder('photos');
    const allPhotoIds = surveyData.items.flatMap(item => item.photoIds || []);
    const uniquePhotoIds = [...new Set(allPhotoIds)];
    
    for (const photoId of uniquePhotoIds) {
      const photos = await getPhotosForItem([photoId]);
      if (photos.length > 0) {
        const photo = photos[0];
        photosFolder?.file(photo.filename || `${photoId}.jpg`, photo.blob);
      }
    }
    
    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
    
    // Generate encryption components
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive key from passphrase
    const key = await deriveKey(passphrase, salt);
    
    // Encrypt the ZIP data
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      zipBlob
    );
    
    // Create final archive with metadata
    const archive = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      surveyId: surveyData.survey.surveyId,
      salt: Array.from(salt),
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encryptedData)),
    };
    
    // Save encrypted archive
    const archiveBlob = new Blob([JSON.stringify(archive)], { type: 'application/json' });
    const archiveFilename = filename || `${surveyData.survey.jobId}_${surveyData.survey.siteName.replace(/[^a-zA-Z0-9]/g, '_')}_encrypted.ax4zip`;
    
    saveAs(archiveBlob, archiveFilename);
  } catch (error) {
    console.error('Error creating encrypted archive:', error);
    throw new Error('Failed to create encrypted archive');
  }
};

/**
 * Decrypt and extract an encrypted archive
 */
export const decryptArchive = async (
  archiveFile: File,
  passphrase: string
): Promise<{ surveyData: SurveyData; photos: PhotoData[] }> => {
  try {
    // Read archive file
    const archiveText = await archiveFile.text();
    const archive = JSON.parse(archiveText);
    
    // Reconstruct encryption components
    const salt = new Uint8Array(archive.salt);
    const iv = new Uint8Array(archive.iv);
    const encryptedData = new Uint8Array(archive.data).buffer;
    
    // Derive key from passphrase
    const key = await deriveKey(passphrase, salt);
    
    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    
    // Extract ZIP contents
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(decryptedData);
    
    // Extract survey data
    const surveyFile = loadedZip.file('survey.json');
    if (!surveyFile) {
      throw new Error('Survey data not found in archive');
    }
    
    const surveyText = await surveyFile.async('text');
    const surveyData = JSON.parse(surveyText) as SurveyData;
    
    // Extract photos
    const photos: PhotoData[] = [];
    const photosFolder = loadedZip.folder('photos');
    
    if (photosFolder) {
      const photoFiles = Object.keys(loadedZip.files).filter(path => path.startsWith('photos/'));
      
      for (const photoPath of photoFiles) {
        const photoFile = loadedZip.file(photoPath);
        if (photoFile) {
          const photoBlob = await photoFile.async('blob');
          const filename = photoPath.replace('photos/', '');
          const photoId = filename.split('.')[0]; // Extract ID from filename
          
          photos.push({
            id: photoId,
            blob: photoBlob,
            filename,
            timestamp: Date.now(),
          });
        }
      }
    }
    
    return { surveyData, photos };
  } catch (error) {
    console.error('Error decrypting archive:', error);
    throw new Error('Failed to decrypt archive. Please check your passphrase.');
  }
};

/**
 * Validate if a file is an encrypted archive
 */
export const isEncryptedArchive = (file: File): boolean => {
  return file.name.endsWith('.ax4zip') || file.type === 'application/json';
};