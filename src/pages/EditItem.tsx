import { useState, useEffect } from "react";
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
import { RecommendationSelect } from "@/components/RecommendationSelect";
import { Save, Camera, Package, Building2, AlertTriangle, Upload, Hash } from "lucide-react";
import { saveItem, generateId, getRoomsBySurveyId, getSurveyById, getItems } from "@/utils/storage";
import { capturePhoto, resizeImage, blobToDataURL } from "@/utils/camera";
import { savePhoto } from "@/utils/storage";
import { Item } from "@/types/survey";
import { useToast } from "@/hooks/use-toast";

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

export default function EditItem() {
  const { surveyId, itemId } = useParams<{ surveyId: string; itemId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<any>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoReferences, setPhotoReferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    if (!surveyId || !itemId) return;
    
    const surveyData = getSurveyById(surveyId);
    setSurvey(surveyData);
    
    // Load existing item data
    const items = getItems();
    const item = items.find(i => i.itemId === itemId);
    
    if (item) {
      setFormData({
        buildingArea: item.buildingArea,
        externalInternal: item.externalInternal,
        location1: item.location1,
        location2: item.location2,
        itemUse: item.itemUse,
        materialType: item.materialType,
        sampleStatus: item.sampleStatus,
        sampleReference: item.sampleReference || '',
        quantity: item.quantity?.toString() || '',
        unit: item.unit || '',
        length: item.length?.toString() || '',
        width: item.width?.toString() || '',
        diameter: item.diameter?.toString() || '',
        thickness: item.thickness?.toString() || '',
        painted: item.painted,
        friable: item.friable,
        condition: item.condition,
        accessibility: item.accessibility,
        warningLabelsVisible: item.warningLabelsVisible,
        riskLevel: item.riskLevel,
        recommendation: item.recommendation,
        notes: item.notes || '',
      });
      setPhotos(item.photos || []);
      setPhotoReferences(item.photoReferences || []);
    }
    
    setLoading(false);
  }, [surveyId, itemId]);

  const handleInputChange = (field: string, value: string | number | boolean | null | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTakePhoto = async () => {
    setIsCapturing(true);
    try {
      const blob = await capturePhoto();
      const dataUrl = await blobToDataURL(blob);
      const resized = await resizeImage(dataUrl, 1024, 0.8);
      const photoId = generateId();
      
      savePhoto(photoId, resized);
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

    if (!surveyId || !itemId) return;

    // Get existing item to preserve original data
    const items = getItems();
    const existingItem = items.find(i => i.itemId === itemId);
    
    if (!existingItem) {
      toast({
        title: "Error",
        description: "Item not found",
        variant: "destructive",
      });
      return;
    }

    const updatedItem: Item = {
      ...existingItem,
      buildingArea: formData.buildingArea,
      externalInternal: formData.externalInternal,
      location1: formData.location1,
      location2: formData.location2,
      itemUse: formData.itemUse,
      materialType: formData.materialType,
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
    };

    saveItem(updatedItem);
    
    toast({
      title: "Item updated",
      description: "Item saved successfully",
    });
    
    navigate(`/survey/${surveyId}`);
  };

  if (loading || !survey) {
    return <div className="min-h-screen bg-background"></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Edit Item"
        showBack={true}
        actions={
          <Button 
            onClick={() => navigate(`/survey/${surveyId}`)}
            variant="outline"
            size="sm"
          >
            Cancel
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
              Edit Item Details
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

              {/* Quantity and Dimensions */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Quantity & Dimensions</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m2">m2</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                        <SelectItem value="item">item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (mm)</Label>
                    <Input
                      id="length"
                      type="number"
                      value={formData.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                      placeholder="Enter length"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Width (mm)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={formData.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                      placeholder="Enter width"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diameter">Diameter (mm)</Label>
                    <Input
                      id="diameter"
                      type="number"
                      value={formData.diameter}
                      onChange={(e) => handleInputChange('diameter', e.target.value)}
                      placeholder="Enter diameter"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thickness">Thickness (mm)</Label>
                    <Input
                      id="thickness"
                      type="number"
                      value={formData.thickness}
                      onChange={(e) => handleInputChange('thickness', e.target.value)}
                      placeholder="Enter thickness"
                    />
                  </div>
                </div>
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

              {/* Condition Assessment */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Condition Assessment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="painted"
                      checked={formData.painted === true}
                      onCheckedChange={(checked) => handleInputChange('painted', checked === true ? true : (checked === false ? false : null))}
                    />
                    <Label htmlFor="painted">Painted</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="friable"
                      checked={formData.friable === true}
                      onCheckedChange={(checked) => handleInputChange('friable', checked === true ? true : (checked === false ? false : null))}
                    />
                    <Label htmlFor="friable">Friable</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="warningLabelsVisible"
                      checked={formData.warningLabelsVisible === true}
                      onCheckedChange={(checked) => handleInputChange('warningLabelsVisible', checked === true ? true : (checked === false ? false : null))}
                    />
                    <Label htmlFor="warningLabelsVisible">Warning labels visible</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
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
                    <Label htmlFor="accessibility">Accessibility *</Label>
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

              {/* Risk Assessment */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Risk Assessment</h3>
                
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
                  <Label htmlFor="recommendation">Recommended Action *</Label>
                  <RecommendationSelect 
                    documentType={survey?.documentType}
                    value={formData.recommendation}
                    onValueChange={(value) => handleInputChange('recommendation', value)}
                  />
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Photos & References</h3>
                
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTakePhoto}
                    disabled={isCapturing}
                  >
                    <Camera className="h-4 w-4" />
                    {isCapturing ? "Capturing..." : "Take Photo"}
                  </Button>
                  
                  <label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadPhoto}
                      className="hidden"
                    />
                  </label>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPhotoReference}
                  >
                    <Hash className="h-4 w-4" />
                    Add Reference
                  </Button>
                </div>

                {photos.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {photos.length} photo{photos.length !== 1 ? 's' : ''} captured
                  </div>
                )}

                {photoReferences.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Photo References:</p>
                    <div className="flex flex-wrap gap-2">
                      {photoReferences.map((ref, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => removePhotoReference(index)}
                        >
                          {ref} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or observations..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Save className="h-4 w-4" />
                Update Item
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
