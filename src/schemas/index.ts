import { z } from 'zod';

export const SurveySchema = z.object({
  surveyId: z.string(),
  jobId: z.string(),
  siteName: z.string(),
  clientName: z.string(),
  siteContactName: z.string().optional(),
  siteContactPhone: z.string().optional(),
  surveyType: z.enum(['Pre-Sale', 'Demolition', 'Re-Inspection', 'Workplace']),
  documentType: z.enum(['AMPR', 'AMPRU', 'ARRA', 'ARRAU', 'HSMR']),
  surveyor: z.string(),
  date: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const RoomSchema = z.object({
  roomId: z.string(),
  surveyId: z.string(),
  roomName: z.string(),
  createdAt: z.string(),
});

export const ItemSchema = z.object({
  itemId: z.string(),
  surveyId: z.string(),
  referenceNumber: z.string(),
  photoReference: z.string().optional(),
  buildingArea: z.string(),
  externalInternal: z.enum(['External', 'Internal', 'Not Specified', '']),
  location1: z.string(),
  location2: z.string(),
  itemUse: z.string(),
  materialType: z.string(),
  asbestosTypes: z.array(z.string()),
  sampleStatus: z.enum(['Sample', 'Similar to Sample', 'Not Sampled']),
  sampleReference: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.enum(['m2', 'pieces', 'lineal meters', 'length', '']).optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  diameter: z.number().optional(),
  thickness: z.number().optional(),
  painted: z.boolean().nullable(),
  friable: z.boolean().nullable(),
  condition: z.enum(['Good', 'Medium', 'Poor', '']),
  accessibility: z.enum(['Accessible', 'Limited Access', 'Generally Inaccessible', '']),
  warningLabelsVisible: z.boolean().nullable(),
  riskLevel: z.enum(['Low', 'Medium', 'High']),
  recommendation: z.string(),
  warningLabelsAffixed: z.number().optional(),
  notes: z.string().optional(),
  photoIds: z.array(z.string()).default([]),
  photos: z.array(z.string()).default([]), // Legacy support
  photoReferences: z.array(z.string()).optional(),
  createdAt: z.string(),
});

export const ReportTemplateSchema = z.object({
  templateId: z.string(),
  title: z.string(),
  header: z.string(),
  body: z.string(),
  footer: z.string(),
});

export const SurveyDataSchema = z.object({
  survey: SurveySchema,
  rooms: z.array(RoomSchema),
  items: z.array(ItemSchema),
});

export const SettingsSchema = z.object({
  assessorName: z.string().default(''),
  assessorLicence: z.string().default(''),
  companyName: z.string().default(''),
  companyLogo: z.string().optional(),
  defaultDisclaimer: z.string().default(''),
  defaultFooter: z.string().default(''),
  version: z.string().default('1.0.0'),
});

// Export types
export type Survey = z.infer<typeof SurveySchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type ReportTemplate = z.infer<typeof ReportTemplateSchema>;
export type SurveyData = z.infer<typeof SurveyDataSchema>;
export type Settings = z.infer<typeof SettingsSchema>;