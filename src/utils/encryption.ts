import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { SurveyData, SurveyDataSchema } from '@/schemas';
import { getPhoto, savePhoto } from '@/storage/db';
import { saveSurvey, saveRoom, saveItem } from '@/utils/storage';
import { getVersionString, getExportTimestamp } from '@/utils/version';

/**
 * Encrypt data using AES-GCM with PBKDF2 key derivation
 */
export const encryptData = async (data: any, passphrase: string): Promise<string> => {
  const encoder = new TextEncoder();
  
  // Generate salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive key from passphrase
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  // Encrypt data
  const plaintext = encoder.encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );
  
  // Combine salt + iv + ciphertext and return as base64
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
  
  return btoa(String.fromCharCode(...combined));
};

/**
 * Decrypt data using AES-GCM with PBKDF2 key derivation
 */
export const decryptData = async (encryptedData: string, passphrase: string): Promise<any> => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  // Decode base64 and extract components
  const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);
  
  // Derive key from passphrase
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  // Decrypt data
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  
  return JSON.parse(decoder.decode(plaintext));
};

/**
 * Create encrypted archive with survey data and photos
 */
export const createEncryptedArchive = async (
  surveyData: SurveyData,
  passphrase: string
): Promise<void> => {
  try {
    // Create JSZip instance
    const zip = new JSZip();
    
    // Add survey data as JSON
    zip.file('survey.json', JSON.stringify(surveyData, null, 2));
    
    // Add photos from IndexedDB
    const photoFolder = zip.folder('photos');
    if (photoFolder) {
      // Get all unique photo IDs from items
      const photoIds = new Set<string>();
      surveyData.items.forEach(item => {
        item.photoIds?.forEach(id => photoIds.add(id));
        // Handle legacy photos array
        if (item.photos && Array.isArray(item.photos)) {
          item.photos.forEach(id => photoIds.add(id));
        }
      });
      
      // Fetch and add photos
      for (const photoId of photoIds) {
        try {
          const photoData = await getPhoto(photoId);
          if (photoData) {
            photoFolder.file(photoData.filename, photoData.blob);
          }
        } catch (error) {
          console.warn(`Failed to add photo ${photoId} to archive:`, error);
        }
      }
    }
    
    // Generate zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Encrypt the zip file using our encryption function
    const encryptedData = await encryptData({
      zipData: Array.from(new Uint8Array(await zipBlob.arrayBuffer())),
      metadata: {
        version: getVersionString(),
        exported: getExportTimestamp(),
        surveyId: surveyData.survey.surveyId
      }
    }, passphrase);
    
    // Create download
    const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });
    const fileName = `${surveyData.survey.jobId}_${surveyData.survey.siteName.replace(/[^a-zA-Z0-9]/g, '_')}_Survey_Archive.ax4zip`;
    
    saveAs(encryptedBlob, fileName);
  } catch (error) {
    console.error('Failed to create encrypted archive:', error);
    throw new Error('Failed to create encrypted archive');
  }
};

/**
 * Restore encrypted archive and return the survey ID
 */
export const restoreEncryptedArchive = async (
  file: File,
  passphrase: string
): Promise<string> => {
  try {
    // Read and decrypt the file
    const fileData = await file.text();
    const decryptedData = await decryptData(fileData, passphrase);
    
    // Reconstruct zip from decrypted data
    const zipData = new Uint8Array(decryptedData.zipData);
    const zip = await JSZip.loadAsync(zipData);
    
    // Extract survey data
    const surveyFile = zip.file('survey.json');
    if (!surveyFile) {
      throw new Error('Invalid archive: survey.json not found');
    }
    
    const surveyJson = await surveyFile.async('text');
    const surveyData: SurveyData = JSON.parse(surveyJson);
    
    // Validate survey data
    const validatedSurvey = SurveyDataSchema.parse(surveyData);
    
    // Store survey data
    await saveSurvey(validatedSurvey.survey);
    
    // Store rooms
    for (const room of validatedSurvey.rooms) {
      await saveRoom(room);
    }
    
    // Restore photos first, then items
    const photoFolder = zip.folder('photos');
    if (photoFolder) {
      await Promise.all(
        Object.keys(photoFolder.files).map(async (filename) => {
          const file = photoFolder.files[filename];
          if (!file.dir) {
            try {
              const blob = await file.async('blob');
              const photoId = filename.replace(/\.[^/.]+$/, ''); // Remove extension
              await savePhoto(photoId, blob, filename);
            } catch (error) {
              console.warn(`Failed to restore photo ${filename}:`, error);
            }
          }
        })
      );
    }
    
    // Store items
    for (const item of validatedSurvey.items) {
      await saveItem(item);
    }
    
    return validatedSurvey.survey.surveyId;
  } catch (error) {
    console.error('Failed to restore encrypted archive:', error);
    if (error instanceof Error && error.message.includes('decrypt')) {
      throw new Error('Incorrect passphrase or corrupted archive');
    }
    throw new Error('Failed to restore archive');
  }
};