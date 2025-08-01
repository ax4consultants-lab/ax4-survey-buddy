import React from "react";

// Draft auto-save functionality for form data
export interface DraftData {
  formData: any;
  timestamp: number;
  surveyId?: string;
}

const DRAFT_PREFIX = 'draft_';
const DRAFT_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const saveDraft = (key: string, formData: any, surveyId?: string): void => {
  try {
    const draft: DraftData = {
      formData,
      timestamp: Date.now(),
      surveyId
    };
    localStorage.setItem(`${DRAFT_PREFIX}${key}`, JSON.stringify(draft));
  } catch (error) {
    console.warn('Failed to save draft:', error);
  }
};

export const loadDraft = (key: string): any | null => {
  try {
    const draftJson = localStorage.getItem(`${DRAFT_PREFIX}${key}`);
    if (!draftJson) return null;
    
    const draft: DraftData = JSON.parse(draftJson);
    
    // Check if draft has expired
    if (Date.now() - draft.timestamp > DRAFT_EXPIRY) {
      removeDraft(key);
      return null;
    }
    
    return draft.formData;
  } catch (error) {
    console.warn('Failed to load draft:', error);
    return null;
  }
};

export const removeDraft = (key: string): void => {
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${key}`);
  } catch (error) {
    console.warn('Failed to remove draft:', error);
  }
};

export const clearExpiredDrafts = (): void => {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(DRAFT_PREFIX));
    
    keys.forEach(key => {
      const draftJson = localStorage.getItem(key);
      if (draftJson) {
        try {
          const draft: DraftData = JSON.parse(draftJson);
          if (Date.now() - draft.timestamp > DRAFT_EXPIRY) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Invalid draft data, remove it
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.warn('Failed to clear expired drafts:', error);
  }
};

// Auto-save hook for form data
export const useAutoSave = (key: string, formData: any, delay: number = 2000) => {
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  
  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      saveDraft(key, formData);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, formData, delay]);
  
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};