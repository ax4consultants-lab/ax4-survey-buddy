import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RecommendationSelect } from "@/components/RecommendationSelect";
import { Camera, Upload, Hash, Save, Building2, Package } from "lucide-react";
import {
  saveItem,
  generateId,
  getSurveyById,
  getPhoto,
} from "@/utils/storage";
import { capturePhoto, resizeImage } from "@/utils/camera";
import { savePhoto } from "@/utils/storage";
import { Item, Survey } from "@/types/survey";
import { useToast } from "@/hooks/use-toast";
import { saveDraft, loadDraft, removeDraft } from "@/utils/draftStorage";

// Full list of material types
const MATERIAL_TYPES = [
  "Fibrous cement lining",
  "Fibrous cement sheet",
  "Fibrous cement plank",
  "Fibrous cement 'thick' sheet",
  "Fibre impregnated bituminous membrane tanking ('Malthoid')",
  "Fibre impregnated tar based glue ('Black-Jack')",
  "Fibre impregnated resin boards ('Zelemite' or 'Ausbestos')",
  "Fibre impregnated tar coating to metal sheeting ('Galbestos')",
  "Fibre impregnated plastic ('Bakelite')",
  "Pressed asbestos board ('Millboard')",
  "Vinyl floor tiles",
  "Fibre backed vinyl floor sheeting",
  "Electrical wire shielding",
  "Lift electrical arc shields",
  "Lift brake friction material",
  "Woven fibre electrical arc shields",
  "Fire doors (core material)",
  "Cast pipe lagging",
  "Asbestos rope",
  "Penetration packing material",
  "Fire rating (Limpet)",
  "Gaskets material",
  "Joint sealant ('Mastic')",
  "Possible internal components",
];

