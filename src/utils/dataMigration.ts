import { Item, ItemSchema } from '@/schemas';
import { getItems, saveItem } from '@/utils/storage';
import { processAndSavePhoto, generatePhotoId } from '@/utils/photo';

/**
 * Migrate legacy item data to new schema format
 */
export const migrateItemData = async (): Promise<void> => {
  try {
    const items = getItems();
    
    for (const item of items) {
      let needsUpdate = false;
      const updatedItem = { ...item };
      
      // Add missing roomId if needed
      if (!updatedItem.roomId && updatedItem.location2) {
        // Try to map from location2 to a room
        // This is a fallback - in practice, items should have roomId
        console.warn(`Item ${item.itemId} missing roomId, needs manual assignment`);
        updatedItem.roomId = 'unknown-room';
        needsUpdate = true;
      }
      
      // Migrate photos from data URLs to IndexedDB
      if (updatedItem.photos && Array.isArray(updatedItem.photos) && updatedItem.photos.length > 0) {
        const migratedPhotoIds: string[] = [];
        
        for (const photo of updatedItem.photos) {
          if (typeof photo === 'string' && photo.startsWith('data:')) {
            try {
              // Convert data URL to blob
              const response = await fetch(photo);
              const blob = await response.blob();
              
              // Save to IndexedDB
              const photoId = generatePhotoId();
              await processAndSavePhoto(blob, `migrated_${photoId}.jpg`);
              migratedPhotoIds.push(photoId);
            } catch (error) {
              console.warn(`Failed to migrate photo for item ${item.itemId}:`, error);
            }
          } else if (typeof photo === 'string') {
            // Assume it's already a photo ID
            migratedPhotoIds.push(photo);
          }
        }
        
        // Update photoIds and clear legacy photos
        updatedItem.photoIds = migratedPhotoIds;
        updatedItem.photos = []; // Clear legacy data
        needsUpdate = true;
      }
      
      // Validate and save if updated
      if (needsUpdate) {
        try {
          const validatedItem = ItemSchema.parse(updatedItem);
          await saveItem(validatedItem);
          console.log(`Migrated item ${item.itemId}`);
        } catch (error) {
          console.error(`Failed to validate migrated item ${item.itemId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Data migration failed:', error);
  }
};

/**
 * Check if data migration is needed
 */
export const needsDataMigration = (): boolean => {
  try {
    const items = getItems();
    return items.some(item => 
      !item.roomId || 
      (item.photos && Array.isArray(item.photos) && item.photos.some(p => typeof p === 'string' && p.startsWith('data:')))
    );
  } catch {
    return false;
  }
};