import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RecommendationSelect } from "@/components/RecommendationSelect";
import { Save, Camera, Package, Building2, AlertTriangle, Upload, Hash } from "lucide-react";
import { saveItem, generateId, getRoomsBySurveyId, getSurveyById } from "@/utils/storage";
import { capturePhoto, resizeImage } from "@/utils/camera";
import { savePhoto } from "@/utils/storage";
import { Item } from "@/types/survey";
import { useToast } from "@/hooks/use-toast";
import { itemSchema, ItemFormData } from "@/schemas/survey";
import { saveDraft, loadDraft, removeDraft } from "@/utils/draftStorage";

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
  "Possible internal components"
];

export default function AddItem() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<any>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoReferences, setPhotoReferences] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    buildingArea: '',
    externalInternal: 'Not Specified' as Item['externalInternal'],
    location1: '',
    location2: '',
    itemUse: '',
    materialType: '',
    sampleStatus: 'Not Sampled' as Item['sampleStatus'],
    sampleReference: '',
    quantity: '',
    unit: '' as Item['unit'],
    length: '',
    width: '',
    diameter: '',
    thickness: '',
    painted: null as boolean | null,
    friable: null as boolean | null,
    condition: '' as Item['condition'],
    accessibility: '' as Item['accessibility'],
    warningLabelsVisible: null as boolean | null,
    riskLevel: 'Low' as Item['riskLevel'],
    recommendation: '',
    notes: '',
  });

  const draftKey = `add-item-${surveyId}`;

  useEffect(() => {
    if (!surveyId) return;
    
    const surveyData = getSurveyById(surveyId);
    setSurvey(surveyData);
  }, [surveyId]);

  // Load draft on mount
  useEffect(() => {
    if (!surveyId) return;
    
    const draft = loadDraft(draftKey);
    if (draft) {
      setFormData(draft);
      toast({
        title: "Draft restored",
        description: "Your previous item data has been restored",
      });
    }
  }, [surveyId, toast, draftKey]);

  // Auto-save draft
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Object.values(formData).some(value => value !== '' && value !== null)) {
        saveDraft(draftKey, formData, surveyId);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData, draftKey, surveyId]);

  const handleInputChange = (field: string, value: string | number | boolean | null | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTakePhoto = async () => {
    setIsCapturing(true);
    try {
      const photoData = await capturePhoto();
      const resizedPhoto = await resizeImage(photoData, 1024, 0.8);
      const photoId = generateId();
      
      savePhoto(photoId, resizedPhoto);
      setPhotos(prev => [...prev, photoId]);
      
      toast({
        title: "Photo captured",
        description: "Photo added to item",
      });
    } catch (error) {
      toast({
        title: "Photo error",
        description: "Failed to capture photo",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleUploadPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const photoData = e.target?.result as string;
        const resizedPhoto = await resizeImage(photoData, 1024, 0.8);
        const photoId = generateId();
        
        savePhoto(photoId, resizedPhoto);
        setPhotos(prev => [...prev, photoId]);
        
        toast({
          title: "Photo uploaded",
          description: "Photo added to item",
        });
      } catch (error) {
        toast({
          title: "Upload error",
          description: "Failed to process uploaded photo",
          variant: "destructive",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhotoReference = () => {
    const reference = prompt("Enter photo reference number:");
    if (reference && reference.trim()) {
      setPhotoReferences(prev => [...prev, reference.trim()]);
      toast({
        title: "Reference added",
        description: "Photo reference number added",
      });
    }
  };

  const removePhotoReference = (index: number) => {
    setPhotoReferences(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = ['buildingArea', 'location1', 'location2', 'itemUse', 'materialType', 'condition', 'accessibility', 'riskLevel', 'recommendation'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!surveyId) return;

    const item: Item = {
      itemId: generateId(),
      surveyId: surveyId!,
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
      quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
      unit: formData.unit || undefined,
      length: formData.length ? parseFloat(formData.length) : undefined,
      width: formData.width ? parseFloat(formData.width) : undefined,
      diameter: formData.diameter ? parseFloat(formData.diameter) : undefined,
      thickness: formData.thickness ? parseFloat(formData.thickness) : undefined,
      painted: formData.painted,
      friable: formData.friable,
      condition: formData.condition,
      accessibility: formData.accessibility,
      warningLabelsVisible: formData.warningLabelsVisible,
      riskLevel: formData.riskLevel,
      recommendation: formData.recommendation,
      notes: formData.notes || undefined,
      photos,
      photoReferences,
      createdAt: new Date().toISOString(),
    };

    saveItem(item);
    removeDraft(draftKey);
    
    toast({
      title: "Item added",
      description: "Item recorded successfully",
    });
    
    // Reset form for next item
    setFormData({
      buildingArea: '',
      externalInternal: 'Not Specified',
      location1: '',
      location2: '',
      itemUse: '',
      materialType: '',
      sampleStatus: 'Not Sampled',
      sampleReference: '',
      quantity: '',
      unit: '',
      length: '',
      width: '',
      diameter: '',
      thickness: '',
      painted: null,
      friable: null,
      condition: '',
      accessibility: '',
      warningLabelsVisible: null,
      riskLevel: 'Low',
      recommendation: '',
      notes: '',
    });
    setPhotos([]);
    setPhotoReferences([]);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-risk-high text-white';
      case 'Medium': return 'bg-risk-medium text-white';
      case 'Low': return 'bg-risk-low text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!survey) {
    return <div className="min-h-screen bg-background"></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Add Item"
        showBack={true}
        actions={
          <Button 
            onClick={() => navigate(`/survey/${surveyId}`)}
            variant="outline"
            size="sm"
          >
            Finish Survey
          </Button>
        }
      />
      
      <div className="container mx-auto p-4 max-w-2xl">
        {/* Survey Context */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{survey.siteName}</p>
                <p className="text-sm text-muted-foreground">Client: {survey.clientName}</p>
                <p className="text-xs text-muted-foreground">Document Type: {survey.documentType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Item Details
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Hierarchical Location Structure */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Location Hierarchy</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="buildingArea">Building or Area (e.g., Main Residence, Yard, Building 1) *</Label>
                  <Input
                    id="buildingArea"
                    value={formData.buildingArea}
                    onChange={(e) => handleInputChange('buildingArea', e.target.value)}
                    placeholder="e.g., Main Residence, Granny Flat, Building 1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="externalInternal">External or Internal</Label>
                  <Select value={formData.externalInternal} onValueChange={(value) => handleInputChange('externalInternal', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="External">External</SelectItem>
                      <SelectItem value="Internal">Internal</SelectItem>
                      <SelectItem value="Not Specified">Not Specified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location1">Location 1 (e.g., Elevations if External, Sections if Internal) *</Label>
                  <Input
                    id="location1"
                    value={formData.location1}
                    onChange={(e) => handleInputChange('location1', e.target.value)}
                    placeholder={formData.externalInternal === 'External' ? "e.g., North elevation, East wall" : "e.g., Ground floor, Basement"}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location2">Location 2 (e.g., Rooms or Specific Area) *</Label>
                  <Input
                    id="location2"
                    value={formData.location2}
                    onChange={(e) => handleInputChange('location2', e.target.value)}
                    placeholder="e.g., Kitchen, Bathroom, Under eaves"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemUse">Item Use (e.g., cladding, lining, splash-back, floor covering) *</Label>
                <Input
                  id="itemUse"
                  value={formData.itemUse}
                  onChange={(e) => handleInputChange('itemUse', e.target.value)}
                  placeholder="e.g., cladding, lining, splash-back, floor covering"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="materialType">Material Type *</Label>
                <Select value={formData.materialType} onValueChange={(value) => handleInputChange('materialType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {MATERIAL_TYPES.map((material) => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              {/* Sample Status */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Sample Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="sampleStatus">Sample Status *</Label>
                  <Select value={formData.sampleStatus} onValueChange={(value) => handleInputChange('sampleStatus', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sample status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sample">Sample</SelectItem>
                      <SelectItem value="Similar to Sample">Similar to Sample</SelectItem>
                      <SelectItem value="Not Sampled">Not Sampled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.sampleStatus === 'Sample' || formData.sampleStatus === 'Similar to Sample') && (
                  <div className="space-y-2">
                    <Label htmlFor="sampleReference">Sample Reference (e.g., Sample 1, Sample 2)</Label>
                    <Input
                      id="sampleReference"
                      value={formData.sampleReference}
                      onChange={(e) => handleInputChange('sampleReference', e.target.value)}
                      placeholder="e.g., Sample 1, Sample 2"
                    />
                  </div>
                )}
              </div>

              {/* Size and Quantity Measurements */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Size & Quantity</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      placeholder="e.g., 10, 2.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m2">m² (square meters)</SelectItem>
                        <SelectItem value="pieces">pieces</SelectItem>
                        <SelectItem value="lineal meters">lineal meters</SelectItem>
                        <SelectItem value="length">length (meters)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (m)</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.01"
                      value={formData.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                      placeholder="e.g., 2.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Width (m)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.01"
                      value={formData.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                      placeholder="e.g., 1.2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diameter">Diameter (m)</Label>
                    <Input
                      id="diameter"
                      type="number"
                      step="0.01"
                      value={formData.diameter}
                      onChange={(e) => handleInputChange('diameter', e.target.value)}
                      placeholder="e.g., 0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thickness">Thickness (mm)</Label>
                    <Input
                      id="thickness"
                      type="number"
                      step="0.1"
                      value={formData.thickness}
                      onChange={(e) => handleInputChange('thickness', e.target.value)}
                      placeholder="e.g., 6.0"
                    />
                  </div>
                </div>
              </div>

              {/* Condition Assessment */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Condition Assessment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="painted"
                        checked={formData.painted === true}
                        onCheckedChange={(checked) => handleInputChange('painted', checked ? true : formData.painted === true ? null : false)}
                      />
                      <Label htmlFor="painted">Painted</Label>
                      {formData.painted === false && (
                        <span className="text-sm text-muted-foreground">(Not painted)</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="friable"
                        checked={formData.friable === true}
                        onCheckedChange={(checked) => handleInputChange('friable', checked ? true : formData.friable === true ? null : false)}
                      />
                      <Label htmlFor="friable">Friable</Label>
                      {formData.friable === false && (
                        <span className="text-sm text-muted-foreground">(Not friable)</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="warningLabelsVisible"
                        checked={formData.warningLabelsVisible === true}
                        onCheckedChange={(checked) => handleInputChange('warningLabelsVisible', checked ? true : formData.warningLabelsVisible === true ? null : false)}
                      />
                      <Label htmlFor="warningLabelsVisible">Warning Labels Visible</Label>
                      {formData.warningLabelsVisible === false && (
                        <span className="text-sm text-muted-foreground">(Not visible)</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
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

                    <div className="space-y-2">
                      <Label htmlFor="accessibility">Accessibility</Label>
                      <Select value={formData.accessibility} onValueChange={(value) => handleInputChange('accessibility', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select accessibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Accessible">Accessible</SelectItem>
                          <SelectItem value="Limited Access">Limited Access</SelectItem>
                          <SelectItem value="Generally Inaccessible">Generally Inaccessible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Level */}
              <div className="space-y-2">
                <Label htmlFor="riskLevel">Risk Level *</Label>
                <Select value={formData.riskLevel} onValueChange={(value) => handleInputChange('riskLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendation">Recommended Actions *</Label>
                {survey && (
                  <RecommendationSelect
                    documentType={survey.documentType}
                    value={formData.recommendation}
                    onValueChange={(value) => handleInputChange('recommendation', value)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (e.g., friability details, accessibility issues)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about condition, friability, accessibility, etc."
                />
              </div>

              {/* Photo Section */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Photos & References</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTakePhoto}
                    disabled={isCapturing}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    {isCapturing ? 'Taking...' : 'Take Photo'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload')?.click()}
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

                {(photos.length > 0 || photoReferences.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {photos.length > 0 && (
                      <Badge variant="outline">
                        {photos.length} photo{photos.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {photoReferences.map((ref, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removePhotoReference(index)}>
                        Ref: {ref} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                variant="professional"
                size="lg"
              >
                <Save className="h-4 w-4" />
                Save Item & Add Another
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}