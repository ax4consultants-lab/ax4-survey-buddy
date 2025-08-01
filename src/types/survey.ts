export interface Survey {
  surveyId: string;
  jobId: string;
  siteName: string;
  surveyType: 'Pre-Sale' | 'Demolition' | 'Re-Inspection' | 'Workplace';
  surveyor: string;
  date: string;
  gpsCoordinates?: string;
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
  roomId: string;
  referenceNumber: string;
  photoReference?: string;
  locationDescription: string;
  itemDescription: string;
  materialType: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: string;
  warningLabelsAffixed?: number;
  notes?: string;
  photos: string[];
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