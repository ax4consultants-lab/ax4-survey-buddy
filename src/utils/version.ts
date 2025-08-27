/**
 * Application version utilities
 */

// In a real build process, this could be injected from package.json
// For now, we'll use a hardcoded version
export const APP_VERSION = "1.0.0";

/**
 * Get formatted version string for exports
 */
export const getVersionString = (): string => {
  return `v${APP_VERSION}`;
};

/**
 * Get formatted export timestamp
 */
export const getExportTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Get combined footer metadata for reports
 */
export const getReportMetadata = (assessorName?: string, companyName?: string): string => {
  const version = getVersionString();
  const timestamp = getExportTimestamp();
  const parts = [];
  
  if (assessorName) parts.push(assessorName);
  if (companyName) parts.push(companyName);
  parts.push(`Exported ${timestamp}`);
  parts.push(version);
  
  return parts.join(' • ');
};