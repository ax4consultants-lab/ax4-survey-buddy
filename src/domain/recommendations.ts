export type DocumentType = 'AMPR' | 'AMPRU' | 'ARRA' | 'ARRAU' | 'HSMR';
export type SurveyType = 'Pre-Sale' | 'Demolition' | 'Re-Inspection' | 'Workplace';

interface RecommendationMapping {
  code: string;
  description: string;
  fullText: string;
}

// AMPR/AMPRU Recommendations (Asbestos Management Plan)
const AMPR_RECOMMENDATIONS: RecommendationMapping[] = [
  {
    code: 'R1',
    description: 'No action required',
    fullText: 'Material is in good condition and poses minimal risk. Continue with routine monitoring as per the Asbestos Management Plan.',
  },
  {
    code: 'R2', 
    description: 'Monitor and maintain',
    fullText: 'Material should be monitored periodically for deterioration. Implement control measures to prevent damage. Review annually.',
  },
  {
    code: 'R3',
    description: 'Repair or encapsulate',
    fullText: 'Material requires repair or encapsulation to prevent fiber release. Work should be undertaken by licensed asbestos professionals.',
  },
  {
    code: 'R4',
    description: 'Remove when disturbed',
    fullText: 'Material should be removed prior to any maintenance or renovation work that may disturb it. Removal must be undertaken by Class A licensed contractors.',
  },
  {
    code: 'R5',
    description: 'Remove immediately',
    fullText: 'Material poses immediate risk and should be removed as soon as practicable. Emergency controls may be required. Class A licensed removal only.',
  },
];

// ARRA/ARRAU Recommendations (Asbestos Removal Assessment)
const ARRA_RECOMMENDATIONS: RecommendationMapping[] = [
  {
    code: 'RA1',
    description: 'No asbestos detected',
    fullText: 'Laboratory analysis confirms no asbestos present in this material. No further action required.',
  },
  {
    code: 'RA2',
    description: 'Non-friable - remove with care',
    fullText: 'Non-friable asbestos material identified. Remove using appropriate precautions including wetting and double-wrapped disposal.',
  },
  {
    code: 'RA3',
    description: 'Friable - Class A removal required',
    fullText: 'Friable asbestos material identified. Removal must be undertaken by Class A licensed asbestos removalist using full containment procedures.',
  },
  {
    code: 'RA4',
    description: 'Highly friable - immediate containment',
    fullText: 'Highly friable asbestos material requiring immediate containment and emergency removal procedures. Class A licensed removal with air monitoring.',
  },
  {
    code: 'RA5',
    description: 'Sample for analysis',
    fullText: 'Material requires sampling and laboratory analysis to confirm asbestos content before any disturbance or removal activities.',
  },
];

// Pre-Demolition Recommendations
const DEMOLITION_RECOMMENDATIONS: RecommendationMapping[] = [
  {
    code: 'D1',
    description: 'No action before demolition',
    fullText: 'No asbestos detected in this material. Standard demolition procedures may proceed.',
  },
  {
    code: 'D2',
    description: 'Remove before demolition',
    fullText: 'Asbestos material must be removed by licensed contractors before demolition activities commence.',
  },
  {
    code: 'D3',
    description: 'Specialized removal required',
    fullText: 'High-risk asbestos material requiring specialized removal techniques and extensive containment before demolition.',
  },
  {
    code: 'D4',
    description: 'Area isolation required',
    fullText: 'Area must be isolated and all asbestos materials removed using full containment procedures before any demolition work.',
  },
  {
    code: 'D5',
    description: 'Emergency assessment',
    fullText: 'Material requires urgent professional assessment before any demolition planning can proceed.',
  },
];

/**
 * Get recommendations based on document type
 */
export const getRecommendationsForType = (documentType: DocumentType): RecommendationMapping[] => {
  switch (documentType) {
    case 'AMPR':
    case 'AMPRU':
      return AMPR_RECOMMENDATIONS;
    case 'ARRA':
    case 'ARRAU':
      return ARRA_RECOMMENDATIONS;
    case 'HSMR':
    default:
      return DEMOLITION_RECOMMENDATIONS;
  }
};

/**
 * Get recommendation text by code and document type
 */
export const getRecommendationText = (documentType: DocumentType, code: string): string => {
  const recommendations = getRecommendationsForType(documentType);
  const recommendation = recommendations.find(r => r.code === code);
  return recommendation?.fullText || code;
};

/**
 * Get recommendation description by code and document type
 */
export const getRecommendationDescription = (documentType: DocumentType, code: string): string => {
  const recommendations = getRecommendationsForType(documentType);
  const recommendation = recommendations.find(r => r.code === code);
  return recommendation?.description || code;
};

/**
 * Get all recommendation codes for a document type
 */
export const getRecommendationCodes = (documentType: DocumentType): string[] => {
  return getRecommendationsForType(documentType).map(r => r.code);
};

/**
 * Determine appropriate recommendations based on survey type
 */
export const getRecommendationsForSurvey = (surveyType: SurveyType, documentType: DocumentType): RecommendationMapping[] => {
  if (surveyType === 'Demolition') {
    return DEMOLITION_RECOMMENDATIONS;
  }
  return getRecommendationsForType(documentType);
};