export default function AddItem() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoReferences, setPhotoReferences] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const draftKey = `add-item-${surveyId}`;

  const [formData, setFormData] = useState({
    buildingArea: "",
    externalInternal: "Not Specified" as Item["externalInternal"],
    location1: "",
    location2: "",
    itemUse: "",
    materialType: "",
    sampleStatus: "Not Sampled" as Item["sampleStatus"],
    sampleReference: "",
    quantity: 0,
    unit: "" as Item["unit"],
    length: 0,
    width: 0,
    diameter: 0,
    thickness: 0,
    painted: null as boolean | null,
    friable: null as boolean | null,
    condition: "" as Item["condition"],
    accessibility: "" as Item["accessibility"],
    warningLabelsVisible: null as boolean | null,
    riskLevel: "Low" as Item["riskLevel"],
    recommendation: "",
    notes: "",
  });

  // Load survey
  useEffect(() => {
    if (!surveyId) return;
    const data = getSurveyById(surveyId);
    if (!data) {
      toast({ title: "Error", description: "Survey not found", variant: "destructive" });
      return;
    }
    setSurvey(data);
  }, [surveyId, toast]);

  // Restore draft
  useEffect(() => {
    if (!surveyId) return;
    const draft = loadDraft(draftKey);
    if (draft) {
      setFormData(draft);
      toast({ title: "Draft restored", description: "Your previous item data has been restored" });
    }
  }, [surveyId, toast]);

  // Auto-save draft after 2s idle
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.values(formData).some((v) => v !== "" && v !== null && v !== 0)) {
        saveDraft(draftKey, formData, surveyId);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData, draftKey, surveyId]);

  const handleInputChange = (
    field: keyof typeof formData,
    value: typeof formData[typeof field]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTakePhoto = async () => {
    setIsCapturing(true);
    try {
      const dataUrl = await capturePhoto();
      const resized = await resizeImage(dataUrl, 1024, 0.8);
      const id = generateId();
      savePhoto(id, resized);
      setPhotos((p) => [...p, id]);
      toast({ title: "Photo captured", description: "Photo added to item" });
    } catch {
      toast({ title: "Photo error", description: "Failed to capture photo", variant: "destructive" });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const dataUrl = ev.target?.result as string;
        const resized = await resizeImage(dataUrl, 1024, 0.8);
        const id = generateId();
        savePhoto(id, resized);
        setPhotos((p) => [...p, id]);
        toast({ title: "Photo uploaded", description: "Photo added to item" });
      } catch {
        toast({ title: "Upload error", description: "Failed to process photo", variant: "destructive" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhotoReference = () => {
    const ref = prompt("Enter photo reference number:");
    if (ref?.trim()) {
      setPhotoReferences((p) => [...p, ref.trim()]);
      toast({ title: "Reference added", description: "Photo reference number added" });
    }
  };

  const handleFinishSurvey = () => {
    removeDraft(draftKey);
    navigate(`/survey/${surveyId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields explicitly
    if (
      !formData.buildingArea.trim() ||
      !formData.location1.trim() ||
      !formData.location2.trim() ||
      !formData.itemUse.trim() ||
      !formData.materialType ||
      !formData.condition ||
      !formData.accessibility ||
      !formData.riskLevel ||
      !formData.recommendation.trim()
    ) {
      toast({ title: "Missing info", description: "Please complete all required fields", variant: "destructive" });
      return;
    }

    if (!surveyId) return;
    const item: Item = {
      itemId: generateId(),
      surveyId,
      referenceNumber: generateId(),
      buildingArea: formData.buildingArea,
      externalInternal: formData.externalInternal,
      location1: formData.location1,
      location2: formData.location2,
      itemUse: formData.itemUse,
      materialType: formData.materialType,
      asbestosTypes: [],
      sampleStatus: formData.sampleStatus,
      sampleReference: formData.sampleReference || undefined,
      quantity: formData.quantity || undefined,
      unit: formData.unit || undefined,
      length: formData.length || undefined,
      width: formData.width || undefined,
      diameter: formData.diameter || undefined,
      thickness: formData.thickness || undefined,
      painted: formData.painted ?? undefined,
      friable: formData.friable ?? undefined,
      condition: formData.condition,
      accessibility: formData.accessibility,
      warningLabelsVisible: formData.warningLabelsVisible ?? undefined,
      riskLevel: formData.riskLevel,
      recommendation: formData.recommendation,
      notes: formData.notes || undefined,
      photos,
      photoReferences,
      createdAt: new Date().toISOString(),
    };

    saveItem(item);
    removeDraft(draftKey);
    toast({ title: "Item added", description: "Item recorded successfully" });

    // Reset form
    setFormData({
      buildingArea: "",
      externalInternal: "Not Specified",
      location1: "",
      location2: "",
      itemUse: "",
      materialType: "",
      sampleStatus: "Not Sampled",
      sampleReference: "",
      quantity: 0,
      unit: "",
      length: 0,
      width: 0,
      diameter: 0,
      thickness: 0,
      painted: null,
      friable: null,
      condition: "",
      accessibility: "",
      warningLabelsVisible: null,
      riskLevel: "Low",
      recommendation: "",
      notes: "",
    });
    setPhotos([]);
    setPhotoReferences([]);
  };

  if (!survey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Survey not found.</p>
        <Button onClick={() => navigate("/")} variant="outline">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        title="Add Item"
        showBack
        actions={
          <Button onClick={handleFinishSurvey} variant="outline" size="sm">
            Finish Survey
          </Button>
        }
      />

      <div className="container mx-auto p-4 max-w-2xl">
        {/* Survey Context */}
        <Card className="mb-4">
          <CardContent className="flex items-center gap-3 p-4">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{survey.siteName}</p>
              <p className="text-sm text-muted-foreground">Client: {survey.clientName}</p>
              <p className="text-xs text-muted-foreground">Doc Type: {survey.documentType}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> Item Details
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Location Hierarchy</h3>
                <div className="space-y-2">
                  <Label htmlFor="buildingArea">Building or Area *</Label>
                  <Input
                    id="buildingArea"
                    value={formData.buildingArea}
                    onChange={(e) => handleInputChange("buildingArea", e.target.value)}
                    placeholder="e.g., Main Residence"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="externalInternal">External or Internal</Label>
                  <Select
                    value={formData.externalInternal}
                    onValueChange={(v) => handleInputChange("externalInternal", v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="External">External</SelectItem>
                      <SelectItem value="Internal">Internal</SelectItem>
                      <SelectItem value="Not Specified">Not Specified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location1">Location 1 *</Label>
                  <Input
                    id="location1"
                    value={formData.location1}
                    onChange={(e) => handleInputChange("location1", e.target.value)}
                    placeholder="e.g., North elevation"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location2">Location 2 *</Label>
                  <Input
                    id="location2"
                    value={formData.location2}
                    onChange={(e) => handleInputChange("location2", e.target.value)}
                    placeholder="e.g., Kitchen"
                    required
                  />
                </div>
              </div>

              {/* Item Use & Material */}
              <div className="space-y-2">
                <Label htmlFor="itemUse">Item Use *</Label>
                <Input
                  id="itemUse"
                  value={formData.itemUse}
                  onChange={(e) => handleInputChange("itemUse", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materialType">Material Type *</Label>
                <Select
                  value={formData.materialType}
                  onValueChange={(v) => handleInputChange("materialType", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-auto">
                    {MATERIAL_TYPES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sample Info */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Sample Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="sampleStatus">Sample Status *</Label>
                  <Select
                    value={formData.sampleStatus}
                    onValueChange={(v) => handleInputChange("sampleStatus", v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sample">Sample</SelectItem>
                      <SelectItem value="Similar to Sample">Similar to Sample</SelectItem>
                      <SelectItem value="Not Sampled">Not Sampled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(formData.sampleStatus === "Sample" ||
                  formData.sampleStatus === "Similar to Sample") && (
                  <div className="space-y-2">
                    <Label htmlFor="sampleReference">Sample Reference</Label>
                    <Input
                      id="sampleReference"
                      value={formData.sampleReference}
                      onChange={(e) => handleInputChange("sampleReference", e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Size & Quantity */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Size & Quantity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleInputChange("quantity", e.target.valueAsNumber)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(v) => handleInputChange("unit", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m²">m²</SelectItem>
                        <SelectItem value="pieces">pieces</SelectItem>
                        <SelectItem value="lineal meters">lineal meters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["length", "width", "diameter", "thickness"].map((dim) => (
                    <div key={dim}>
                      <Label htmlFor={dim}>{dim.charAt(0).toUpperCase() + dim.slice(1)}</Label>
                      <Input
                        id={dim}
                        type="number"
                        step="0.01"
                        value={(formData as any)[dim]}
                        onChange={(e) =>
                          handleInputChange(dim as any, e.target.valueAsNumber)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Condition Assessment */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Condition Assessment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {["painted", "friable", "warningLabelsVisible"].map((field) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Checkbox
                          id={field}
                          checked={(formData as any)[field] === true}
                          onCheckedChange={(checked) =>
                            handleInputChange(
                              field as any,
                              checked ? true : (formData as any)[field] === true ? null : false
                            )
                          }
                        />
                        <Label htmlFor={field}>
                          {field === "warningLabelsVisible"
                            ? "Warning Labels Visible"
                            : field.charAt(0).toUpperCase() + field.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="condition">Condition *</Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(v) => handleInputChange("condition", v as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="accessibility">Accessibility *</Label>
                      <Select
                        value={formData.accessibility}
                        onValueChange={(v) => handleInputChange("accessibility", v as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select access" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Accessible">Accessible</SelectItem>
                          <SelectItem value="Limited Access">Limited Access</SelectItem>
                          <SelectItem value="Generally Inaccessible">
                            Generally Inaccessible
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk & Recommendation */}
              <div>
                <Label htmlFor="riskLevel">Risk Level *</Label>
                <Select
                  value={formData.riskLevel}
                  onValueChange={(v) => handleInputChange("riskLevel", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recommendation">Recommended Actions *</Label>
                {survey && (
                  <RecommendationSelect
                    documentType={survey.documentType}
                    value={formData.recommendation}
                    onValueChange={(v) => handleInputChange("recommendation", v)}
                  />
                )}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </div>

              {/* Photos & References */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Photos & References
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTakePhoto}
                    disabled={isCapturing}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    {isCapturing ? "Taking…" : "Take Photo"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("photo-upload")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Button>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPhoto}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPhotoReference}
                    className="flex items-center gap-2"
                  >
                    <Hash className="h-4 w-4" />
                    Add Reference
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {photos.map((id) => (
                    <img
                      key={id}
                      src={getPhoto(id) || ''}
                      alt="Item"
                      className="h-12 w-12 object-cover rounded"
                    />
                  ))}
                  {photoReferences.map((ref, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="cursor-pointer text-xs"
                      onClick={() =>
                        setPhotoReferences((p) => p.filter((_, idx) => idx !== i))
                      }
                    >
                      Ref: {ref} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Save className="h-4 w-4 mr-2" />
                Save & Add Another
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}