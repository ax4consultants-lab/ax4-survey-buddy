import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
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
    clientName: '',
    siteContactName: '',
    siteContactPhone: '',
    surveyType: '' as Survey['surveyType'] | '',
    documentType: '' as Survey['documentType'] | '',
    surveyor: '',
  });
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobId || !formData.siteName || !formData.clientName || !formData.surveyType || !formData.documentType || !formData.surveyor) {
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
      clientName: formData.clientName,
      siteContactName: formData.siteContactName || undefined,
      siteContactPhone: formData.siteContactPhone || undefined,
      surveyType: formData.surveyType as Survey['surveyType'],
      documentType: formData.documentType as Survey['documentType'],
      surveyor: formData.surveyor,
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
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteContactName">Site Contact Name</Label>
                  <Input
                    id="siteContactName"
                    value={formData.siteContactName}
                    onChange={(e) => handleInputChange('siteContactName', e.target.value)}
                    placeholder="Contact person name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteContactPhone">Site Contact Phone</Label>
                  <Input
                    id="siteContactPhone"
                    value={formData.siteContactPhone}
                    onChange={(e) => handleInputChange('siteContactPhone', e.target.value)}
                    placeholder="Phone number"
                    type="tel"
                  />
                </div>
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
                <Label htmlFor="documentType">Document Type *</Label>
                <Select value={formData.documentType} onValueChange={(value) => handleInputChange('documentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AMPR">Asbestos Management Plan and Register (AMPR)</SelectItem>
                    <SelectItem value="AMPRU">Asbestos Management Plan and Register Update (AMPRU)</SelectItem>
                    <SelectItem value="ARRA">Asbestos Register and Risk Assessment (ARRA)</SelectItem>
                    <SelectItem value="ARRAU">Asbestos Register and Risk Assessment Update (ARRAU)</SelectItem>
                    <SelectItem value="HSMR">Pre-Demolition Survey (Hazardous Materials Survey Report) (HSMR)</SelectItem>
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