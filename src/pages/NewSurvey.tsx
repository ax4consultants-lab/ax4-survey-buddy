import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveSurvey, generateId } from "@/utils/storage";
import { Survey } from "@/types/survey";
import { useToast } from "@/hooks/use-toast";

export default function NewSurvey() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    jobId: '',
    siteName: '',
    surveyType: '' as Survey['surveyType'] | '',
    surveyor: '',
    gpsCoordinates: '',
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your device doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });

      const { latitude, longitude } = position.coords;
      const coordinates = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      handleInputChange('gpsCoordinates', coordinates);
      
      toast({
        title: "Location captured",
        description: "GPS coordinates added to survey",
      });
    } catch (error) {
      toast({
        title: "Location error",
        description: "Unable to get current location",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobId || !formData.siteName || !formData.surveyType || !formData.surveyor) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const survey: Survey = {
      surveyId: generateId(),
      jobId: formData.jobId,
      siteName: formData.siteName,
      surveyType: formData.surveyType as Survey['surveyType'],
      surveyor: formData.surveyor,
      gpsCoordinates: formData.gpsCoordinates || undefined,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveSurvey(survey);
    
    toast({
      title: "Survey created",
      description: "Ready to add rooms and items",
    });
    
    navigate(`/survey/${survey.surveyId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="New Survey" 
        showBack={true}
      />
      
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Survey Details</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobId">Job ID *</Label>
                <Input
                  id="jobId"
                  value={formData.jobId}
                  onChange={(e) => handleInputChange('jobId', e.target.value)}
                  placeholder="e.g., AX4-2024-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name *</Label>
                <Input
                  id="siteName"
                  value={formData.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  placeholder="e.g., 123 Main Street, Adelaide"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="surveyType">Survey Type *</Label>
                <Select value={formData.surveyType} onValueChange={(value) => handleInputChange('surveyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select survey type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-Sale">Pre-Sale</SelectItem>
                    <SelectItem value="Demolition">Demolition</SelectItem>
                    <SelectItem value="Re-Inspection">Re-Inspection</SelectItem>
                    <SelectItem value="Workplace">Workplace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="surveyor">Surveyor *</Label>
                <Input
                  id="surveyor"
                  value={formData.surveyor}
                  onChange={(e) => handleInputChange('surveyor', e.target.value)}
                  placeholder="Enter surveyor name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gpsCoordinates">GPS Coordinates</Label>
                <div className="flex gap-2">
                  <Input
                    id="gpsCoordinates"
                    value={formData.gpsCoordinates}
                    onChange={(e) => handleInputChange('gpsCoordinates', e.target.value)}
                    placeholder="Latitude, Longitude"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                  >
                    <MapPin className="h-4 w-4" />
                    {isLoadingLocation ? 'Getting...' : 'Get Location'}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                variant="professional"
                size="lg"
              >
                <Save className="h-4 w-4" />
                Create Survey
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}