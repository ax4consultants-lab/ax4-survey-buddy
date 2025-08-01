import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveSurvey, generateId } from "@/utils/storage";
import { Survey } from "@/types/survey";
import { useToast } from "@/hooks/use-toast";
import { surveySchema, SurveyFormData } from "@/schemas/survey";
import { saveDraft, loadDraft, removeDraft } from "@/utils/draftStorage";

export default function NewSurvey() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const draftKey = 'new-survey';
  
  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      jobId: '',
      siteName: '',
      clientName: '',
      siteContactName: '',
      siteContactPhone: '',
      surveyor: '',
    }
  });

  const { watch } = form;
  const formValues = watch();

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft(draftKey);
    if (draft) {
      form.reset(draft);
      toast({
        title: "Draft restored",
        description: "Your previous form data has been restored",
      });
    }
  }, [form, toast]);

  // Auto-save draft
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Object.values(formValues).some(value => value !== '')) {
        saveDraft(draftKey, formValues);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formValues]);

  const onSubmit = (data: SurveyFormData) => {
    const survey: Survey = {
      surveyId: generateId(),
      jobId: data.jobId,
      siteName: data.siteName,
      clientName: data.clientName,
      siteContactName: data.siteContactName || undefined,
      siteContactPhone: data.siteContactPhone || undefined,
      surveyType: data.surveyType,
      documentType: data.documentType,
      surveyor: data.surveyor,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveSurvey(survey);
    removeDraft(draftKey); // Clear draft after successful save
    
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="jobId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., AX4-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 123 Main Street, Adelaide" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="siteContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact person name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="siteContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="surveyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Survey Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select survey type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pre-Sale">Pre-Sale</SelectItem>
                          <SelectItem value="Demolition">Demolition</SelectItem>
                          <SelectItem value="Re-Inspection">Re-Inspection</SelectItem>
                          <SelectItem value="Workplace">Workplace</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AMPR">Asbestos Management Plan and Register (AMPR)</SelectItem>
                          <SelectItem value="AMPRU">Asbestos Management Plan and Register Update (AMPRU)</SelectItem>
                          <SelectItem value="ARRA">Asbestos Register and Risk Assessment (ARRA)</SelectItem>
                          <SelectItem value="ARRAU">Asbestos Register and Risk Assessment Update (ARRAU)</SelectItem>
                          <SelectItem value="HSMR">Pre-Demolition Survey (Hazardous Materials Survey Report) (HSMR)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="surveyor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surveyor *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter surveyor name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}