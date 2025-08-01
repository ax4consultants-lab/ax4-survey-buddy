import { z } from "zod";

// Survey schema
export const surveySchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  siteName: z.string().min(1, "Site name is required"),
  clientName: z.string().min(1, "Client name is required"),
  siteContactName: z.string().optional(),
  siteContactPhone: z.string().optional(),
  surveyType: z.enum(["Pre-Sale", "Demolition", "Re-Inspection", "Workplace"]),
  documentType: z.enum(["AMPR", "AMPRU", "ARRA", "ARRAU", "HSMR"]),
  surveyor: z.string().min(1, "Surveyor is required"),
});

// Item schema
export const itemSchema = z.object({
  buildingArea: z.string().min(1, "Building area is required"),
  externalInternal: z.enum(["External", "Internal", "Not Specified"]),
  location1: z.string().min(1, "Location 1 is required"),
  location2: z.string().min(1, "Location 2 is required"),
  itemUse: z.string().min(1, "Item use is required"),
  materialType: z.string().min(1, "Material type is required"),
  sampleStatus: z.enum(["Sample", "Similar to Sample", "Not Sampled"]),
  sampleReference: z.string().optional(),
  quantity: z.string().optional(),
  unit: z.enum(["m2", "pieces", "lineal meters", "length"]).optional(),
  length: z.string().optional(),
  width: z.string().optional(),
  diameter: z.string().optional(),
  thickness: z.string().optional(),
  painted: z.boolean().nullable(),
  friable: z.boolean().nullable(),
  condition: z.enum(["Good", "Medium", "Poor"]),
  accessibility: z.enum(["Accessible", "Limited Access", "Generally Inaccessible"]),
  warningLabelsVisible: z.boolean().nullable(),
  riskLevel: z.enum(["High", "Medium", "Low"]),
  recommendation: z.string().min(1, "Recommendation is required"),
  notes: z.string().optional(),
});

export type SurveyFormData = z.infer<typeof surveySchema>;
export type ItemFormData = z.infer<typeof itemSchema>;