import { SurveyData, Item, Settings } from '@/schemas';
import { getRecommendationText } from '@/domain/recommendations';
import { getPhotosForItem, PhotoData } from '@/storage/db';

export interface ReportRow {
  referenceNumber: string;
  buildingArea: string;
  externalInternal: string;
  location1: string;
  location2: string;
  fullLocation: string;
  itemUse: string;
  materialType: string;
  asbestosTypes: string;
  sampleStatus: string;
  sampleReference: string;
  quantity: number | undefined;
  unit: string;
  dimensions: string;
  painted: string;
  friable: string;
  condition: string;
  accessibility: string;
  warningLabelsVisible: string;
  riskLevel: string;
  recommendation: string;
  recommendationText: string;
  warningLabelsAffixed: number | undefined;
  notes: string;
  photos: PhotoData[];
  isHighRisk: boolean;
  requiresAction: boolean;
}

export interface ReportData {
  survey: SurveyData['survey'];
  settings: Settings | null;
  rows: ReportRow[];
  summary: {
    totalItems: number;
    buildingAreas: string[];
    highRiskItems: number;
    actionItems: number;
    totalPhotos: number;
  };
}

export interface ExportOptions {
  selectedItemIds?: string[];
  selectedRoomIds?: string[];
  includePhotos?: boolean;
  maxPhotosPerItem?: number;
}

/**
 * Build report data from survey data with filtering options
 */
export const buildReportData = async (
  surveyData: SurveyData,
  settings: Settings | null = null,
  options: ExportOptions = {}
): Promise<ReportData> => {
  const {
    selectedItemIds,
    selectedRoomIds,
    includePhotos = true,
    maxPhotosPerItem = 10,
  } = options;

  let filteredItems = surveyData.items;

  // Filter by selected items
  if (selectedItemIds && selectedItemIds.length > 0) {
    filteredItems = filteredItems.filter(item => selectedItemIds.includes(item.itemId));
  }

  // Filter by selected rooms (assuming items have roomId or can be linked to rooms)
  if (selectedRoomIds && selectedRoomIds.length > 0) {
    const roomNames = surveyData.rooms
      .filter(room => selectedRoomIds.includes(room.roomId))
      .map(room => room.roomName);
    
    // Filter items by location2 (room name) - this may need adjustment based on your data model
    filteredItems = filteredItems.filter(item => 
      roomNames.some(roomName => 
        item.location2.toLowerCase().includes(roomName.toLowerCase())
      )
    );
  }

  // Build report rows
  const rows: ReportRow[] = await Promise.all(
    filteredItems.map(async (item) => {
      const photos = includePhotos 
        ? await getPhotosForItem(item.photoIds || []).then(photos => 
            photos.slice(0, maxPhotosPerItem)
          )
        : [];

      const recommendationText = getRecommendationText(
        surveyData.survey.documentType,
        item.recommendation
      );

      const isHighRisk = item.riskLevel === 'High';
      const requiresAction = item.recommendation && 
        (item.recommendation.toLowerCase().includes('remove') ||
         item.recommendation.toLowerCase().includes('repair') ||
         item.recommendation.toLowerCase().includes('action'));

      return {
        referenceNumber: item.referenceNumber,
        buildingArea: item.buildingArea,
        externalInternal: item.externalInternal,
        location1: item.location1,
        location2: item.location2,
        fullLocation: `${item.location1} - ${item.location2}`,
        itemUse: item.itemUse,
        materialType: item.materialType,
        asbestosTypes: item.asbestosTypes.join(', ') || 'Not specified',
        sampleStatus: item.sampleStatus,
        sampleReference: item.sampleReference || '',
        quantity: item.quantity,
        unit: item.unit || '',
        dimensions: formatDimensions(item),
        painted: formatBoolean(item.painted),
        friable: formatBoolean(item.friable),
        condition: item.condition,
        accessibility: item.accessibility,
        warningLabelsVisible: formatBoolean(item.warningLabelsVisible),
        riskLevel: item.riskLevel,
        recommendation: item.recommendation,
        recommendationText,
        warningLabelsAffixed: item.warningLabelsAffixed,
        notes: item.notes || '',
        photos,
        isHighRisk,
        requiresAction,
      };
    })
  );

  // Calculate summary
  const buildingAreas = [...new Set(rows.map(row => row.buildingArea))];
  const highRiskItems = rows.filter(row => row.isHighRisk).length;
  const actionItems = rows.filter(row => row.requiresAction).length;
  const totalPhotos = rows.reduce((sum, row) => sum + row.photos.length, 0);

  return {
    survey: surveyData.survey,
    settings,
    rows,
    summary: {
      totalItems: rows.length,
      buildingAreas,
      highRiskItems,
      actionItems,
      totalPhotos,
    },
  };
};

/**
 * Format item dimensions into a readable string
 */
const formatDimensions = (item: Item): string => {
  const parts: string[] = [];
  
  if (item.length) parts.push(`L: ${item.length}m`);
  if (item.width) parts.push(`W: ${item.width}m`);
  if (item.diameter) parts.push(`Ø: ${item.diameter}m`);
  if (item.thickness) parts.push(`T: ${item.thickness}${item.thickness < 1 ? 'mm' : 'm'}`);
  
  return parts.join(', ') || '';
};

/**
 * Format boolean values for display
 */
const formatBoolean = (value: boolean | null): string => {
  if (value === null) return 'Not specified';
  return value ? 'Yes' : 'No';
};

/**
 * Group report rows by building area and location
 */
export const groupReportRows = (rows: ReportRow[]): Record<string, ReportRow[]> => {
  return rows.reduce((acc, row) => {
    const key = `${row.buildingArea} - ${row.externalInternal}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {} as Record<string, ReportRow[]>);
};