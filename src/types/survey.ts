export interface Survey {
  surveyId: string;
  jobId: string;
  siteName: string;
  clientName: string;
  siteContactName?: string;
  siteContactPhone?: string;
  surveyType: 'Pre-Sale' | 'Demolition' | 'Re-Inspection' | 'Workplace';
  documentType: 'AMPR' | 'AMPRU' | 'ARRA' | 'ARRAU' | 'HSMR';
  surveyor: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  roomId: string;
  surveyId: string;
  roomName: string;
  createdAt: string;
}

export interface Item {
  itemId: string;
  surveyId: string;
  referenceNumber: string;
  photoReference?: string;
  // Hierarchical location structure
  buildingArea: string; // Main Residence/Main Building/Granny Flat/etc
  externalInternal: 'External' | 'Internal' | 'Not Specified' | '';
  location1: string; // Elevations if external, Sections if Internal
  location2: string; // Rooms, and specific area
  itemUse: string; // cladding, lining, splash-back, etc
  materialType: string;
  asbestosTypes: string[];
  // Sample tracking
  sampleStatus: 'Sample' | 'Similar to Sample' | 'Not Sampled';
  sampleReference?: string; // e.g., "Sample 1", "Sample 2"
  // Size and quantity measurements
  quantity?: number;
  unit?: 'm2' | 'pieces' | 'lineal meters' | 'length' | '';
  length?: number; // in meters
  width?: number; // in meters
  diameter?: number; // in meters
  thickness?: number; // in meters/mm
  // Condition assessment
  painted: boolean | null;
  friable: boolean | null;
  condition: 'Good' | 'Medium' | 'Poor' | '';
  accessibility: 'Accessible' | 'Limited Access' | 'Generally Inaccessible' | '';
  warningLabelsVisible: boolean | null;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: string;
  warningLabelsAffixed?: number;
  notes?: string;
  photos: string[];
  photoReferences?: string[];
  createdAt: string;
}

export interface ReportTemplate {
  templateId: string;
  title: string;
  header: string;
  body: string;
  footer: string;
}

export interface SurveyData {
  survey: Survey;
  rooms: Room[];
  items: Item[];
}