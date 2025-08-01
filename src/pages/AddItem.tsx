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
import { Save, Camera, Package, Building2, AlertTriangle } from "lucide-react";
import { saveItem, generateId, getRoomsBySurveyId, getSurveyById } from "@/utils/storage";
import { capturePhoto, resizeImage } from "@/utils/camera";
import { savePhoto } from "@/utils/storage";
import { Item } from "@/types/survey";
import { useToast } from "@/hooks/use-toast";

const MATERIAL_TYPES = [
  'fibrous cement sheet',
  'fibrous cement plank',
  'fibrous cement "thick" sheet',
  'fibre impregnated bituminous membrane tanking ("Malthoid")',
  'fibre impregnated tar based glue ("Black-Jack")',
  'fibre impregnated resin boards ("Zelemite" or "Ausbestos")',
  'fibre impregnated tar coating to metal sheeting ("Galbestos")',
  'fibre impregnated plastic ("Bakelite")',
  'pressed asbestos board ("Millboard")',
  'vinyl floor tiles',
  'fibre backed vinyl floor sheeting',
  'electrical wire shielding',
  'lift electrical arc shields',
  'lift brake friction material',
  'woven fibre electrical arc shields',
  'fire doors (core material)',
  'cast pipe lagging',
  'asbestos rope',
  'penetration packing material',
  'fire rating (Limpet)',
  'gaskets material',
  'joint sealant ("Mastic")',
  'possible internal components'
];

