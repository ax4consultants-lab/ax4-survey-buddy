/**
 * Sample ID Generator utility
 * Generates unique sample IDs in the format A1xxx, A2xxx, etc.
 */

let currentSampleCounter = 1;

/**
 * Generate a sample ID in the format A1xxx
 */
export const generateSampleId = (): string => {
  const id = `A${currentSampleCounter.toString().padStart(3, '0')}`;
  currentSampleCounter++;
  return id;
};

/**
 * Reset the sample counter (useful for testing or new surveys)
 */
export const resetSampleCounter = (): void => {
  currentSampleCounter = 1;
};

/**
 * Set the sample counter to a specific value
 */
export const setSampleCounter = (value: number): void => {
  currentSampleCounter = Math.max(1, value);
};

/**
 * Get the current sample counter value
 */
export const getCurrentSampleCounter = (): number => {
  return currentSampleCounter;
};