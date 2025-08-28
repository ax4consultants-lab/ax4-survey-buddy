import { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveSurvey, generateId } from "@/utils/storage";
import { Survey } from "@/schemas";
import { useToast } from "@/hooks/use-toast";
import { saveDraft, loadDraft, removeDraft } from "@/utils/draftStorage";
import { cn } from "@/lib/utils";

export default function NewSurvey() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const draftKey = 'new-survey';
  
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

  const [initialFormData] = useState(formData);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);

  // Required field validation
  const requiredFields = ['jobId', 'siteName', 'clientName', 'siteContactName'];
  const isValidForm = requiredFields.every(field => formData[field as keyof typeof formData].trim() !== '');
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
  const canSave = isValidForm && formData.surveyType && formData.documentType && formData.surveyor;

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft(draftKey);
    if (draft) {
      setFormData(draft);
      toast({
        title: "Draft restored",
        description: "Your previous form data has been restored",
      });
    }
  }, [toast]);

  // Auto-save draft every 5 seconds of inactivity
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Object.values(formData).some(value => value !== '') && hasChanges) {
        saveDraft(draftKey, formData);
        setLastSaveTime(Date.now());
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [formData, hasChanges]);

  // Show last save time
  const lastSaveMessage = useMemo(() => {
    if (!lastSaveTime) return '';
    const minutes = Math.floor((Date.now() - lastSaveTime) / (1000 * 60));
    return minutes === 0 ? 'Saved just now' : `Last saved ${minutes}m ago`;
  }, [lastSaveTime]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSave) {
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData].trim());
      toast({
        title: "Missing required fields",
        description: `Please complete: ${missingFields.join(', ')}`,
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
    removeDraft(draftKey);
    
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
            <CardTitle className="flex items-center justify-between">
              <span>Survey Details</span>
              {lastSaveMessage && (
                <span className="text-xs text-muted-foreground font-normal">
                  {lastSaveMessage}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobId" className="flex items-center gap-1">
                  Job ID 
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="jobId"
                  value={formData.jobId}
                  onChange={(e) => handleInputChange('jobId', e.target.value)}
                  placeholder="e.g., AX4-2024-001"
                  className={cn(
                    "min-h-12",
                    !formData.jobId.trim() && "border-destructive/50"
                  )}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteName" className="flex items-center gap-1">
                  Site Name 
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="siteName"
                  value={formData.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  placeholder="e.g., 123 Main Street, Adelaide"
                  className={cn(
                    "min-h-12",
                    !formData.siteName.trim() && "border-destructive/50"
                  )}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName" className="flex items-center gap-1">
                  Client Name 
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Enter client name"
                  className={cn(
                    "min-h-12",
                    !formData.clientName.trim() && "border-destructive/50"
                  )}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteContactName" className="flex items-center gap-1">
                    Site Contact Name 
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="siteContactName"
                    value={formData.siteContactName}
                    onChange={(e) => handleInputChange('siteContactName', e.target.value)}
                    placeholder="Contact person name"
                    className={cn(
                      "min-h-12",
                      !formData.siteContactName.trim() && "border-destructive/50"
                    )}
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
                    className="min-h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="surveyType" className="flex items-center gap-1">
                  Survey Type 
                  <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.surveyType} onValueChange={(value) => handleInputChange('surveyType', value)}>
                  <SelectTrigger className="min-h-12">
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
                <Label htmlFor="documentType" className="flex items-center gap-1">
                  Document Type 
                  <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.documentType} onValueChange={(value) => handleInputChange('documentType', value)}>
                  <SelectTrigger className="min-h-12">
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
                <Label htmlFor="surveyor" className="flex items-center gap-1">
                  Surveyor 
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="surveyor"
                  value={formData.surveyor}
                  onChange={(e) => handleInputChange('surveyor', e.target.value)}
                  placeholder="Enter surveyor name"
                  className="min-h-12"
                  required
                />
              </div>

              {!canSave && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">
                    Please complete all required fields to continue
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Button 
                  type="submit" 
                  className="w-full min-h-12" 
                  variant="professional"
                  size="lg"
                  disabled={!canSave}
                >
                  <Save className="h-4 w-4" />
                  Save and Continue
                </Button>
                
                <Button 
                  type="button"
                  onClick={() => navigate('/')}
                  variant="ghost" 
                  className="w-full min-h-12"
                >
                  Back to Dashboard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}