export default function AddItem() {
  const { surveyId, roomId } = useParams<{ surveyId: string; roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const [formData, setFormData] = useState({
    referenceNumber: '',
    photoReference: '',
    buildingArea: '',
    externalInternal: '' as Item['externalInternal'],
    location1: '',
    location2: '',
    itemUse: '',
    materialType: '',
    painted: null as boolean | null,
    friable: null as boolean | null,
    condition: '' as Item['condition'],
    accessibility: '' as Item['accessibility'],
    warningLabelsVisible: null as boolean | null,
    riskLevel: '' as Item['riskLevel'] | '',
    recommendation: '',
    warningLabelsAffixed: '',
    notes: '',
  });

  useEffect(() => {
    if (!surveyId || !roomId) return;
    
    const surveyData = getSurveyById(surveyId);
    const rooms = getRoomsBySurveyId(surveyId);
    const roomData = rooms.find(r => r.roomId === roomId);
    
    setSurvey(surveyData);
    setRoom(roomData);
  }, [surveyId, roomId]);

  const handleInputChange = (field: string, value: string | number | boolean | null) => {
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
      
      if (!formData.photoReference) {
        handleInputChange('photoReference', photoId);
      }
      
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = ['referenceNumber', 'buildingArea', 'externalInternal', 'location1', 'location2', 'itemUse', 'materialType', 'riskLevel', 'recommendation'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!roomId) return;

    const item: Item = {
      itemId: generateId(),
      roomId,
      referenceNumber: formData.referenceNumber,
      photoReference: formData.photoReference || undefined,
      buildingArea: formData.buildingArea,
      externalInternal: formData.externalInternal,
      location1: formData.location1,
      location2: formData.location2,
      itemUse: formData.itemUse,
      materialType: formData.materialType,
      painted: formData.painted,
      friable: formData.friable,
      condition: formData.condition,
      accessibility: formData.accessibility,
      warningLabelsVisible: formData.warningLabelsVisible,
      riskLevel: formData.riskLevel as Item['riskLevel'],
      recommendation: formData.recommendation,
      warningLabelsAffixed: formData.warningLabelsAffixed ? parseInt(formData.warningLabelsAffixed) : undefined,
      notes: formData.notes || undefined,
      photos,
      createdAt: new Date().toISOString(),
    };

    saveItem(item);
    
    toast({
      title: "Item added",
      description: "Item recorded successfully",
    });
    
    // Reset form for next item
    setFormData({
      referenceNumber: '',
      photoReference: '',
      buildingArea: '',
      externalInternal: '',
      location1: '',
      location2: '',
      itemUse: '',
      materialType: '',
      painted: null,
      friable: null,
      condition: '',
      accessibility: '',
      warningLabelsVisible: null,
      riskLevel: '',
      recommendation: '',
      warningLabelsAffixed: '',
      notes: '',
    });
    setPhotos([]);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-risk-high text-white';
      case 'Medium': return 'bg-risk-medium text-white';
      case 'Low': return 'bg-risk-low text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!survey || !room) {
    return <div className="min-h-screen bg-background"></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title={`Add Item - ${room.roomName}`}
        showBack={true}
        actions={
          <Button 
            onClick={() => navigate(`/survey/${surveyId}`)}
            variant="outline"
            size="sm"
          >
            Finish Room
          </Button>
        }
      />
      
      <div className="container mx-auto p-4 max-w-2xl">
        {/* Room Context */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{room.roomName}</p>
                <p className="text-sm text-muted-foreground">{survey.siteName}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="referenceNumber">Reference Number *</Label>
                  <Input
                    id="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                    placeholder="e.g., A01, B05"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photoReference">Photo Reference</Label>
                  <Input
                    id="photoReference"
                    value={formData.photoReference}
                    onChange={(e) => handleInputChange('photoReference', e.target.value)}
                    placeholder="Optional photo ID"
                  />
                </div>
              </div>

              {/* Hierarchical Location Structure */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Location Hierarchy</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="buildingArea">1. Building/Area *</Label>
                  <Input
                    id="buildingArea"
                    value={formData.buildingArea}
                    onChange={(e) => handleInputChange('buildingArea', e.target.value)}
                    placeholder="e.g., Main Residence, Granny Flat, Building 1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="externalInternal">2. External/Internal *</Label>
                  <Select value={formData.externalInternal} onValueChange={(value) => handleInputChange('externalInternal', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="External">External</SelectItem>
                      <SelectItem value="Internal">Internal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location1">3. Location 1 - {formData.externalInternal === 'External' ? 'Elevations' : 'Sections'} *</Label>
                  <Input
                    id="location1"
                    value={formData.location1}
                    onChange={(e) => handleInputChange('location1', e.target.value)}
                    placeholder={formData.externalInternal === 'External' ? "e.g., North elevation, East wall" : "e.g., Ground floor, Basement"}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location2">4. Location 2 - Rooms/Specific Area *</Label>
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
                <Label htmlFor="itemUse">5. Item Use *</Label>
                <Input
                  id="itemUse"
                  value={formData.itemUse}
                  onChange={(e) => handleInputChange('itemUse', e.target.value)}
                  placeholder="e.g., cladding, lining, splash-back, floor covering"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="materialType">6. Material Type *</Label>
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

              {/* Condition Assessment */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">7. Condition Assessment</h3>
                
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

              <div className="space-y-2">
                <Label htmlFor="riskLevel">Risk Level *</Label>
                <Select value={formData.riskLevel} onValueChange={(value) => handleInputChange('riskLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-risk-low"></div>
                        Low Risk
                      </div>
                    </SelectItem>
                    <SelectItem value="Medium">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-risk-medium"></div>
                        Medium Risk
                      </div>
                    </SelectItem>
                    <SelectItem value="High">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-risk-high"></div>
                        High Risk
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formData.riskLevel && (
                  <Badge className={getRiskColor(formData.riskLevel)}>
                    {formData.riskLevel === 'High' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {formData.riskLevel} Risk
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendation">9. Recommendation *</Label>
                {survey && (
                  <RecommendationSelect
                    documentType={survey.documentType}
                    value={formData.recommendation}
                    onValueChange={(value) => handleInputChange('recommendation', value)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="warningLabelsAffixed">Warning Labels Affixed</Label>
                <Input
                  id="warningLabelsAffixed"
                  type="number"
                  value={formData.warningLabelsAffixed}
                  onChange={(e) => handleInputChange('warningLabelsAffixed', e.target.value)}
                  placeholder="Number of labels (optional)"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">8. Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about condition, friability, accessibility, etc."
                />
              </div>

              {/* Photo Section */}
              <div className="space-y-3">
                <Label>Photos</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTakePhoto}
                    disabled={isCapturing}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4" />
                    {isCapturing ? 'Taking Photo...' : 'Take Photo'}
                  </Button>
                  {photos.length > 0 && (
                    <Badge variant="outline" className="self-center">
                      {photos.length} photo{photos.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
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