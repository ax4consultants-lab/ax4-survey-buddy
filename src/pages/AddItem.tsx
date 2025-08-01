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
import { Save, Camera, Package, Building2, AlertTriangle } from "lucide-react";
import { saveItem, generateId, getRoomsBySurveyId, getSurveyById } from "@/utils/storage";
import { capturePhoto, resizeImage } from "@/utils/camera";
import { savePhoto } from "@/utils/storage";
import { Item } from "@/types/survey";
import { useToast } from "@/hooks/use-toast";

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
    locationDescription: '',
    itemDescription: '',
    materialType: '',
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

  const handleInputChange = (field: string, value: string | number) => {
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
    
    const requiredFields = ['referenceNumber', 'locationDescription', 'itemDescription', 'materialType', 'riskLevel', 'recommendation'];
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
      locationDescription: formData.locationDescription,
      itemDescription: formData.itemDescription,
      materialType: formData.materialType,
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
      locationDescription: '',
      itemDescription: '',
      materialType: '',
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

              <div className="space-y-2">
                <Label htmlFor="locationDescription">Location Description *</Label>
                <Textarea
                  id="locationDescription"
                  value={formData.locationDescription}
                  onChange={(e) => handleInputChange('locationDescription', e.target.value)}
                  placeholder="Detailed description of where the item is located"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemDescription">Item Description *</Label>
                <Input
                  id="itemDescription"
                  value={formData.itemDescription}
                  onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                  placeholder="e.g., Wall cladding, Floor tiles, Pipe lagging"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="materialType">Material Type *</Label>
                <Input
                  id="materialType"
                  value={formData.materialType}
                  onChange={(e) => handleInputChange('materialType', e.target.value)}
                  placeholder="e.g., Fibrous cement sheet, Vinyl floor tile"
                  required
                />
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
                <Label htmlFor="recommendation">Recommendation *</Label>
                <Textarea
                  id="recommendation"
                  value={formData.recommendation}
                  onChange={(e) => handleInputChange('recommendation', e.target.value)}
                  placeholder="Recommended action for this item"
                  required
                />
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
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes (friability, condition, accessibility, etc.)"
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