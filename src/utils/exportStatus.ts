export interface ExportStatus {
  surveyId: string;
  docxExported: boolean;
  pdfExported: boolean;
  lastExportDate?: string;
}

const EXPORT_STATUS_KEY = 'ax4_export_status';

export const getExportStatus = (surveyId: string): ExportStatus => {
  const allStatuses = getAllExportStatuses();
  return allStatuses.find(s => s.surveyId === surveyId) || {
    surveyId,
    docxExported: false,
    pdfExported: false
  };
};

export const getAllExportStatuses = (): ExportStatus[] => {
  const data = localStorage.getItem(EXPORT_STATUS_KEY);
  return data ? JSON.parse(data) : [];
};

export const updateExportStatus = (
  surveyId: string, 
  updates: Partial<Omit<ExportStatus, 'surveyId'>>
): void => {
  const allStatuses = getAllExportStatuses();
  const existingIndex = allStatuses.findIndex(s => s.surveyId === surveyId);
  
  const updatedStatus: ExportStatus = {
    surveyId,
    ...getExportStatus(surveyId),
    ...updates,
    lastExportDate: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    allStatuses[existingIndex] = updatedStatus;
  } else {
    allStatuses.push(updatedStatus);
  }
  
  localStorage.setItem(EXPORT_STATUS_KEY, JSON.stringify(allStatuses));
};

export const markDocxExported = (surveyId: string): void => {
  updateExportStatus(surveyId, { docxExported: true });
};

export const markPdfExported = (surveyId: string): void => {
  updateExportStatus(surveyId, { pdfExported: true });
};

export const clearExportStatus = (surveyId: string): void => {
  const allStatuses = getAllExportStatuses();
  const filteredStatuses = allStatuses.filter(s => s.surveyId !== surveyId);
  localStorage.setItem(EXPORT_STATUS_KEY, JSON.stringify(filteredStatuses));
};